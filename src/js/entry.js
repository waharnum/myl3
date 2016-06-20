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

    // Mixin grade for displaying entries
    fluid.defaults("floe.dashboard.entry.displayed", {
        gradeNames: ["floe.chartAuthoring.valueBinding"],
        selectors: {
            delete: ".flc-entry-delete"
        },
        listeners: {
            "onPouchDocDeleted.removeEntryMarkup": {
                funcName: "floe.dashboard.entry.displayed.removeEntryMarkup",
                args: "{that}"
            },
            "onCreate.renderEntryTemplate": {
                funcName: "floe.dashboard.entry.displayed.renderEntryTemplate",
                args: "{that}",
                // Needs to beat any value binding
                priority: "first"
            },
            "onEntryTemplateRendered.bindDelete": {
                funcName: "floe.dashboard.entry.displayed.bindDelete",
                args: "{that}"
            }
        },
        events: {
            onRemoveEntryMarkup: null,
            onEntryTemplateRendered: null,
            onBindDelete: null,
            onEntryReady: {
                events: {
                    onEntryTemplateRendered: "onEntryTemplateRendered",
                    onBindDelete: "onBindDelete",
                    onSetPouchId: "onSetPouchId"
                }
            },
            onEntryRemoved: {
                events: {
                    onPouchDocDeleted: "onPouchDocDeleted",
                    onRemoveEntryMarkup: "onRemoveEntryMarkup"
                }
            }
        },
        invokers: {
            getEntryTemplate: {
                func: fluid.stringTemplate,
                args: ["{that}.options.resources.stringTemplate", "{that}.options.resources.templateValues"]
            }
        }
        // Must be set by implementing grade
        // resources: {
        //     stringTemplate: "" // fluid.stringTemplate syntax
        //     templateValues: {} // template values for stringTemplate
        // }
    });

    floe.dashboard.entry.displayed.removeEntryMarkup = function (that) {
        that.container.empty();
        that.events.onRemoveEntryMarkup.fire();
    };

    floe.dashboard.entry.displayed.renderEntryTemplate = function (that) {
        var entryTemplate = that.getEntryTemplate();
        that.container.append(entryTemplate);
        that.events.onEntryTemplateRendered.fire();
    };

    floe.dashboard.entry.displayed.bindDelete = function (that) {
        var deleteControl = that.locate("delete");
        deleteControl.click(function (e) {
            e.preventDefault();
            that.deletePersisted();
        });
        that.events.onBindDelete.fire();
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
        gradeNames: ["floe.dashboard.note.persisted", "floe.dashboard.entry.displayed"],
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
            stringTemplate: "Created: <span class=\"flc-note-created\"></span><br>Last Modified: <span class=\"flc-note-lastModified\"></span><br><a href=\"#\" class=\"flc-entry-delete\">Delete Note</a><br><textarea class=\"flc-note-text\" cols=\"50\" rows=\"3\"></textarea>"
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
        gradeNames: ["floe.dashboard.preferenceChange.persisted", "floe.dashboard.entry.displayed"],
        // A key/value of selectorName: model.path
        selectors: {
            created: ".flc-note-created",
            lastModified: ".flc-note-lastModified",
            preferenceType: ".flc-preferenceChange-type",
            preferenceValue: ".flc-preferenceChange-value",
            helpfulRadioButtons: ".flc-preferenceChange-helpful-radio",
            helpsWithCheckboxes: ".flc-preferenceChange-helpsWith-checkbox"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            preferenceType: "preferenceChange.preferenceType",
            preferenceValue: "preferenceChange.preferenceValue",
        },
        checkboxItems: {
            mood: "Mood",
            focus: "Focus",
            navigation: "Navigation",
            typing: "Typing"
        },
        resources: {
            stringTemplate: "Created: <span class=\"flc-note-created\"></span><br>Last Modified: <span class=\"flc-note-lastModified\"></span><br><a href=\"#\" class=\"flc-entry-delete\">Delete Note</a><br><span class=\"flc-preferenceChange-type\"></span> changed to <span class=\"flc-preferenceChange-value\"></span><br>This preference change helps me<br>Yes <input class=\"flc-preferenceChange-helpful-radio flc-preferenceChange-helpful-true\" name=\"%radioName\" value=\"true\" type=\"radio\"> No <input type=\"radio\" name=\"%radioName\" value=\"false\" class=\"flc-preferenceChange-helpful-radio flc-preferenceChange-helpful-false\"><br>This preference change helps me with my:<br>%checkboxes",
            templateValues: {
                radioName: {
                    expander: {
                        func: "floe.dashboard.preferenceChange.displayed.getPerComponentRadioButtonName",
                        args: "{that}"
                    }
                },
                checkboxes: {
                    expander: {
                        func: "floe.dashboard.preferenceChange.displayed.getCheckboxTemplate",
                        args: "{that}.options.checkboxItems"
                    }
                }
            }
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
            },
            "onEntryTemplateRendered.sethelpsWithCheckboxesFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.sethelpsWithCheckboxesFromModel",
                args: "{that}",
                priority: "before:bindCheckboxControls"
            },
            "onEntryTemplateRendered.bindCheckboxControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindCheckboxControls",
                args: "{that}"
            }
        }
    });

    floe.dashboard.preferenceChange.displayed.getCheckboxTemplate = function (checkboxItems) {
        var checkboxesTemplateString = "";
        fluid.each(checkboxItems, function(checkboxItem, checkboxKey) {
            var checkboxTemplate = "<input type=\"checkbox\" value=\"%checkboxValue\" class=\"flc-preferenceChange-helpsWith-checkbox\"> %checkboxText";
            var templateValues = {
                checkboxValue: checkboxKey,
                checkboxText: checkboxItem
            };
            checkboxesTemplateString = checkboxesTemplateString + fluid.stringTemplate(checkboxTemplate, templateValues);
        });
        return checkboxesTemplateString;
    };

    floe.dashboard.preferenceChange.displayed.getPerComponentRadioButtonName = function (that) {
        return "helpful-" + that.id;
    };

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

    floe.dashboard.preferenceChange.displayed.bindCheckboxControls = function (that) {
        var helpsWithCheckboxes = that.locate("helpsWithCheckboxes");

        helpsWithCheckboxes.click(function () {
            var clickedCheckbox = $(this);
            var isChecked = clickedCheckbox.prop("checked");
            that.applier.change("preferenceChange.helpsWith." + clickedCheckbox.val(), isChecked);
        });
    };

    floe.dashboard.preferenceChange.displayed.sethelpsWithCheckboxesFromModel = function (that) {
        var helpsWithCheckboxes = that.locate("helpsWithCheckboxes");
        fluid.each(helpsWithCheckboxes, function (checkbox) {
            var checkboxValue = checkbox.value;
            var modelValue = that.model.preferenceChange.helpsWith[checkboxValue];
            if(modelValue !== undefined) {
                $(checkbox).prop("checked", modelValue);
            }
        });
    };

})(jQuery, fluid);
