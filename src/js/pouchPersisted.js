(function ($, fluid) {

    fluid.defaults("floe.dashboard.pouchPersisted", {
        gradeNames: ["floe.dashboard.eventInTimeAware"],
        modelListeners: {
            // "": {
            //     func: "floe.dashboard.pouchPersisted.update",
            //     args: "{that}",
            //     excludeSource: "init"
            // }
        },
        modelRelay: [
            {
                target: "{that}.model._id",
                singleTransform: {
                    input: "{that}.model.timeEvents.created",
                    type: "fluid.transforms.free",
                    args: ["{that}"],
                    func: "floe.dashboard.pouchPersisted.getPouchId"
                }
            }
        ],
        events: {
            "onPouchDocCreated": null
        },
        dbOptions: {
            // name: "test"
        }

    });

    floe.dashboard.pouchPersisted.create = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.create");
        var doc = fluid.copy(that.model);
        var db = new PouchDB(that.options.dbOptions.name);
        db.put(doc).then(function () {
            that.events.onPouchDocCreated.fire();
        });
    };

    floe.dashboard.pouchPersisted.update = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.update");
        console.log(that);
        var doc = fluid.copy(that.model);
        var db = new PouchDB(that.options.dbOptions.name);
        db.put(doc);
    };

    floe.dashboard.pouchPersisted.delete = function (that) {
        console.log("floe.dashboard.note.pouchPersisted.delete");
        var docId = that.model._id;
        var db = new PouchDB(that.options.dbOptions.name);
        db.get(docId).then(function (doc) {
            return db.remove(doc);
        });
        that.destroy();
    };

    floe.dashboard.pouchPersisted.getPouchId = function (that) {
        return that.model.timeEvents.created;
    };

})(jQuery, fluid);
