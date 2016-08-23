/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe */

(function ($, fluid) {

    "use strict";

    // A datasource grade using pouchDB via gpii-pouch
    fluid.defaults("floe.dashboard.dataSource.pouchDB", {
        gradeNames: ["kettle.dataSource"],
        components: {
            pouch: {
                type: "gpii.pouch",
                options: {
                    dbOptions: {
                        name: "{pouchDB}.options.dbOptions.name"
                    }
                }
            },
            // gpii-pouchdb returns POJOs, not JSON
            encoding: {
                type: "kettle.dataSource.encoding.none"
            }
        },
        invokers: {
            "getImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.getImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        dbOptions: {
            // name: DB name
        },
        readOnlyGrade: "floe.dashboard.dataSource.pouchDB"
    });

    // that, options, directModel
    floe.dashboard.dataSource.pouchDB.getImpl = function (that, options, _id) {
        console.log(arguments);
        options = options || {};
        return that.pouch.get(_id, options);
    };

    fluid.defaults("floe.dashboard.dataSource.pouchDB.writable", {
        gradeNames: ["kettle.dataSource.writable", "floe.dashboard.dataSource.pouchDB"],
        invokers: {
            "setImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.setImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        },
        readOnlyGrade: "floe.dashboard.dataSource.pouchDB",
        writable: true
    });

    floe.dashboard.dataSource.pouchDB.setImpl = function (that, options, _id) {
        options = options || {};
        return that.pouch.put(_id, options);
    };

    // Base grade for persistence of model components to Pouch
    // Implementing grades should ensure that what's integral to
    // reconstructing the particular instance is stored in the
    // model
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        components: {
            dataSource: {
                type: "floe.dashboard.dataSource.pouchDB.writable",
                options: {
                    dbOptions: "{pouchPersisted}.options.dbOptions"
                }
            }
        },
        events: {
            "onSetPouchId": null,
            "onPouchDocStored": "{dataSource}.pouch.events.onPutComplete",
            "onPouchDocDeleted": "{dataSource}.pouch.events.onRemoveComplete",
            // Event signatures of this event should include the retrieved
            // document
            "onPouchDocRetrieved": "{dataSource}.pouch.events.onGetComplete"
        },
        listeners: {
            "onCreate.setPouchId": {
                funcName: "{that}.setPouchId",
                args: "{that}"
            }
        },
        dbOptions: {
            // name: "test",
        },
        // Implementing grades can use these invokers in combinations with
        // events and listeners to store, retrieve and delete as
        // appropriate
        invokers: {
            // Implementing grades or instances that want a different ID
            // strategy should override this invoker
            "setPouchId": {
                funcName: "floe.dashboard.pouchPersisted.setPouchIdToCurrentTime",
                args: "{that}"
            },
            "get": {
                funcName: "floe.dashboard.pouchPersisted.get",
                args: ["{that}", "{arguments}.0"]
            },
            "set": {
                funcName: "floe.dashboard.pouchPersisted.set",
                args: "{that}"
            },
            "delete": {
                funcName: "floe.dashboard.pouchPersisted.del",
                args: "{that}"
            }
        }
    });

    // Set the ID to the timestamp to make filtering by time easier
    floe.dashboard.pouchPersisted.setPouchIdToCurrentTime = function (that) {
        that.applier.change("_id", that.model.timeEvents.created);
        that.events.onSetPouchId.fire();
    };

    // Sets the ID to a string
    floe.dashboard.pouchPersisted.setPouchIdToString = function (that, idString) {
        that.applier.change("_id", idString);
        that.events.onSetPouchId.fire();
    };

    // Tries to get the stored version of the document
    // Fires the document as argument to the retrieved event when retrieved
    // Fires an undefined if a matching document is not found
    //
    // retrievalOptions allows passing in the options documented at
    // https://pouchdb.com/api.html#fetch_document

    floe.dashboard.pouchPersisted.get = function (that, retrievalOptions) {
        retrievalOptions = retrievalOptions || {};
        var docId = that.model._id;

        that.dataSource.get(docId, retrievalOptions).then(function () {

        }, function () {

        });

        // that.dataSource.get(docId, retrievalOptions).then(
        //     function (retrievedDoc) {
        //         that.events.onPouchDocRetrieved.fire(retrievedDoc);
        // // Return undefined on a 404
        //     },
        //     function (err) {
        //         if (err.status === 404) {
        //             that.events.onPouchDocRetrieved.fire(undefined);
        //         }
        //     });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.set = function (that) {
        console.log(that);
        var doc = fluid.copy(that.model);
        var docId = that.model._id;

        that.dataSource.get(docId).then(
            function (retrievedDoc) {
                console.log("#1");
                // Update the doc if it exists
                doc._rev = retrievedDoc._rev;
                that.dataSource.set(doc).then(function () {
                    console.log("#2");
                });
                // Create the doc on a 404 (doesn't exist yet)
            },
            function (err) {
                console.log("#3", err);
                if (err.status === 404) {
                    that.dataSource.set(doc).then(function () {
                        console.log("#4");
                    }, function (err) {
                        console.log("#5", err);
                    });
                }
            });

    };

    // Delete the persisted document
    floe.dashboard.pouchPersisted.del = function (that) {
        var docId = that.model._id;
        that.dataSource.get(docId).then(function (doc) {
            that.dataSource.remove(doc).then(function () {
            });
        });
    };

})(jQuery, fluid);
