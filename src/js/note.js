(function ($, fluid) {

    fluid.defaults("floe.dashboard.note", {
        gradeNames: ["fluid.modelComponent", "floe.dashboard.eventInTimeAware"],
        model: {
            "text": "",
            "timestamp": null,
            "timestampPretty": null
        },
        modelRelay: {
            target: "{that}.model.timestampPretty",
            singleTransform: {
                input: "{that}.model.timeEvents.created",
                type: "fluid.transforms.free",
                args: ["{that}.model.timeEvents.created"],
                func: "floe.dashboard.note.getPrettyTimestamp"
            }
        },
        modelListeners: {
            "text": {
                func: "floe.dashboard.note.updateNote",
                args: "{that}",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.dashboard.note.new", {
        gradeNames: "floe.dashboard.note",
        listeners: {
            "onCreate.storeNote": {
                func: "floe.dashboard.note.createNote",
                args: "{that}",
                priority: "last"
            }
        },
        events: {
            onNoteStored: null
        }
    });

    floe.dashboard.note.getPrettyTimestamp = function (timestamp) {
        var pretty = new Date(timestamp);
        return pretty;
    };

    floe.dashboard.note.createNote = function (that) {
        console.log("floe.dashboard.note.createNote");
        that.model._id = "note-" + that.model.timeEvents.created;
        var noteDoc = {
            "_id": that.model._id,
            "timestamp": that.model.timeEvents.created,
            "text": that.model.text
        };
        var db = new PouchDB(that.options.dbOptions.name);
        db.put(noteDoc).then(function (note) {
            that.events.onNoteStored.fire();
        });
    };

    floe.dashboard.note.updateNote = function (that) {
        console.log("floe.dashboard.note.updateNote");
        var noteDoc = {
            "_id": that.model._id,
            "_rev": that.model._rev,
            "timestamp": that.model.timeEvents.created,
            "text": that.model.text
        };
        var db = new PouchDB(that.options.dbOptions.name);
        db.put(noteDoc);
    };

    floe.dashboard.note.deleteNote = function (that) {
        console.log("floe.dashboard.note.deleteNote");
        var noteId = that.model._id;
        console.log(noteId);
        var db = new PouchDB(that.options.dbOptions.name);
        db.get(noteId).then(function (note) {
            return db.remove(note);
        });
        that.destroy();
    };

    fluid.defaults("floe.dashboard.note.displayed", {
        gradeNames: ["floe.dashboard.note", "floe.chartAuthoring.valueBinding"],
        // A key/value of selectorName: model.path
        selectors: {
            timestamp: ".flc-note-timestamp",
            text: ".flc-note-text",
            delete: ".flc-note-delete"
        },
        bindings: {
            timestamp: "timestampPretty",
            text: "text"
        },
        listeners: {
            "onCreate.renderNoteTemplate": {
                funcName: "floe.dashboard.note.displayed.renderNoteTemplate",
                args: "{that}",
                // Needs to beat the value binding
                priority: "first"
            },
            "onNoteTemplateRendered.bindDelete": {
                funcName: "floe.dashboard.note.displayed.bindDelete",
                args: "{that}"
            },
            "onDestroy.removeNoteMarkup": {
                funcName: "floe.dashboard.note.displayed.removeNoteMarkup",
                args: "{that}"
            }
        },
        events: {
            onNoteTemplateRendered: null
        }
    });

    floe.dashboard.note.displayed.removeNoteMarkup = function (that) {
        that.container.remove();
    };

    floe.dashboard.note.displayed.renderNoteTemplate = function (that) {
        var noteTemplate = "<span class='flc-note-timestamp'></span><a href='#' class='flc-note-delete'>Delete Note</a><br/><textarea  class='flc-note-text' cols=50 rows=5></textarea>";
        that.container.append(noteTemplate);
        that.events.onNoteTemplateRendered.fire();
    };

    floe.dashboard.note.displayed.bindDelete = function (that) {
        var deleteControl = that.locate("delete");
        deleteControl.click(function (e) {
            e.preventDefault();
            floe.dashboard.note.deleteNote(that);
        });
    };
})(jQuery, fluid);
