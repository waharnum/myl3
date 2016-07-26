/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, jqUnit, floe */

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    fluid.defaults("floe.tests.dashboard.entry.note", {
        gradeNames: ["floe.dashboard.note.displayed"],
        dbOptions: {
            localName: "test"
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.preferenceChange", {
        gradeNames: ["floe.dashboard.preferenceChange.displayed"],
        dbOptions: {
            localName: "test"
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.noteTestEnvironmentCommon", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            entry: {
                type: "floe.tests.dashboard.entry.note",
                container: ".floec-entry-note-common",
                options: {
                    model: {
                    }
                },
                createOnEvent: "{entryTester}.events.onTestCaseStart"
            },
            entryTester: {
                type: "floe.tests.dashboard.entry.entryTester.noteCommon",
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.preferenceChangeTestEnvironmentCommon", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            entry: {
                type: "floe.tests.dashboard.entry.preferenceChange",
                container: ".floec-entry-preferenceChange-common",
                options: {
                    model: {
                    }
                },
                createOnEvent: "{entryTester}.events.onTestCaseStart"
            },
            entryTester: {
                type: "floe.tests.dashboard.entry.entryTester.preferenceChangeCommon",
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.entryTester.noteCommon", {
        gradeNames: ["floe.tests.dashboard.entry.entryTester"],
        modules: [ {
            name: "Note displayed entry component tests",
            tests: [{
                name: "Common displayed entry tests (note)"
            }]
        }]
    });

    fluid.defaults("floe.tests.dashboard.entry.entryTester.preferenceChangeCommon", {
        gradeNames: ["floe.tests.dashboard.entry.entryTester"],
        modules: [ {
            name: "Preference change displayed entry component tests",
            tests: [{
                name: "Common displayed entry tests (preferenceChange)"
            }]
        }]
    });

    // Common tests
    fluid.defaults("floe.tests.dashboard.entry.entryTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ {
            name: "Common displayed entry component tests",
            tests: [{
                expect: 4,
                name: "Common displayed entry tests",
                sequence:
                    [{
                        listener: "floe.tests.dashboard.entry.verifyRender",
                        args: ["{entry}"],
                        event: "{testEnvironment entry}.events.onEntryTemplateRendered"
                    },
                    // To work around the issue when two listeners are registered back to back, the second one doesn't get triggered.
                    {
                        func: "fluid.identity"
                    },
                    {
                        listener: "{entry}.retrievePersisted",
                        event: "{entry}.events.onPouchDocStored"
                    },
                    {
                        func: "fluid.identity"
                    },
                    {
                        listener: "floe.tests.dashboard.entry.verifyEntryStored",
                        event: "{entry}.events.onPouchDocRetrieved",
                        args: ["{entry}", "{arguments}.0"]
                    },
                    {
                        jQueryTrigger: "click",
                        element: "{entry}.dom.delete"
                    },
                    {
                        listener: "floe.tests.dashboard.entry.verifyEntryRemoved",
                        event: "{entry}.events.onEntryRemoved",
                        args: ["{entry}"]
                    }
                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.entry.verifyRender = function (entry) {
        var expectedRenderedTemplate = fluid.stringTemplate(entry.options.resources.stringTemplate, entry.options.resources.templateValues);
        jqUnit.assertEquals("Initial rendered entry markup matches the expected stringTemplate", expectedRenderedTemplate, entry.container.html().trim());
    };

    floe.tests.dashboard.entry.verifyEntryStored = function (entry, retrievedEntry) {
        // Remove the _rev
        var retrievedEntryMinusRev = fluid.censorKeys(retrievedEntry, ["_rev"]);
        jqUnit.assertDeepEq("Entry component model and retrieved entry are identical, except for _rev", entry.model, retrievedEntryMinusRev);
    };

    floe.tests.dashboard.entry.verifyEntryRemoved = function (entry) {
        // Verify entry deleted from DB
        jqUnit.assertUndefined("No persisted entry retrieved after delete click", entry.retrievePersisted());
        // Verify container removed
        jqUnit.assertTrue("All markup within the entry container has been removed", entry.container.children().length === 0);
    };


    fluid.defaults("floe.tests.dashboard.entry.preferenceChangeTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            prefChange: {
                type: "floe.tests.dashboard.entry.preferenceChange",
                container: ".floec-entry-preferenceChange",
                options: {
                    model: {
                        preferenceChange: {
                            preferenceType: "fluid_prefs_textFont",
                            preferenceTypeLabel: "Text style",
                            preferenceValue: "arial",
                            preferenceValueLabel: "Arial",
                            helpful: {
                                yes: true
                            },
                            helpsWith: {
                                mood: true,
                                navigation: true
                            }
                        }
                    }
                },
                createOnEvent: "{preferencesChangeTester}.events.onTestCaseStart"
            },
            preferencesChangeTester: {
                type: "floe.tests.dashboard.entry.preferencesChangeTester",
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.preferencesChangeTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ {
            name: "preferenceChanges entry component tests",
            tests: [{
                expect: 23,
                name: "Basic verification",
                sequence:
                    [{
                        listener: "floe.tests.dashboard.entry.verifyInitialRender",
                        args: ["{prefChange}"],
                        event: "{testEnvironment prefChange}.events.onEntryTemplateRendered"
                    },
                    {
                        func: "fluid.identity"
                    },
                    {
                        listener: "floe.tests.dashboard.entry.verifyCheckables",
                        args: ["{prefChange}"],
                        event: "{prefChange}.events.onCheckablesSetFromModel"
                    },
                    // Click "No" radio button
                    {
                        jQueryTrigger: "click",
                        element: "{prefChange}.dom.helpfulNo"
                    },
                    // Listen for model path change and check radio button /
                    // model binding
                    {
                        path: "preferenceChange.helpful",
                        changeEvent: "{prefChange}.applier.modelChanged",
                        listener: "floe.tests.dashboard.entry.verifyRadioBinding",
                        args: ["{prefChange}"]
                    },
                    // Uncheck "Mood" radio button
                    {
                        jQueryTrigger: "click",
                        element: "{prefChange}.dom.helpsWithMood"
                    },
                    {
                        path: "preferenceChange.helpsWith.mood",
                        changeEvent: "{prefChange}.applier.modelChanged",
                        listener: "floe.tests.dashboard.entry.verifyCheckedBinding",
                        args: ["preferenceChange.helpsWith.mood", "{prefChange}.dom.helpsWithMood", "{prefChange}", false]
                        // modelPath, boundElem, that, expectedBool
                    },
                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.entry.verifyInitialRender = function (prefChange) {
        floe.tests.dashboard.entry.verifyDynamicButtonCreation("helpfulRadioButton", "radioButtonItems", prefChange);

        floe.tests.dashboard.entry.verifyDynamicButtonCreation("helpsWithCheckbox", "checkboxItems", prefChange);
    };

    floe.tests.dashboard.entry.verifyCheckables = function (prefChange) {
        floe.tests.dashboard.entry.verifyDynamicButtonUpdateFromModel("helpfulRadioButton", "preferenceChange.helpful", prefChange);

        floe.tests.dashboard.entry.verifyDynamicButtonUpdateFromModel("helpsWithCheckbox", "preferenceChange.helpsWith", prefChange);
    };

    floe.tests.dashboard.entry.verifyDynamicButtonCreation = function (dynamicButtonSelector, dynamicButtonConfigBlockPath, prefChange) {
        var dynamicButtonItems = prefChange.options[dynamicButtonConfigBlockPath];
        var renderedButtons = prefChange.locate(dynamicButtonSelector);

        jqUnit.assertEquals("Length of " + dynamicButtonConfigBlockPath + " config block and rendered # of buttons found by selector " + dynamicButtonSelector + " are equal", fluid.hashToArray(dynamicButtonItems, "key").length, renderedButtons.length);

        fluid.each(dynamicButtonItems, function (buttonValue, buttonKey) {
            var correspondingRenderedButton = renderedButtons.filter(function (idx, elem){
                return (elem.value === buttonKey);
            });
            jqUnit.assertEquals("Button option item with key " + buttonKey + " has a corresponding button", buttonKey, correspondingRenderedButton.val());
        });
    };

    floe.tests.dashboard.entry.verifyDynamicButtonUpdateFromModel = function (dynamicButtonSelector, modelPath, prefChange) {
        var renderedButtons = prefChange.locate(dynamicButtonSelector);
        var modelValues = fluid.get(prefChange.model, modelPath);
        // Each model item with the value 'true' should be checked;
        // otherwise it should be false
        fluid.each(modelValues, function (modelValue, modelKey) {
            var correspondingRenderedButton = renderedButtons.filter(function (idx, elem){
                return (elem.value === modelKey);
            });
            jqUnit.assertEquals("Model value item with key " + modelKey + " has a corresponding button", modelValue, correspondingRenderedButton.prop("checked"));
        });

    };

    floe.tests.dashboard.entry.verifyRadioBinding = function (prefChange) {
        floe.tests.dashboard.entry.verifyCheckedBinding("preferenceChange.helpful.no", prefChange.locate("helpfulNo"), prefChange, true);
        floe.tests.dashboard.entry.verifyCheckedBinding("preferenceChange.helpful.yes", prefChange.locate("helpfulYes"), prefChange, false);
    };

    floe.tests.dashboard.entry.verifyCheckedBinding = function (modelPath, boundElem, prefChange, expectedBool) {
        jqUnit.assertEquals("Model path has expected boolean value", expectedBool, fluid.get(prefChange.model, modelPath));

        jqUnit.assertEquals("Checked value of control is expected boolean value", expectedBool, boundElem.prop("checked"));

        jqUnit.assertEquals("Checked value of control is reflected in model path", boundElem.prop("checked"), fluid.get(prefChange.model, modelPath));

    };

    $(document).ready(function () {
        floe.tests.dashboard.entry.noteTestEnvironmentCommon();
        floe.tests.dashboard.entry.preferenceChangeTestEnvironmentCommon();
        floe.tests.dashboard.entry.preferenceChangeTestEnvironment();
    });

})(jQuery, fluid);
