/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, jqUnit */

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

    fluid.defaults("floe.tests.dashboard.entry.noteTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            note: {
                type: "floe.tests.dashboard.entry.note",
                container: ".floec-entry-note",
                options: {
                    model: {
                        text: "Initial note text."
                    }
                },
                createOnEvent: "{noteTester}.events.onTestCaseStart"
            },
            noteTester: {
                type: "floe.tests.dashboard.entry.entryTester"
            }
        }
    });

    // Common tests
    fluid.defaults("floe.tests.dashboard.entry.entryTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ {
            name: "Common displayed entry component tests",
            tests: [{
                expect: 1,
                name: "Test note component behaviour",
                sequence: [{
                    listener: "floe.tests.dashboard.entry.verifyRender",
                    args: ["{note}"],
                    priority: "last",
                    event: "{noteTestEnvironment note}.events.onEntryTemplateRendered"
                }]
            }
            ]
        }]
    });

    floe.tests.dashboard.entry.verifyRender = function (entry) {
        var expectedRenderedTemplate = fluid.stringTemplate(entry.options.resources.stringTemplate, entry.options.resources.templateValues);
        console.log(entry.container.html().trim());
        console.log(expectedRenderedTemplate);
        jqUnit.assertEquals("Initial rendered entry markup matches the expected stringTemplate", expectedRenderedTemplate, entry.container.html().trim());

    };

    // jqUnit.test("Test note entry", function () {
    //     jqUnit.expect(0);
    //     var note = floe.dashboard.note.displayed(".floec-entry-note", {
    //         dbOptions: {
    //             localName: "test"
    //         }
    //     });
    // });

    $(document).ready(function () {
        floe.tests.dashboard.entry.noteTestEnvironment();
    });

})(jQuery, fluid);
