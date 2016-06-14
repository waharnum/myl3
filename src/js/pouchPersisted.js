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
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        model: {
            // Allows for reconstruction of a component with same model
            "persistenceInformation": {
                "typeName": "{that}.typeName"
            }
        },
        events: {
            // Event signature should include retrieved doc
            "onPouchDocRetrieved": null,
            "onPouchDocStored": null,
            "onPouchDocDeleted": null
        },
        listeners: {
            "onCreate.setPouchId": {
                funcName: "floe.dashboard.pouchPersisted.setPouchId",
                args: "{that}"
            }
        },
        dbOptions: {
            // localName: "test",
        },
        invokers: {
            "retrievePersisted": {
                funcName: "floe.dashboard.pouchPersisted.retrievePersisted",
                args: "{that}"
            },
            "storePersisted": {
                funcName: "floe.dashboard.pouchPersisted.storePersisted",
                args: "{that}"
            },
            "deletePersisted": {
                funcName: "floe.dashboard.pouchPersisted.deletePersisted",
                args: "{that}"
            }
        }
    });

    // A pouchPersisted grade that can sync to a CouchDB DB
    fluid.defaults("floe.dashboard.couchSyncing", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        dbOptions: {
            // remoteName: "http://localhost:5984/test"
        },
        invokers: {
            "remoteSync": {
                funcName: "floe.dashboard.couchSyncing",
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

    floe.dashboard.pouchPersisted.setPouchId = function (that) {
        that.model._id = that.model.timeEvents.created;
    };

    // Tries to get the stored version of the document
    // Fires the document as argument to the event when retrieved,
    // and also returns it
    floe.dashboard.pouchPersisted.retrievePersisted = function (that) {
        console.log("floe.dashboard.pouchPersisted.retrievePersisted");
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.localName);

        db.get(docId).then(
            function (retrievedDoc) {
                that.events.onPouchDocRetrieved.fire(retrievedDoc);
                return retrievedDoc;
        // Return undefined on a 404
            },
            function (err) {
                if (err.status === 404) {
                    that.events.onPouchDocRetrieved.fire(undefined);
                    return undefined;
                }
            });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.storePersisted = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.store");
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
    floe.dashboard.pouchPersisted.deletePersisted = function (that) {
        // console.log("floe.dashboard.note.pouchPersisted.delete");
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.localName);
        db.get(docId).then(function (doc) {
            db.remove(doc).then(function () {
                that.events.onPouchDocDeleted.fire();
            });
        });
    };

    // Syncs to the remote
    floe.dashboard.couchSyncing = function (that) {
        // console.log("floe.dashboard.note.pouchPersisted.remoteSync");
        var localDB = new PouchDB(that.options.dbOptions.localName);
        var remoteDB = new PouchDB(that.options.dbOptions.remoteName);
        localDB.sync(remoteDB);
    };

})(jQuery, fluid);
