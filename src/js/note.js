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

    // Mixin for creation
    fluid.defaults("floe.dashboard.entry.new", {
        listeners: {
            "onCreate.storeEntry": {
                func: "{that}.store"
            }
        },
        events: {
            onEntryStored: "{that}.events.onPouchDocStored"
        }
    });

    // Base mixin grade for displaying entries
    fluid.defaults("floe.dashboard.displayedEntry", {
        gradeNames: ["floe.chartAuthoring.valueBinding"],
        selectors: {
            delete: ".flc-entry-delete"
        },
        listeners: {
            "onPouchDocDeleted.removeNoteMarkup": {
                funcName: "floe.dashboard.displayedEntry.removeEntryMarkup",
                args: "{that}"
            },
            "onCreate.renderEntryTemplate": {
                funcName: "floe.dashboard.displayedEntry.renderEntryTemplate",
                args: "{that}",
                // Needs to beat any value binding
                priority: "first"
            },
            "onEntryTemplateRendered.bindDelete": {
                funcName: "floe.dashboard.displayedEntry.bindDelete",
                args: "{that}"
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

    floe.dashboard.displayedEntry.removeEntryMarkup = function (that) {
        that.container.remove();
    };

    floe.dashboard.displayedEntry.renderEntryTemplate = function (that) {
        var entryTemplate = that.options.resources.entryTemplate;
        that.container.append(entryTemplate);
        that.events.onEntryTemplateRendered.fire();
    };

    floe.dashboard.displayedEntry.bindDelete = function (that) {
        var deleteControl = that.locate("delete");
        deleteControl.click(function (e) {
            e.preventDefault();
            that.delete();
        });
    };

    fluid.defaults("floe.dashboard.note.persisted", {
        gradeNames: ["floe.dashboard.note", "floe.dashboard.entry.new"],
        events: {
            onNoteStored: "{that}.events.onPouchDocStored"
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        model: {
            "preferenceChange": {
                // What preference was changed
                "preferenceType": "",
                // What was it changed to
                "preferenceValue": ""
            }
        },
        modelListeners: {
            "preferenceChange": {
                func: "{that}.store",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange.persisted", {
        gradeNames: ["floe.dashboard.preferenceChange", "floe.dashboard.entry.new"],
        events: {
            onPreferenceChangeStored: "{that}.events.onPouchDocStored"
        }
    });

    fluid.defaults("floe.dashboard.note.displayed", {
        gradeNames: ["floe.dashboard.note", "floe.dashboard.displayedEntry"],
        // A key/value of selectorName: model.path
        selectors: {
            created: ".flc-note-created",
            lastModified: ".flc-note-lastModified",
            text: ".flc-note-text"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            text: "text"
        },
        resources: {
            entryTemplate: "Created: <span class='flc-note-created'></span><br/>Last Modified: <span class='flc-note-lastModified'></span><br/><a href='#' class='flc-entry-delete'>Delete Note</a><br/><textarea  class='flc-note-text' cols=50 rows=3></textarea>"
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange.displayed", {
        gradeNames: ["floe.dashboard.preferenceChange", "floe.dashboard.displayedEntry"],
        // A key/value of selectorName: model.path
        selectors: {
            created: ".flc-note-created",
            lastModified: ".flc-note-lastModified",
            preferenceType: ".flc-preferenceChange-type",
            preferenceValue: ".flc-preferenceChange-value"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            preferenceType: "preferenceChange.preferenceType",
            preferenceValue: "preferenceChange.preferenceValue",
        },
        resources: {
            entryTemplate: "Created: <span class='flc-note-created'></span><br/>Last Modified: <span class='flc-note-lastModified'></span><br/><a href='#' class='flc-entry-delete'>Delete Note</a><br/><span class='flc-preferenceChange-type'></span> changed to <span class='flc-preferenceChange-value'></span>"
        }
    });

})(jQuery, fluid);
