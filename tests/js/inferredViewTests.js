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

        console.log(that);

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
                yearsInProvince: {
                    label: "How many years have you lived in the province?",
                    value: "4",
                    type: "number",
                    constraints: {
                        min: 0,
                        max: 50
                    }
                },
                // Radio type
                favoriteFruit: {
                    label: "What is your favourite fruit?",
                    value: ["Apples","Plums"],
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
            {name: "Test dynamic markup generation and binding behaviour",
            tests: [{
                expect: 52,
                name: "Test initial markup generation and initial model-view binding generation.",
                sequence: [
                    {
                        listener: "floe.tests.dashboard.testInitialMarkup",
                        event: "{inferredViewTestEnvironment inferredView}.events.onBindingsApplied",
                        args: "{inferredView}"
                    }
                ]
            },
            {
                expect: 52,
                name: "Test binding (model change -> view change)",
                sequence: [
                    {
                        func: "{inferredView}.applier.change",
                        args: ["inferredViews.favoriteFruit.value", ["Apples", "Tomatoes"]]
                    },
                    {
                        func: "{inferredView}.applier.change",
                        args: ["inferredViews.name.value", "Cynthia"]
                    },
                    {
                        func: "{inferredView}.applier.change",
                        args: ["inferredViews.province.value", "Manitoba"]
                    },
                    {
                        func: "{inferredView}.applier.change",
                        args: ["inferredViews.wearsHats.value", "Sometimes"]
                    },
                    {
                        func: "floe.tests.dashboard.testModelToViewBind",
                        args: "{inferredView}"
                    }
                ]
            },
            {
                expect: 52,
                name: "Test binding (view change -> model change)",
                sequence: [
                    {
                        func: "fluid.value",
                        args: ["{inferredView}.dom.inferredView-name-value", "Daniel"]
                    },
                    {
                        element: "{inferredView}.dom.inferredView-name-value",
                        jQueryTrigger: "change"
                    },
                    {
                        func: "fluid.value",
                        args: ["{inferredView}.dom.inferredView-province-value", "Quebec"]
                    },
                    {
                        element: "{inferredView}.dom.inferredView-province-value",
                        jQueryTrigger: "change"
                    },
                    {
                        func: "fluid.value",
                        args: ["{inferredView}.dom.inferredView-favoriteFruit-value", ["Plums", "Bananas"]]
                    },
                    {
                        element: "{inferredView}.dom.inferredView-favoriteFruit-value",
                        jQueryTrigger: "change"
                    },
                    {
                        func: "fluid.value",
                        args: ["{inferredView}.dom.inferredView-wearsHats-value", "No"]
                    },
                    {
                        element: "{inferredView}.dom.inferredView-wearsHats-value",
                        jQueryTrigger: "change"
                    },
                    {
                        changeEvent: "{inferredView}.applier.modelChanged",
                        path: "inferredViews",
                        listener: "floe.tests.dashboard.testViewToModelBind",
                        args: "{inferredView}"
                    }
                ]
            }

            ]
        }
        ]
    });

    floe.tests.dashboard.testFromInferredViewSpec = function (that, spec, messagePrefix) {
        var inferredViews = that.model.inferredViews;

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {
            var specItem = spec[inferredViewKey];

            var locatedElements = that.locate(specItem.selector);

            jqUnit.assertTrue(messagePrefix + inferredViewValue.type + " type - expected style class is present", locatedElements.hasClass(specItem.expectedStyleClass));

            jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " type - expected tag is present", specItem.expectedTag, locatedElements.prop("tagName"));

            jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " type - expected number of tags are present", specItem.expectedTagNumber, locatedElements.length);

            var locatedValue = fluid.value(locatedElements);

            jqUnit.assertDeepEq(messagePrefix + inferredViewValue.type + " type - expected value is present on DOM element", specItem.expectedValue, locatedValue);

            jqUnit.assertDeepEq(messagePrefix + inferredViewValue.type + " type - expected value is present on model path", specItem.expectedValue, fluid.get(that.model, specItem.modelPath));

            floe.tests.dashboard.testForMatchingLabel(locatedElements);

            if(specItem.expectedConstraints) {
                fluid.each(specItem.expectedConstraints, function (expectedConstraintValue, expectedConstraintAttr) {
                    jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " - expected constraint attribute " + expectedConstraintAttr + "=" + expectedConstraintValue + " is present", expectedConstraintValue, locatedElements.attr(expectedConstraintAttr));
                });
            }

            if(specItem.children) {
                var elementChildren = locatedElements.children(specItem.children.expectedTag);
                jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " type - expected child tag is present", specItem.children.expectedTag, elementChildren.prop("tagName"));

                jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " type - expected number of child tags are present", specItem.children.expectedTagNumber, elementChildren.length);

                fluid.each(inferredViewValue.choices, function (choice) {
                    var matchingChoiceElement = elementChildren.filter("[value='" + choice + "']");
                    jqUnit.assertEquals(messagePrefix + inferredViewValue.type + " type - a corresponding " + specItem.children.expectedTag + " element is present for the choice value '" + choice + "''", choice, matchingChoiceElement.attr("value"));
                });

            }
        });
    };

    floe.tests.dashboard.testForMatchingLabel = function (elements) {
        fluid.each(elements, function (element) {
            var elementId = $(element).attr("id");
            var correspondingLabel = $("label[for='" + elementId + "']");
            jqUnit.assertEquals("A corresponding label is present in the markup", elementId, correspondingLabel.attr("for"));
        });

    };

    floe.tests.dashboard.baseInferredViewSpec = {
        name: {
            selector: "inferredView-name-value",
            modelPath: "inferredViews.name.value",
            expectedTag: "INPUT",
            expectedTagNumber: 1,
            expectedStyleClass: "floe-inferredView-name-value"
        },
        province: {
            selector: "inferredView-province-value",
            modelPath: "inferredViews.province.value",
            expectedTag: "SELECT",
            expectedTagNumber: 1,
            children: {
                expectedTag: "OPTION",
                expectedTagNumber: 13
            },
            expectedStyleClass: "floe-inferredView-province-value"
        },
        yearsInProvince: {
            selector: "inferredView-yearsInProvince-value",
            expectedValue: "4",
            modelPath: "inferredViews.yearsInProvince.value",
            expectedTag: "INPUT",
            expectedTagNumber: 1,
            expectedStyleClass: "floe-inferredView-yearsInProvince-value",
            expectedConstraints: {
                min: "0",
                max: "50"
            }
        },
        favoriteFruit: {
            selector: "inferredView-favoriteFruit-value",
            modelPath: "inferredViews.favoriteFruit.value",
            expectedTag: "INPUT",
            expectedTagNumber: 4,
            expectedStyleClass: "floe-inferredView-favoriteFruit-value"

        },
        wearsHats: {
            selector: "inferredView-wearsHats-value",
            modelPath: "inferredViews.wearsHats.value",
            expectedTag: "INPUT",
            expectedTagNumber: 3,
            expectedStyleClass: "floe-inferredView-wearsHats-value"
        }
    };

    floe.tests.dashboard.testInitialMarkup = function (that) {

        var expectedInitialInferredViewMarkupSpec = {
            name: {
                expectedValue: "Bob",
            },
            province: {
                expectedValue: "Ontario"
            },
            favoriteFruit: {
                expectedValue: ["Apples","Plums"]

            },
            wearsHats: {
                expectedValue: "Yes"
            }
        };

        var spec = $.extend(true, floe.tests.dashboard.baseInferredViewSpec, expectedInitialInferredViewMarkupSpec);

        floe.tests.dashboard.testFromInferredViewSpec(that, spec, "Dynamic generation of ");
    };

    floe.tests.dashboard.testModelToViewBind = function (that) {
        var expectedFromBindInferredViewMarkupSpec = {
            name: {
                expectedValue: "Cynthia"
            },
            province: {
                expectedValue: "Manitoba"
            },
            favoriteFruit: {
                expectedValue: ["Apples","Tomatoes"]

            },
            wearsHats: {
                expectedValue: "Sometimes"
            }
        };

        var spec = $.extend(true, floe.tests.dashboard.baseInferredViewSpec, expectedFromBindInferredViewMarkupSpec);

        floe.tests.dashboard.testFromInferredViewSpec(that, spec, "Model change -> view change of ");
    };

    floe.tests.dashboard.testViewToModelBind = function (that) {
        var expectedFromValueInferredViewMarkupSpec = {
            name: {
                expectedValue: "Daniel"
            },
            province: {
                expectedValue: "Quebec"
            },
            favoriteFruit: {
                expectedValue: ["Plums","Bananas"]

            },
            wearsHats: {
                expectedValue: "No"
            }
        };

        var spec = $.extend(true, floe.tests.dashboard.baseInferredViewSpec, expectedFromValueInferredViewMarkupSpec);

        floe.tests.dashboard.testFromInferredViewSpec(that, spec, "View change -> model change of ");
    };


    $(document).ready(function () {
        floe.tests.dashboard.inferredViewTestEnvironment();
    });

})(jQuery, fluid);
