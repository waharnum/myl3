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
                    city: {
                        label: "What city do you live in?",
                        value: "Toronto",
                        type: "select",
                        choices: ["Toronto", "Calgary", "Vancouver", "Montreal"]
                    }
                }
            }
        });

        floe.tests.dashboard.testGradeGeneration(gradeGenerationTestComponent);
    });

    floe.tests.dashboard.testGradeGeneration = function (that) {
        jqUnit.expect(0);
    };

})(jQuery, fluid);
