/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponent", {
        gradeNames: ["floe.dashboard.pouchPersisted"],
        dbOptions: {
            localName: "test",
            remoteName: "http://localhost:5984/test"
        },
        model: {
            "boolean": true,
            "integer": 3,
            "string": "Hello World",
            "decimal": 3.76,
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            pouchPersistedComponent: {
                type: "floe.tests.dashboard.pouchPersistedComponent"
            },
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedComponentTester"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTester", {
        gradeNames: ["fluid.test.testCaseHolder"],
        modules: [ /* declarative specification of tests */ {
            name: "Storage test case",
            tests: [{
                expect: 1,
                name: "Test storage",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.store"
                    },
                    {
                        listener: "{pouchPersistedComponent}.retrieve",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedStorage",
                        event: "{pouchPersistedComponent}.events.onPouchDocRetrieved",
                        args: ["{pouchPersistedComponent}", "{arguments}.0"]
                    }

                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.testPouchPersistedStorage = function (that, retrievedDoc) {
        console.log(that.model, retrievedDoc);
        // Remove the _rev on retrievedDoc
        var retrievedDocMinusRev = fluid.censorKeys(retrievedDoc, ["_rev"]);
        jqUnit.assertDeepEq("Component model and retrieved document are identical, except for _rev", that.model, retrievedDocMinusRev);
    };

    $(document).ready( function() {
        floe.tests.dashboard.pouchPersistedComponentTestEnvironment();
    });

    // jqUnit.test("Test pouchPersisted grade", function () {
    //
    //     jqUnit.expect(0);
    //     var that = floe.tests.dashboard.pouchPersistedComponent();
    //     console.log(that);
    //
    //     new PouchDB(that.options.dbOptions.localName).destroy()
    //         .then(function () {
    //             that.store();
    //         });
    //
    //     that.delete();
    //
    //
    //     jqUnit.assertTrue("If created without a timestamp, gets a timestamp", that.model.timeEvents.created);
    //
    //     jqUnit.assertTrue("Automatic timestamp generates a parseable time", floe.tests.dashboard.isParseableTime(that.model.timeEvents.created));
    //
    //     jqUnit.assertTrue("A lastModified time event is generated", that.model.timeEvents.lastModified);
    //
    //     jqUnit.assertTrue("LastModified time event is parseable", floe.tests.dashboard.isParseableTime(that.model.timeEvents.created));
    //
    //     var userSuppliedTime = "May, 2016";
    //     // Expected result of cnverting new Date(userSuppliedTime) via
    //     // Date.toJSON();
    //     var convertedUserSuppliedTime = "2016-05-01T04:00:00.000Z";
    //
    //     that = floe.dashboard.eventInTimeAware({
    //         model: {
    //             timeEvents: {
    //                 created: userSuppliedTime
    //             }
    //         },
    //     });
    //
    //     jqUnit.assertEquals("User-supplied timestamp is respected", convertedUserSuppliedTime, that.model.timeEvents.created);
    //
    //     jqUnit.assertTrue("A lastModified time event is generated", that.model.timeEvents.lastModified);
    //
    // });

})(jQuery, fluid);
