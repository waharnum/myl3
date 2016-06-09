(function ($, fluid) {

    // Base grade for persistence of model components to Pouch
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        model: {
            "persistenceInformation": {
                "typeName": "{that}.typeName"
            }
        },
        events: {
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
            // remoteName: "http://localhost:5984/test"
        },
        invokers: {
            "store": {
                funcName: "floe.dashboard.pouchPersisted.store",
                args: "{that}"
            },
            "delete": {
                funcName: "floe.dashboard.pouchPersisted.delete",
                args: "{that}"
            },
            "remoteSync": {
                funcName: "floe.dashboard.pouchPersisted.remoteSync",
                args: "{that}"
            }
        }

    });

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.store = function (that) {
        // console.log("floe.dashboard.note.pouchPersisted.store");
        // console.log(that.options.dbOptions);
        var doc = fluid.copy(that.model);
        var db = new PouchDB(that.options.dbOptions.localName);
        db.put(doc).then(function () {
            that.remoteSync();
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
                that.remoteSync();
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

    floe.dashboard.pouchPersisted.setPouchId = function (that) {
        that.model._id = that.model.timeEvents.created;
    };

})(jQuery, fluid);
