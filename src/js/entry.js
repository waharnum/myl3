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
            delete: ".floec-entry-delete"
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
            created: ".floec-note-created",
            lastModified: ".floec-note-lastModified",
            text: ".floec-note-text",
            prompt: ".floec-note-prompt"
        },
        bindings: {
            created: "formattedTimes.created",
            lastModified: "formattedTimes.lastModified",
            text: "text",
            prompt: "prompt"
        },
        resources: {
            stringTemplate: "<span class=\"floec-note-created\"></span>: <span class=\"floec-note-prompt\"></span> \"<span class=\"floec-note-text\"></span>\" <a href=\"#\" class=\"floec-entry-delete\">Delete</a>"
        }
    });

    fluid.defaults("floe.dashboard.preferenceChange", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        model: {
            "preferenceChange": {
                // What preference was changed
                "preferenceType": "",
                // Human-readable preferenceType,
                "preferenceTypeLabel": "",
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
            created: ".floec-note-created",
            lastModified: ".floec-note-lastModified",
            preferenceType: ".floec-preferenceChange-type",
            preferenceValue: ".floec-preferenceChange-value",
            helpfulRadioButtons: ".floec-preferenceChange-helpful-radioButtons",
            helpfulRadioButton: ".floec-preferenceChange-helpful-radio",
            helpfulYes: ".floec-preferenceChange-helpful-yes",
            helpfulNo: ".floec-preferenceChange-helpful-no",
            helpsWithCheckboxes: ".floec-preferenceChange-helpsWith-checkboxes",
            helpsWithCheckbox: ".floec-preferenceChange-helpsWith-checkbox",
            helpsWithMood: ".floec-preferenceChange-helpsWith-mood",
            helpsWithFocus: ".floec-preferenceChange-helpsWith-focus",
            helpsWithNavigation: ".floec-preferenceChange-helpsWith-navigation",
            helpsWithTyping: ".floec-preferenceChange-helpsWith-typing",
            helpsWithValue: ".floec-preferenceChange-helpsWith-value"
        },
        bindings: {
            created: "formattedTimes.created",
            lastModified: "formattedTimes.lastModified",
            preferenceType: "preferenceChange.preferenceTypeLabel",
            preferenceValue: "preferenceChange.preferenceValueLabel",
            helpsWithValue: "helpsWithValue"
        },
        checkboxTemplate: "<input type=\"checkbox\" value=\"%checkableValue\" class=\"floec-preferenceChange-helpsWith-checkbox floec-preferenceChange-helpsWith-%checkableValue\" id=\"%checkableId\"> <label for=\"%checkableId\">%checkableLabelText</label> ",
        checkboxItems: {
            mood: "Mood",
            focus: "Focus",
            navigation: "Navigation",
            typing: "Typing"
        },
        radioButtonTemplate: "<label for=\"%checkableId\">%checkableLabelText</label> <input class=\"floec-preferenceChange-helpful-radio floec-preferenceChange-helpful-%checkableValue\" id=\"%checkableId\" name=\"%checkableName\" value=\"%checkableValue\" type=\"radio\"> ",
        radioButtonItems: {
            yes: "Yes",
            no: "No"
        },
        resources: {
            stringTemplate: "<p><span class=\"floec-note-created\"></span>: <span class=\"floec-preferenceChange-type\"></span> changed to <span class=\"floec-preferenceChange-value\"></span> <a href=\"#\" class=\"floec-entry-delete\">Delete</a></p><form>Does this preference change help me? <span class=\"floec-preferenceChange-helpful-radioButtons\">%radioButtons</span><div class=\"floec-preferenceChange-helpsWith-checkboxes\">This preference change <span class=\"floec-preferenceChange-helpsWith-value\"></span> my:<br>%checkboxes</div></form>",
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
            "onEntryTemplateRendered.setHepsWithCheckboxVisibility": {
                func: "floe.dashboard.preferenceChange.displayed.showIfModelValueTrue",
                args: ["preferenceChange.helpful.yes", "helpsWithCheckboxes", "{that}"],
                priority: "before:setHelpfulRadioButtonFromModel"
            },
            "onEntryTemplateRendered.setHelpfulRadioButtonFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.setCheckableValuesFromModel",
                args: ["{that}", "helpfulRadioButton", "preferenceChange.helpful", "{that}.events.onRadioButtonsSetFromModel"],
                priority: "before:bindHelpfulControls"
            },
            "onEntryTemplateRendered.bindHelpfulRadioButtonControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindCheckableControls",
                args: ["{that}", "helpfulRadioButton", "preferenceChange.helpful", true]
            },
            "onEntryTemplateRendered.setHelpsWithCheckboxFromModel": {
                func: "floe.dashboard.preferenceChange.displayed.setCheckableValuesFromModel",
                args: ["{that}", "helpsWithCheckbox", "preferenceChange.helpsWith", "{that}.events.onCheckboxesSetFromModel"],
                priority: "before:bindCheckboxControls"
            },
            "onEntryTemplateRendered.bindCheckboxControls": {
                func: "floe.dashboard.preferenceChange.displayed.bindCheckableControls",
                args: ["{that}", "helpsWithCheckbox", "preferenceChange.helpsWith", false]
            }
        },
        modelListeners: {
            "preferenceChange.helpful": {
                func: "floe.dashboard.preferenceChange.displayed.showIfModelValueTrue",
                args: ["preferenceChange.helpful.yes", "helpsWithCheckboxes", "{that}"]
            }
        }
    });

    floe.dashboard.preferenceChange.displayed.showIfModelValueTrue = function (modelPath, selectorToToggle, that) {
        var helpsWithCheckboxes = that.locate(selectorToToggle);
        var isHelpful = fluid.get(that.model, modelPath);
        if(isHelpful) {
            helpsWithCheckboxes.show();
        } else {
            helpsWithCheckboxes.hide();
        }
    };

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
