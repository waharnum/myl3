/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe, PouchDB */

(function ($, fluid) {

    "use strict";

    // Base grade for persistence of model components to Pouch
    // Implementing grades should ensure that what's integral to
    // reconstructing the particular instance is stored in the
    // model
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        events: {
            "onSetPouchId": null,
            "onPouchDocStored": null,
            "onPouchDocDeleted": null,
            // Event signatures of this event should include the retrieved
            // document
            "onPouchDocRetrieved": null
        },
        listeners: {
            "onCreate.setPouchId": {
                funcName: "{that}.setPouchId",
                args: "{that}"
            }
        },
        dbOptions: {
            // localName: "test",
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
                funcName: "floe.dashboard.pouchPersisted.delete",
                args: "{that}"
            }
        }
    });

    // Set the ID to the timestamp to make filtering by time easier
    floe.dashboard.pouchPersisted.setPouchIdToCurrentTime = function (that) {
        that.model._id = that.model.timeEvents.created;
        that.events.onSetPouchId.fire();
    };

    // Sets the ID to a string
    floe.dashboard.pouchPersisted.setPouchIdToString = function (that, idString) {
        that.model._id = idString;
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
        var db = new PouchDB(that.options.dbOptions.localName);

        db.get(docId, retrievalOptions).then(
            function (retrievedDoc) {
                that.events.onPouchDocRetrieved.fire(retrievedDoc);
        // Return undefined on a 404
            },
            function (err) {
                if (err.status === 404) {
                    that.events.onPouchDocRetrieved.fire(undefined);
                }
            });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.set = function (that) {
        var doc = fluid.copy(that.model);
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.localName);
        db.get(docId).then(
            function (retrievedDoc) {
                // Update the doc if it exists
                doc._rev = retrievedDoc._rev;
                db.put(doc).then(function () {
                    that.events.onPouchDocStored.fire();
                });
                // Create the doc on a 404 (doesn't exist yet)
            },
            function (err) {
                if (err.status === 404) {
                    db.put(doc).then(function () {
                        that.events.onPouchDocStored.fire();
                    });
                }
            });

    };

    // Delete the persisted document
    floe.dashboard.pouchPersisted.delete = function (that) {
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.localName);
        db.get(docId).then(function (doc) {
            db.remove(doc).then(function () {
                that.events.onPouchDocDeleted.fire();
            });
        });
    };

    // A pouchPersisted grade that can sync to a CouchDB DB
    fluid.defaults("floe.dashboard.couchSyncing", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        dbOptions: {
            // remoteName: "http://localhost:5984/test"
        },
        invokers: {
            "remoteSync": {
                funcName: "floe.dashboard.couchSyncing.remoteSync",
                args: "{that}"
            }
        },
        listeners: {
            "onPouchDocStored.remoteSync": {
                funcName: "{that}.remoteSync"
            },
            "onPouchDocDeleted.remoteSync": {
                funcName: "{that}.remoteSync"
            }
        }
    });

    // Syncs to the remote
    floe.dashboard.couchSyncing.remoteSync = function (that) {
        // console.log("floe.dashboard.note.pouchPersisted.remoteSync");
        var localDB = new PouchDB(that.options.dbOptions.localName);
        var remoteDB = new PouchDB(that.options.dbOptions.remoteName);
        localDB.sync(remoteDB);
    };

})(jQuery, fluid);
