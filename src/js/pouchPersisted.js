(function ($, fluid) {

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
            "retrieve": {
                funcName: "floe.dashboard.pouchPersisted.retrieve",
                args: "{that}"
            },
            "store": {
                funcName: "floe.dashboard.pouchPersisted.store",
                args: "{that}"
            },
            "delete": {
                funcName: "floe.dashboard.pouchPersisted.delete",
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
                funcName: "floe.dashboard.pouchPersisted.remoteSync",
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
    floe.dashboard.pouchPersisted.retrieve = function (that) {
        console.log("floe.dashboard.pouchPersisted.retrieve");
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.localName);
        db.get(docId).then(function (doc) {
            that.events.onPouchDocRetrieved.fire(doc);
            return doc;
        });
    };

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.store = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.store");
        var doc = fluid.copy(that.model);
        var db = new PouchDB(that.options.dbOptions.localName);
        db.put(doc).then(function () {
            that.events.onPouchDocStored.fire();
        });
    };

    // Delete the document
    floe.dashboard.pouchPersisted.delete = function (that) {
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
    floe.dashboard.pouchPersisted.remoteSync = function (that) {
        // console.log("floe.dashboard.note.pouchPersisted.remoteSync");
        var localDB = new PouchDB(that.options.dbOptions.localName);
        var remoteDB = new PouchDB(that.options.dbOptions.remoteName);
        localDB.sync(remoteDB);
    };

})(jQuery, fluid);
