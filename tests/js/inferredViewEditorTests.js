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

    // Test generation of bindings and selectors from the model

    jqUnit.test("Test editor grade generation", function () {

        var gradeGenerationTestComponent = floe.dashboard.inferredView.editable(".floec-inferredView-editor", {
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


        });

        floe.tests.dashboard.testGradeGeneration(gradeGenerationTestComponent.editor);
    });

    floe.tests.dashboard.testGradeGeneration = function (that) {
        jqUnit.expect(3);

        console.log(that);

        var expectedSelectorsBlock = {

            "inferredView-name-label-value": ".floec-inferredView-name-label-value",
            "inferredView-name-type-value": ".floec-inferredView-name-type-value",
            "inferredView-name-value-value": ".floec-inferredView-name-value-value",
            "inferredView-province-choices-value": ".floec-inferredView-province-choices-value",
            "inferredView-province-label-value": ".floec-inferredView-province-label-value",
            "inferredView-province-type-value": ".floec-inferredView-province-type-value",
            "inferredView-province-value-value": ".floec-inferredView-province-value-value"
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



})(jQuery, fluid);
