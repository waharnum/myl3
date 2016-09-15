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


    // Test binding and selector grade generation

    jqUnit.test("Test dynamic grade generation", function () {

        var gradeGenerationTestComponent = floe.dashboard.inferredView(".floec-inferredView-gradeGeneration", {
            model: {
                inferredViews: {
                    name: {
                        label: "What is your name?",
                        value: "Alice",
                        type: "text"
                    },
                    city: {
                        label: "What city do you live in?",
                        value: "Toronto",
                        type: "text"
                    }
                }
            }
        });

        floe.tests.dashboard.testGradeGeneration(gradeGenerationTestComponent);

    });

    floe.tests.dashboard.testGradeGeneration = function (that) {
        jqUnit.expect(2);

        var expectedSelectorsBlock = {
            "inferredView-name-value": ".floec-inferredView-name-value",
            "inferredView-city-value": ".floec-inferredView-city-value"
        };

        var expectedBindingsBlock = {
            "inferredView-name-value": {
                "selector": "inferredView-name-value",
                "path": "inferredViews.name.value"
            },
            "inferredView-city-value": {
                "selector": "inferredView-city-value",
                "path": "inferredViews.city.value"
            }
        };

        jqUnit.assertDeepEq("The expected selector block is generated for the instantiated component.", expectedSelectorsBlock, that.options.selectors);
        jqUnit.assertDeepEq("The expected bindings block is generated for the instantiated component.", expectedBindingsBlock, that.options.bindings);

    };

    // Test markup generation for various types

    jqUnit.test("Test dynamic markup generation", function () {

        jqUnit.expect(8);
        var markupGenerationTestComponent = floe.dashboard.inferredView(".floec-inferredView-markupGeneration", {
            model: {
                inferredViews: {
                    // Text type
                    name: {
                        label: "What is your name?",
                        value: "Bob",
                        type: "text"
                    },
                    // Select type
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
                    },
                    // Radio type
                    favoriteFruit: {
                        label: "What is your favourite fruit?",
                        value: "Apples",
                        choices: [
                            "Apples",
                            "Plums",
                            "Tomatoes",
                            "Bananas"
                        ],
                        type: "radio"
                    },
                    // Checkbox type
                    wearsHats: {
                        label: "Do you wear hats?",
                        value: "Yes",
                        choices: [
                            "Yes",
                            "No",
                            "Sometimes"
                        ],
                        type: "checkbox"
                    }
                    // Textarea type
                }
            }
        });

        floe.tests.dashboard.testMarkup(markupGenerationTestComponent);
    });

    floe.tests.dashboard.testMarkup = function (that) {
        var inferredViews = that.model.inferredViews;

        var expectedInferredViewSpecs = {
            name: {
                selector: "inferredView-name-value",
                expectedTag: "INPUT",
                expectedTagNumber: 1
            },
            province: {
                selector: "inferredView-province-value",
                expectedTag: "SELECT",
                expectedTagNumber: 1,
                choices: {
                    expectedTag: "OPTION",
                    expectedTagNumber: 11
                }
            },
            favoriteFruit: {
                selector: "inferredView-favoriteFruit-value",
                expectedTag: "INPUT",
                expectedTagNumber: 4

            },
            wearsHats: {
                selector: "inferredView-wearsHats-value",
                expectedTag: "INPUT",
                expectedTagNumber: 3
            }
        };

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {
            var specItem = expectedInferredViewSpecs[inferredViewKey];
            var locatedElement = that.locate(specItem.selector);
            jqUnit.assertEquals("Expected tag is present", locatedElement.prop("tagName"), specItem.expectedTag);
            jqUnit.assertEquals("Expected number of tags are present", specItem.expectedTagNumber, locatedElement.length);
        });
    };

})(jQuery, fluid);
