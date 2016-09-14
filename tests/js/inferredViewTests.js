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

    jqUnit.test("Test inferredView grade", function () {

        var gradeGenerationTestComponent = floe.dashboard.inferredView(".floec-inferredView", {
            model: {
                inferredViews: {
                    name: {
                        label: "What is your name?",
                        value: "Alice",
                        type: "text"
                    }
                }
            }
        });

        floe.tests.dashboard.testGradeGeneration(gradeGenerationTestComponent);

    });

    // Test binding and selector grade generation
    // Test markup generation for various types

    floe.tests.dashboard.testGradeGeneration = function (that) {
        jqUnit.expect(0);

        var expectedSelectorsBlock = {"inferredView-name-value": ".floec-inferredView-name-value"};
        var expectedBindingsBlock = {
            "inferredView-name-value": { }
        };
    };

})(jQuery, fluid);
