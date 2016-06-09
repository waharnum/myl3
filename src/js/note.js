(function ($, fluid) {

    fluid.defaults("floe.dashboard.note", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
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

    // Base mixin grade for displaying entries
    fluid.defaults("floe.dashboard.entry.displayed", {
        gradeNames: ["floe.chartAuthoring.valueBinding"],
        listeners: {
            "onPouchDocDeleted.removeNoteMarkup": {
                funcName: "floe.dashboard.entry.displayed.removeEntryMarkup",
                args: "{that}"
            },
            "onCreate.renderEntryTemplate": {
                funcName: "floe.dashboard.entry.displayed.renderEntryTemplate",
                args: "{that}",
                // Needs to beat any value binding
                priority: "first"
            }
        },
        events: {
            onEntryTemplateRendered: null
        }
        // Must be set by implementing grade
        // resources: {
        //     entryTemplate: ""
        // }
    });

    fluid.defaults("floe.dashboard.note.displayed", {
        gradeNames: ["floe.dashboard.note", "floe.dashboard.entry.displayed"],
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
            "onEntryTemplateRendered.bindDelete": {
                funcName: "floe.dashboard.entry.displayed.bindDelete",
                args: "{that}"
            }
        },
        resources: {
            entryTemplate: "Created: <span class='flc-note-created'></span><br/>Last Modified: <span class='flc-note-lastModified'></span><br/><a href='#' class='flc-note-delete'>Delete Note</a><br/><textarea  class='flc-note-text' cols=50 rows=3></textarea>"
        }
    });

    floe.dashboard.entry.displayed.removeEntryMarkup = function (that) {
        that.container.remove();
    };

    floe.dashboard.entry.displayed.renderEntryTemplate = function (that) {
        var entryTemplate = that.options.resources.entryTemplate;
        that.container.append(entryTemplate);
        that.events.onEntryTemplateRendered.fire();
    };

    floe.dashboard.entry.displayed.bindDelete = function (that) {
        var deleteControl = that.locate("delete");
        deleteControl.click(function (e) {
            e.preventDefault();
            that.delete();
        });
    };
})(jQuery, fluid);
