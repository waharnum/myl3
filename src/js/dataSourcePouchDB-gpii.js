/*!
Copyright 2016 OCAD university

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/GPII/universal/blob/master/LICENSE.txt
*/

/* eslint-env browser */
/* eslint strict: ["error", "function"] */
/* global require */

/*
Mildly adapted from https://github.com/cindyli/universal/blob/71594c2b444a7350f3cf6561d22cb301978ba290/gpii/node_modules/gpii-oauth2/gpii-oauth2-datastore/src/DataSource-pouchDB.js
*/

var fluid = fluid || require("infusion");
var gpii = fluid.registerNamespace("gpii");

(function () {

    "use strict";

    // The data source is to support the in-browser testing using pouchDB as the backend data storage.
    // It overrides default setImpl() and getImpl() provided by "kettle.dataSource.URL" with gpii.pouch API calls.
    // Note: This component requires an instance of gpii.pouch (see https://github.com/the-t-in-rtf/gpii-pouchdb/blob/GPII-1897/docs/pouchdb.md)
    // to be instantiated beforehand.
    fluid.defaults("gpii.dataSource.pouchDB", {
        gradeNames: ["kettle.dataSource.URL"],
        readOnlyGrade: "gpii.dataSource.pouchDB",
        dbViews: null,   // Supplied by integrators
        invokers: {
            getImpl: {
                funcName: "gpii.dataSource.pouchDB.handle",
                args: ["{that}", "{gpii.pouch}", "{arguments}.0", "{arguments}.1"] // options, directModel
            }
        },
        listeners: {
            onRead: [{
                funcName: "fluid.identity",
                namespace: "encoding"
            }]
        }
    });

    fluid.defaults("gpii.dataSource.pouchDB.writable", {
        gradeNames: ["kettle.dataSource.URL.writable"],
        invokers: {
            setImpl: {
                funcName: "gpii.dataSource.pouchDB.handle",
                args: ["{that}", "{gpii.pouch}", "{arguments}.0", "{arguments}.1", "{arguments}.2"] // options, directModel, data
            }
        },
        listeners: {
            onWrite: [{
                funcName: "fluid.identity",
                namespace: "encoding"
            }]
        }
    });

    fluid.makeGradeLinkage("gpii.dataSource.pouchDB.linkage", ["gpii.dataSource.writable", "gpii.dataSource.pouchDB"], "gpii.dataSource.pouchDB.writable");

    // Match the url with the _id field of the view list to determine if this url is to query by a view or an document id
    // The string to match is "_design/views" in case of the views definition for the auth server
    gpii.dataSource.pouchDB.isQueryView = function (dbViews, url) {
        var viewIdentifier = dbViews[0]._id;
        return url.indexOf(viewIdentifier) !== -1;
    };

    gpii.dataSource.pouchDB.handle = function (that, pouchDB, options, directModel, data) {
        var url = that.resolveUrl(that.options.requestUrl, that.options.termMap, directModel);
        return gpii.dataSource.pouchDB.handle.pouchDB(that, pouchDB, options, url, data);
    };

    // Decode the URL to find out the view/map function name and the parameters for this function.
    // Decoding an URL: /_design/views/_view/findAuthByClientCredentialsAccessToken?key=%22firstDiscovery_access_token%22&include_docs=true
    // outputs an object:
    // {
    //     viewName: "findAuthByClientCredentialsAccessToken",
    //     viewOptions: {
    //         key: "firstDiscovery_access_token",
    //         include_docs: true
    //     }
    // }
    gpii.dataSource.pouchDB.decodeView = function (url) {
        var match = url.match(/(.*)\/(.*)(\?(.*))?/);
        var view = match[2];
        var splitView = view.match(/(.*)\?(.*)/);

        if (splitView) {
            return {
                viewName: splitView[1],
                viewOptions: gpii.express.querystring.decode(splitView[2])
            };
        } else {
            return {
                viewName: view
            };
        }
    };

    /*
     * Strips out the leading "/" to return the document id.
     * @param url {String} An URL path.
     * @return {String} A string with the leading "/" being stripped.
     * In an example of the input "/user-1", returns "user-1".
     */
    gpii.dataSource.pouchDB.getDocId = function (url) {
        return url.substring(1);
    };

    gpii.dataSource.pouchDB.handle.pouchDB = function (that, pouchDB, options, url, data) {
        var dbViews = that.options.dbViews;
        var promiseTogo = fluid.promise();
        var id;

        // GET: Queries using a document id or view/map functions
        if (options.operation === "get") {
            var promiseQuery = fluid.promise();

            // Find out if the query is via a view or directly by a document id
            var isQueryView = gpii.dataSource.pouchDB.isQueryView(dbViews, url);

            if (isQueryView) {
                // A query by a view
                var decodedViewInfo = gpii.dataSource.pouchDB.decodeView(url);
                var viewList = dbViews[0].views;
                var viewFunc = viewList[decodedViewInfo.viewName];
                var viewOptions = decodedViewInfo.viewOptions || undefined;

                promiseQuery = pouchDB.query(viewFunc, viewOptions);
            } else {
                // A query by a document id
                id = gpii.dataSource.pouchDB.getDocId(url);
                promiseQuery = pouchDB.get(id);
            }

            // Handle the "notFoundIsEmpty" option to return undefined when no record is found
            promiseQuery.then(function (data) {
                promiseTogo.resolve(data);
            }, function (err) {
                if (options.notFoundIsEmpty && err.status === 404) {
                    promiseTogo.resolve(undefined);
                } else {
                    promiseTogo.reject(err);
                }
            });
        }

        // SET: save/update records, or delete them if the data is empty
        if (options.operation === "set") {

            // An empty object is a delete operation
            var isEmpty = fluid.keys(data).length <= 0;

            id = gpii.dataSource.pouchDB.getDocId(url);

            if (!data._id) {
                fluid.extend(data, {_id: id});
            }

            // Perform "get before set", match behaviour of
            // kettle.dataSource.CouchDB
            var getPromise = pouchDB.get(id);

            // Document exists
            getPromise.then(function (result) {
                // add or update document _rev to that of
                // the existing document
                data._rev = result._rev;
                // put or remove, depending on whether passed data is empty
                var action = isEmpty ? "remove" : "put";
                pouchDB[action](data).then(function (result) {
                    promiseTogo.resolve(result);
                }, function (err) {
                    promiseTogo.reject(err);
                });
            },
            // Create a new document on a 404 (document doesn't exist)
            // if we're doing a set operation; otherwise this is an error
            function (err) {
                if(err.status === 404 && !isEmpty) {
                    pouchDB.put(data).then(function (result) {
                        promiseTogo.resolve(result);
                    }, function (err) {
                        promiseTogo.reject(err);
                    });
                } else {
                    promiseTogo.reject(err);
                }
            });
        }

        return promiseTogo;
    };

})();
