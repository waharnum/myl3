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
        that.container.remove();
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
            text: ".flc-note-text",
            prompt: ".flc-note-prompt"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            text: "text",
            prompt: "prompt"
        },
        resources: {
            stringTemplate: "At <span class=\"flc-note-created\"></span> in response to \"<span class=\"flc-note-prompt\"></span>\", I wrote \"<span class=\"flc-note-text\"></span>\" <a href=\"#\" class=\"flc-entry-delete\">Delete</a>"
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
                // exclusive choices about whether or not it was helpful
                "helpful": {
                    "yes": false,
                    "no": false
                },
                // what it does / does not help with
                "helpsWith": {
                    "mood": false,
                    "focus": false,
                    "navigation": false,
                    "typing": false
                }
            },
            "helpsWithValue": "helps me with"
        },
        modelListeners: {
            "preferenceChange.*": {
                func: "{that}.storePersisted",
                excludeSource: "init"
            }
        },
        modelRelay: {
            target: "{that}.model.helpsWithValue",
            singleTransform: {
                input: "{that}.model.preferenceChange.helpful",
                type: "fluid.transforms.free",
                args: ["{that}.model.preferenceChange.helpful"],
                func: "floe.dashboard.preferenceChange.getHelpfulValue"
            }
        }
    });

    floe.dashboard.preferenceChange.getHelpfulValue = function (helpful) {
        return helpful.yes ? "helps me with" : "does not help me with";
    };

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
            helpfulYes: ".flc-preferenceChange-helpful-yes",
            helpfulNo: ".flc-preferenceChange-helpful-no",
            helpsWithCheckboxes: ".flc-preferenceChange-helpsWith-checkbox",
            helpsWithMood: ".flc-preferenceChange-helpsWith-mood",
            helpsWithFocus: ".flc-preferenceChange-helpsWith-focus",
            helpsWithNavigation: ".flc-preferenceChange-helpsWith-navigation",
            helpsWithTyping: ".flc-preferenceChange-helpsWith-typing",
            helpsWithValue: ".flc-preferenceChange-helpsWith-value"
        },
        bindings: {
            created: "createdDatePretty",
            lastModified: "lastModifiedDatePretty",
            preferenceType: "preferenceChange.preferenceType",
            preferenceValue: "preferenceChange.preferenceValue",
            helpsWithValue: "helpsWithValue"
        },
        checkboxTemplate: "<input type=\"checkbox\" value=\"%checkableValue\" class=\"flc-preferenceChange-helpsWith-checkbox flc-preferenceChange-helpsWith-%checkableValue\" id=\"%checkableId\"> <label for=\"%checkableId\">%checkableLabelText</label>",
        checkboxItems: {
            mood: "Mood",
            focus: "Focus",
            navigation: "Navigation",
            typing: "Typing"
        },
        radioButtonTemplate: "<label for=\"%checkableId\">%checkableLabelText</label> <input class=\"flc-preferenceChange-helpful-radio flc-preferenceChange-helpful-%checkableValue\" id=\"%checkableId\" name=\"%checkableName\" value=\"%checkableValue\" type=\"radio\">",
        radioButtonItems: {
            yes: "Yes",
            no: "No"
        },
        resources: {
            stringTemplate: "Created: <span class=\"flc-note-created\"></span><br>Last Modified: <span class=\"flc-note-lastModified\"></span><br><a href=\"#\" class=\"flc-entry-delete\">Delete Note</a><br><span class=\"flc-preferenceChange-type\"></span> changed to <span class=\"flc-preferenceChange-value\"></span><br>This preference change helps me<br>%radioButtons<br>This preference change <span class=\"flc-preferenceChange-helpsWith-value\"></span> my:<br>%checkboxes",
            templateValues: {
                radioButtons: {
                    expander: {
                        func: "floe.dashboard.preferenceChange.displayed.getDynamicCheckableTemplate",
                        args: ["{that}.options.radioButtonItems", "{that}.options.radioButtonTemplate", "radioButton", "helpful", "{that}"]
                    }
                },
                checkboxes: {
                    expander: {
                        func: "floe.dashboard.preferenceChange.displayed.getDynamicCheckableTemplate",
                        args: ["{that}.options.checkboxItems", "{that}.options.checkboxTemplate", "checkbox", "helpsWith", "{that}"]
                    }
                }
            }
        },
        events: {
            onCheckablesSetFromModel: {
                events: {
                    onRadioButtonsSetFromModel: "onRadioButtonsSetFromModel",
                    onCheckboxesSetFromModel: "onCheckboxesSetFromModel"
                }
            },
            onRadioButtonsSetFromModel: null,
            onCheckboxesSetFromModel: null
        },
        listeners: {
            "onEntryTemplateRendered.setHelpfulRadioButtonsFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.setCheckableValuesFromModel",
                args: ["{that}", "helpfulRadioButtons", "preferenceChange.helpful", "{that}.events.onRadioButtonsSetFromModel"],
                priority: "before:bindHelpfulControls"
            },
            "onEntryTemplateRendered.bindHelpfulRadioButtonControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindCheckableControls",
                args: ["{that}", "helpfulRadioButtons", "preferenceChange.helpful", true]
            },
            "onEntryTemplateRendered.setHelpsWithCheckboxesFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.setCheckableValuesFromModel",
                args: ["{that}", "helpsWithCheckboxes", "preferenceChange.helpsWith", "{that}.events.onCheckboxesSetFromModel"],
                priority: "before:bindCheckboxControls"
            },
            "onEntryTemplateRendered.bindCheckboxControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindCheckableControls",
                args: ["{that}", "helpsWithCheckboxes", "preferenceChange.helpsWith", false]
            }
        }
    });

    floe.dashboard.preferenceChange.displayed.getDynamicCheckableTemplate = function (checkableItems, checkableTemplate, idPrefix, namePrefix, that) {
        var checkableTemplateString = "";
        fluid.each(checkableItems, function (checkableValue, checkableKey) {
            var templateValues = {
                checkableValue: checkableKey,
                checkableLabelText: checkableValue,
                checkableName: namePrefix + "-" + that.id,
                checkableId: idPrefix + "-" + fluid.allocateGuid()
            };

            checkableTemplateString = checkableTemplateString + fluid.stringTemplate(checkableTemplate, templateValues);

        });
        return checkableTemplateString;
    };

    floe.dashboard.preferenceChange.displayed.setCheckableValuesFromModel = function (that, checkableSelector, modelPath, completionEvent) {
        var helpfulcheckables = that.locate(checkableSelector);
        fluid.each(helpfulcheckables, function (checkable) {
            var modelValue = fluid.get(that.model, modelPath + "." + checkable.value);
            if(modelValue !== undefined) {
                $(checkable).prop("checked", modelValue);
            }
        });
        completionEvent.fire();
    };

    floe.dashboard.preferenceChange.displayed.bindCheckableControls = function (that, checkableSelector, modelPath, exclusiveControl) {
        console.log("bindButtonControls");
        var controlButtons = that.locate(checkableSelector);
        controlButtons.change(function () {
            var clickedButton = $(this);
            var isChecked = clickedButton.prop("checked");
            var modelValues = fluid.get(that.model, modelPath);
            var changeObject = fluid.transform(modelValues, function (value, key) {
                if(key !== clickedButton.val()) {
                    return exclusiveControl ? false : value;
                } else {
                    return isChecked;
                }
            });
            that.applier.change(modelPath, changeObject);
        });
    };

})(jQuery, fluid);
