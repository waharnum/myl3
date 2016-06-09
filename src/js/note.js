(function ($, fluid) {

    // Base grade
    fluid.defaults("floe.dashboard.entry", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        listeners: {
            "onPouchDocDeleted.removeNoteMarkup": {
                funcName: "floe.dashboard.note.displayed.removeEntryMarkup",
                args: "{that}"
            }
        }
    });

    fluid.defaults("floe.dashboard.note", {
        gradeNames: ["floe.dashboard.entry"],
        model: {
            "text": ""
        },
        modelListeners: {
            "text": {
                func: "{that}.store",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.dashboard.note.new", {
        gradeNames: "floe.dashboard.note",
        listeners: {
            "onCreate.storeNote": {
                func: "{that}.store"
            }
        },
        events: {
            onNoteStored: "{that}.events.onPouchDocStored"
        }
    });

    fluid.defaults("floe.dashboard.note.displayed", {
        gradeNames: ["floe.dashboard.note", "floe.chartAuthoring.valueBinding"],
        // A key/value of selectorName: model.path
        selectors: {
            created: ".flc-note-created",
            lastModified: ".flc-note-lastModified",
            text: ".flc-note-text",
            delete: ".flc-note-delete"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
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
            }
        },
        resources: {
            entryTemplate: "Created: <span class='flc-note-created'></span><br/>Last Modified: <span class='flc-note-lastModified'></span><br/><a href='#' class='flc-note-delete'>Delete Note</a><br/><textarea  class='flc-note-text' cols=50 rows=3></textarea>"
        },
        events: {
            onNoteTemplateRendered: null
        }
    });

    floe.dashboard.note.displayed.removeEntryMarkup = function (that) {
        that.container.remove();
    };

    floe.dashboard.note.displayed.renderNoteTemplate = function (that) {
        var entryTemplate = that.options.resources.entryTemplate;
        that.container.append(entryTemplate);
        that.events.onNoteTemplateRendered.fire();
    };

    floe.dashboard.note.displayed.bindDelete = function (that) {
        var deleteControl = that.locate("delete");
        deleteControl.click(function (e) {
            e.preventDefault();
            that.delete();
        });
    };
})(jQuery, fluid);
