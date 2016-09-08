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
        gradeNames: ["fluid.dataSource"],
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
                type: "fluid.dataSource.encoding.none"
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
        readOnlyGrade: "floe.dashboard.dataSource.pouchDB",
        writable: true,
        deletable: true
    });

    // that, options, directModel
    floe.dashboard.dataSource.pouchDB.getImpl = function (that, options, _id) {
        options = options || {};
        return that.pouch.get(_id, options);
    };

    fluid.defaults("floe.dashboard.dataSource.pouchDB.writable", {
        gradeNames: ["fluid.dataSource.writable", "floe.dashboard.dataSource.pouchDB"],
        invokers: {
            "setImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.setImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    floe.dashboard.dataSource.pouchDB.setImpl = function (that, options, _id) {
        options = options || {};
        return that.pouch.put(_id, options);
    };

    fluid.defaults("floe.dashboard.dataSource.pouchDB.deletable", {
        gradeNames: ["fluid.dataSource.deletable", "floe.dashboard.dataSource.pouchDB"],
        invokers: {
            "delImpl": {
                funcName: "floe.dashboard.dataSource.pouchDB.delImpl",
                // options, directModel
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    // required for doc
    // {_id:"", _rev:""}
    floe.dashboard.dataSource.pouchDB.delImpl = function (that, options, doc) {
        options = options || {};
        return that.pouch.remove(doc, options);
    };

    // Base grade for model components that can persist and retrieve their
    // models to PouchDB
    //
    // This is a higher-level grade than the PouchDB datasource that makes
    // some further assumptions about desired behaviour, including:
    // - a create/update pattern when doing set operations
    // - a "get before set/delete" pattern that automatically handles revisions
    // - the automatic generation of timestamp-based IDs for persisted models
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        components: {
            dataSource: {
                type: "floe.dashboard.dataSource.pouchDB",
                options: {
                    dbOptions: "{pouchPersisted}.options.dbOptions"
                }
            }
        },
        events: {
            "onSetPouchId": null,
            // Event signature is the retrieved doc
            "onPouchDocRetrieved": null,
            // Event signature is the set request response
            "onPouchDocStored": null,
            // Event signature is the delete request response
            "onPouchDocDeleted": null,
            // Event signature for errors should include the error structure
            // returned by floe.dashboard.pouchPersisted.makeErrorStructure
            // (a basic message + the Pouch error structure)
            "onPouchGetError": null,
            "onPouchSetError": null,
            "onPouchDeleteError": null
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
        // events and listeners to store, retrieve and delete model as
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
            },
            "persist": {
                funcName: "floe.dashboard.pouchPersisted.persist",
                args: "{that}"
            }
        }
    });

    // Sets the ID to to "created" timestamp to make filtering
    // by time easier
    floe.dashboard.pouchPersisted.setPouchIdToCurrentTime = function (that) {
        that.applier.change("_id", that.model.timeEvents.created);
        that.events.onSetPouchId.fire();
    };

    // Sets the ID to a string
    floe.dashboard.pouchPersisted.setPouchIdToString = function (that, idString) {
        that.applier.change("_id", idString);
        that.events.onSetPouchId.fire();
    };

    // Convenience function for listeners that runs both "set" (for datasource
    // persistence) and floe.dashboard.eventInTimeAware.setModifiedTimeStamp
    // (for updating the modified timestamp)
    // This allows model listeners to be created to listen to consequential
    // model changes, update the modification time, and persist the modified
    // model to the datasource simply by invoking this function
    floe.dashboard.pouchPersisted.persist = function (that) {
        that.setModifiedTimeStamp();
        that.set();
    };

    floe.dashboard.pouchPersisted.makeErrorStructure = function (message, pouchError) {
        return {message: message, pouchError: pouchError};
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

        that.dataSource.get(docId, retrievalOptions).then(function (retrievedDoc) {
            that.events.onPouchDocRetrieved.fire(retrievedDoc);
        }, function (getErr) {
            that.events.onPouchGetError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("GET failed", getErr));
        });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.set = function (that) {
        var doc = fluid.copy(that.model);
        var docId = that.model._id;

        that.dataSource.get(docId).then(
            // Update the doc if it exists
            function (retrievedDoc) {
                // Set the _rev to the revision of the retrieved doc
                doc._rev = retrievedDoc._rev;
                that.dataSource.set(doc).then(function (setResp) {
                    that.events.onPouchDocStored.fire(setResp);
                }, function (setErr) {
                    that.events.onPouchSetError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("SET after GET (update if exists) failed", setErr));
                });
            },
            // Create the doc on a 404 (doesn't exist yet)
            function (getErr) {
                if (getErr.status === 404) {
                    that.dataSource.set(doc).then(function (setResp) {
                        that.events.onPouchDocStored.fire(setResp);
                    }, function (setErr) {
                        that.events.onPouchSetError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("SET after GET 404 response (create if does not exist) failed", setErr));
                    });
                } else {
                    that.events.onPouchGetError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("GET before SET failed", getErr));
                }
            });

    };

    // Delete the persisted document
    floe.dashboard.pouchPersisted.del = function (that) {
        var docId = that.model._id;
        that.dataSource.get(docId).then(function (doc) {
            that.dataSource.del(doc).then(function (deleteResp) {
                that.events.onPouchDocDeleted.fire(deleteResp);
            }, function (delErr) {
                that.events.onPouchDeleteError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("DEL after GET failed", delErr));
                return "Delete after get failed: " + delErr;
            });
        }, function (getErr) {
            that.events.onPouchGetError.fire(floe.dashboard.pouchPersisted.makeErrorStructure("GET before DELETE failed", getErr));
        });
    };

})(jQuery, fluid);
