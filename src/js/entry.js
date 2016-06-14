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

    // Mixin for creation
    fluid.defaults("floe.dashboard.entry.persisted", {
        listeners: {
            "onCreate.storeEntry": {
                func: "{that}.storePersisted"
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
            that.deletePersisted();
        });
    };

    fluid.defaults("floe.dashboard.note", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        model: {
            "text": ""
        },
        modelListeners: {
            "text": {
                func: "{that}.storePersisted",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.dashboard.note.persisted", {
        gradeNames: ["floe.dashboard.note", "floe.dashboard.entry.persisted"],
        events: {
            onNoteStored: "{that}.events.onPouchDocStored"
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

    fluid.defaults("floe.dashboard.preferenceChange", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        model: {
            "preferenceChange": {
                // What preference was changed
                "preferenceType": "",
                // What was it changed to
                "preferenceValue": "",
                "helpful": ""
            }
        },
        modelListeners: {
            "preferenceChange.*": {
                func: "{that}.storePersisted",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange.persisted", {
        gradeNames: ["floe.dashboard.preferenceChange", "floe.dashboard.entry.persisted"],
        events: {
            onPreferenceChangeStored: "{that}.events.onPouchDocStored"
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange.displayed", {
        gradeNames: ["floe.dashboard.preferenceChange", "floe.dashboard.displayedEntry"],
        // A key/value of selectorName: model.path
        selectors: {
            created: ".flc-note-created",
            lastModified: ".flc-note-lastModified",
            preferenceType: ".flc-preferenceChange-type",
            preferenceValue: ".flc-preferenceChange-value",
            helpfulRadioButtons: ".flc-preferenceChange-helpul-radio"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            preferenceType: "preferenceChange.preferenceType",
            preferenceValue: "preferenceChange.preferenceValue",
        },
        resources: {
            entryTemplate: "Created: <span class='flc-note-created'></span><br/>Last Modified: <span class='flc-note-lastModified'></span><br/><a href='#' class='flc-entry-delete'>Delete Note</a><br/><span class='flc-preferenceChange-type'></span> changed to <span class='flc-preferenceChange-value'></span><br/>This preference change helps me<br/>Yes <input type='radio' class='flc-preferenceChange-helpul-radio flc-preferenceChange-helpul-true' name='helpful' value='true'></input> No <input type='radio' name='helpful' value='false' class='flc-preferenceChange-helpul-radio flc-preferenceChange-helpul-false'></input>"
        },
        listeners: {
            "onEntryTemplateRendered.setHelpfulValueFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.setHelpfulValueFromModel",
                args: "{that}",
                priority: "before:bindHelpfulControls"
            },
            "onEntryTemplateRendered.bindHelpfulControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindHelpfulControls",
                args: "{that}"
            }
        }
    });

    floe.dashboard.preferenceChange.displayed.bindHelpfulControls = function (that) {
        var helpfulRadioButtons = that.locate("helpfulRadioButtons");
        helpfulRadioButtons.click(function () {
            var clickedRadioButton = $(this);
            that.applier.change("preferenceChange.helpful", clickedRadioButton.val());
        });
    };

    floe.dashboard.preferenceChange.displayed.setHelpfulValueFromModel = function (that) {
        var helpfulRadioButtons = that.locate("helpfulRadioButtons");
        fluid.each(helpfulRadioButtons, function (radioButton) {

            if(radioButton.value === that.model.preferenceChange.helpful) {
                $(radioButton).prop("checked", true);
            }
        });
    };

})(jQuery, fluid);
