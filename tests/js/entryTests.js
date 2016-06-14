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
                type: "floe.tests.dashboard.entry.noteTester"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.entry.noteTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ {
            name: "Note-type entry component",
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

    floe.tests.dashboard.entry.verifyRender = function (note) {
        var renderedText = note.locate("text");
        console.log(renderedText.text);
        jqUnit.assertEquals("Note model.text and rendered text are identical", note.model.text, renderedText.text());
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
