(function ($, fluid) {

    // Base grade for persistence of model to Pouch
    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
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
            // name: "test"
        },
        invokers: {
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

    // Creates or updates the persisted model
    floe.dashboard.pouchPersisted.store = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.store");
        var doc = fluid.copy(that.model);
        var db = new PouchDB(that.options.dbOptions.name);
        db.put(doc).then(function () {
            that.events.onPouchDocStored.fire();
        });
    };

    // Delete the document 
    floe.dashboard.pouchPersisted.delete = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.delete");
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.name);
        db.get(docId).then(function (doc) {
            db.remove(doc).then(function () {
                that.events.onPouchDocDeleted.fire();
            });
        });
        that.destroy();
    };

    floe.dashboard.pouchPersisted.setPouchId = function (that) {
        that.model._id = that.model.timeEvents.created;
    };

})(jQuery, fluid);
