/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe, jqUnit */

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    fluid.defaults("floe.tests.dashboard.inferredView.editable", {
        gradeNames: ["floe.dashboard.inferredView.editable"],
        model: {
            inferredViews: {
                name: {
                    label: "What is your name?",
                    value: "Alice",
                    type: "text"
                },
                province: {
                    label: "What province / territory do you live in?",
                    value: "Ontario",
                    type: "select",
                    choices: [
                        "Ontario",
                        "Quebec",
                        "Nova Scotia",
                        "New Brunswick",
                        "Manitoba",
                        "British Columbia",
                        "Prince Edward Island",
                        "Saskatchewan",
                        "Alberta",
                        "Newfoundland and Labrador",
                        "Northwest Territories",
                        "Yukon",
                        "Nunavut"
                    ]
                }
            }
        }
        // components: {
        //     displayedInferredView: {
        //         options: {
        //             listeners: {
        //                 "onDestroy.clearContainer": null
        //             }
        //         }
        //     },
        //     editor: {
        //         options: {
        //             listeners: {
        //                 "onDestroy.clearContainer": null
        //             }
        //         }
        //     }
        // }
    });

    // Test generation of bindings and selectors from the model

    jqUnit.test("Test editor grade generation", function () {

        var gradeGenerationTestComponent = floe.tests.dashboard.inferredView.editable(".floec-inferredViewEditor-gradeGeneration");

        floe.tests.dashboard.testGradeGeneration(gradeGenerationTestComponent.editor);
    });

    floe.tests.dashboard.testGradeGeneration = function (that) {
        jqUnit.expect(3);

        var expectedSelectorsBlock = {

            "inferredView-name-label-value": ".floec-inferredViewEditor-name-label-value",
            "inferredView-name-type-value": ".floec-inferredViewEditor-name-type-value",
            "inferredView-name-value-value": ".floec-inferredViewEditor-name-value-value",
            "inferredView-province-choices-value": ".floec-inferredViewEditor-province-choices-value",
            "inferredView-province-label-value": ".floec-inferredViewEditor-province-label-value",
            "inferredView-province-type-value": ".floec-inferredViewEditor-province-type-value",
            "inferredView-province-value-value": ".floec-inferredViewEditor-province-value-value"
        };

        var expectedBindingsBlock = {
            "inferredView-name-label-value":
            {
                "selector":"inferredView-name-label-value",
                "path":"inferredViews.name-label.value"
            },

            "inferredView-name-value-value":
            {
                "selector":"inferredView-name-value-value",
                "path":"inferredViews.name-value.value"
            },

            "inferredView-name-type-value":
            {
                "selector":"inferredView-name-type-value",
                "path":"inferredViews.name-type.value"
            },

            "inferredView-province-label-value":
            {
                "selector":"inferredView-province-label-value",
                "path":"inferredViews.province-label.value"
            },

            "inferredView-province-value-value":
            {
                "selector":"inferredView-province-value-value",
                "path":"inferredViews.province-value.value"
            },

            "inferredView-province-type-value":
            {
                "selector":"inferredView-province-type-value",
                "path":"inferredViews.province-type.value"
            },
            "inferredView-province-choices-value":
            {
                "selector":"inferredView-province-choices-value",
                "path":"inferredViews.province-choices.value"
            }
        };

        var expectedModelRelayBlock = {
            "province-choicesEdit":
            [
                {
                    "backward": {
                        "excludeSource": "*"
                    },
                    "forward": {
                        "excludeSource": "init"
                    },
                    "singleTransform": {
                        "args": [
                            "{displayedInferredView}",
                            "{editor}.model.inferredViews.province-choices.value",
                            "inferredViews.province"
                        ],
                        "func": "floe.dashboard.inferredView.editable.relayChoicesChange",
                        "input": "{editor}.model.inferredViews.province-choices.value",
                        "type": "fluid.transforms.free"
                    },
                    "target": "{displayedInferredView}.model.inferredViews.province.choices"
                }
            ],
            "province-choicesInit": [
                {
                    "backward": {
                        "excludeSource": "init"
                    },
                    "forward": {
                        "includeSource": "init"
                    },
                    "singleTransform": {
                        "input": "{displayedInferredView}.model.inferredViews.province.choices",
                        "type": "fluid.transforms.literalValue"
                    },
                    "target": "{editor}.model.inferredViews.province-choices.value"
                }
            ]

        };

        jqUnit.assertDeepEq("The generated selectors of the editor are as expected", expectedSelectorsBlock, that.options.selectors);

        jqUnit.assertDeepEq("The generated bindings of the editor are as expected", expectedBindingsBlock, that.options.bindings);

        jqUnit.assertDeepEq("The generated model relays of the editor are as expected", expectedModelRelayBlock, that.options.modelRelay);

    };

    fluid.defaults("floe.tests.dashboard.inferredViewEditableTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            inferredViewEditable: {
                type: "floe.tests.dashboard.inferredView.editable",
                createOnEvent: "{inferredViewEditableComponentTester}.events.onTestCaseStart",
                container: ".floec-inferredViewEditor-interaction"
            },
            inferredViewEditableComponentTester: {
                type: "floe.tests.dashboard.inferredViewEditableComponentTester"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.inferredViewEditableComponentTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [
            {name: "Test dynamic markup generation and binding behaviour",
            tests: [
                {
                    expect: 1,
                    name: "Test choices relay",
                    sequence: [
                        {
                            listener: "floe.tests.dashboard.testChoiceRelay",
                            event: "{inferredViewEditableTestEnvironment inferredViewEditable editor}.events.onBindingsApplied",
                            args: ["{inferredViewEditable}"]
                        }
                    ]
                }
            ]
        }
        ]
    });

    floe.tests.dashboard.testChoiceRelay = function (inferredViewEditable) {
        var provinceChoicesValueControl = inferredViewEditable.editor.locate("inferredView-province-choices-value");

        var currentChoices = fluid.value(provinceChoicesValueControl);

        // via https://en.wikipedia.org/wiki/List_of_proposed_provinces_and_territories_of_Canada
        var revisedChoices = currentChoices.replace("Ontario,", "National Capital Region,Northern Ontario,Northwestern Ontario,Province of Toronto,");

        fluid.value(provinceChoicesValueControl, revisedChoices);

        provinceChoicesValueControl.trigger("change");

        var expectedProvinceChoices = [
            "National Capital Region",
            "Northern Ontario",
            "Northwestern Ontario",
            "Province of Toronto",
            "Quebec",
            "Nova Scotia",
            "New Brunswick",
            "Manitoba",
            "British Columbia",
            "Prince Edward Island",
            "Saskatchewan",
            "Alberta",
            "Newfoundland and Labrador",
            "Northwest Territories",
            "Yukon",
            "Nunavut"
        ];

        jqUnit.assertDeepEq("UI changes to the choices are relayed as expected", expectedProvinceChoices, inferredViewEditable.displayedInferredView.model.inferredViews.province.choices);

    };

    $(document).ready(function () {
        floe.tests.dashboard.inferredViewEditableTestEnvironment();
    });

})(jQuery, fluid);
