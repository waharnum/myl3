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

    fluid.defaults("floe.tests.dashboard.inferredView.dynamicMarkup", {
        gradeNames: ["floe.dashboard.inferredView"],
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
                    type: "checkbox"
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
                    type: "radio"
                }
                // Textarea type
            }
        }
    });


    fluid.defaults("floe.tests.dashboard.inferredViewTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            inferredView: {
                type: "floe.tests.dashboard.inferredView.dynamicMarkup",
                createOnEvent: "{inferredViewComponentTester}.events.onTestCaseStart",
                container: ".floec-inferredView-markupGeneration"
            },
            inferredViewComponentTester: {
                type: "floe.tests.dashboard.inferredViewComponentTester"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.inferredViewComponentTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [
            {name: "Test inferred view component",
            tests: [{
                expect: 12,
                name: "Test initial markup and model-view binding generation.",
                sequence: [
                    {
                        listener: "floe.tests.dashboard.testInitialMarkup",
                        event: "{inferredViewTestEnvironment inferredView}.events.onTemplateAppended",
                        args: "{inferredView}"
                    }
                ]
            },
                // {
                //     expect: 1,
                //     name: "Test binding generation",
                //     sequence: [
                //         {
                //             func: "{inferredView}.applier.change",
                //             args: ["inferredViews.favoriteFruit.value", ["Apples", "Plums"]]
                //         }
                //     ]
                // }

            ]
        }
        ]
    });

    floe.tests.dashboard.testFromInferredViewSpec = function (that, spec) {
        var inferredViews = that.model.inferredViews;

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {
            var specItem = spec[inferredViewKey];
            var locatedElement = that.locate(specItem.selector);
            jqUnit.assertEquals("Dynamic generation of " + inferredViewValue.type + " type - expected tag is present", specItem.expectedTag, locatedElement.prop("tagName"));
            jqUnit.assertEquals("Dynamic generation of " + inferredViewValue.type + " type - expected number of tags are present", specItem.expectedTagNumber, locatedElement.length);

            if(specItem.expectedValue) {
                var locatedValue = fluid.value(locatedElement);
                jqUnit.assertEquals("Dynamic generation of " + inferredViewValue.type + " type - expected value from model is present", specItem.expectedValue, locatedValue);
                // console.log(locatedValue);
            }

            if(specItem.children) {
                var elementChildren = locatedElement.children(specItem.children.expectedTag);
                jqUnit.assertEquals("Dynamic generation of " + inferredViewValue.type + " type - expected child tag is present", specItem.children.expectedTag, elementChildren.prop("tagName"));
                jqUnit.assertEquals("Dynamic generation of " + inferredViewValue.type + " type - expected number of child tags are present", specItem.children.expectedTagNumber, elementChildren.length);
            }
        });

    };

    floe.tests.dashboard.testInitialMarkup = function (that) {

        var expectedInitialInferredViewMarkupSpec = {
            name: {
                selector: "inferredView-name-value",
                expectedTag: "INPUT",
                expectedTagNumber: 1,
                expectedValue: "Bob"
            },
            province: {
                selector: "inferredView-province-value",
                expectedTag: "SELECT",
                expectedTagNumber: 1,
                children: {
                    expectedTag: "OPTION",
                    expectedTagNumber: 13
                },
                expectedValue: "Ontario"
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

        floe.tests.dashboard.testFromInferredViewSpec(that, expectedInitialInferredViewMarkupSpec);

    };

    $(document).ready(function () {
        floe.tests.dashboard.inferredViewTestEnvironment();
    });

})(jQuery, fluid);
