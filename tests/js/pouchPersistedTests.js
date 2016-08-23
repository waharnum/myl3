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

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponent", {
        gradeNames: ["floe.tests.dashboard.testDBOptions", "floe.dashboard.pouchPersisted"],
        model: {
            "persistedValues": {
                "boolean": true,
                "integer": 3,
                "string": "Hello World",
                "decimal": 3.76,
            }
        },
        modelListeners: {
            "persistedValues": {
                func: "{that}.set",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            pouchPersistedComponent: {
                type: "floe.tests.dashboard.pouchPersistedComponent",
                createOnEvent: "{pouchPersistedComponentTester}.events.onTestCaseStart"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storageTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedTestCaseHolder.storage"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.deleteTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedTestCaseHolder.deleteTest"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder.storage", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedTestCaseHolder"],
        modules: [ {
            name: "PouchDB persisted component - storage test cases",
            tests: [{
                expect: 1,
                name: "Test basic storage",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.set"
                    },
                    {
                        listener: "{pouchPersistedComponent}.get",
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
        // Remove the _rev on retrievedDoc
        var retrievedDocMinusRev = fluid.censorKeys(retrievedDoc, ["_rev"]);
        console.log(retrievedDocMinusRev);
        jqUnit.assertDeepEq("Component model and retrieved document are identical, except for _rev", that.model, retrievedDocMinusRev);
    };

    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder.deleteTest", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedTestCaseHolder"],
        modules: [ {
            name: "PouchDB persisted component - delete test cases",
            tests: [{
                expect: 1,
                name: "Test basic delete",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.set"
                    },
                    {
                        listener: "{pouchPersistedComponent}.delete",
                        event: "{pouchPersistedComponent}.events.onPouchDocStored"
                    },
                    {
                        listener: "floe.tests.dashboard.testPouchPersistedDelete",
                        event: "{pouchPersistedComponent}.events.onPouchDocDeleted",
                        args: ["{pouchPersistedComponent}"]
                    }

                ]
            }
            ]
        }]
    });

    floe.tests.dashboard.testPouchPersistedDelete = function (that) {
        jqUnit.assertUndefined("No persisted entry retrieved", that.get());
    };

    $(document).ready(function () {
        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storageTest();
        // floe.tests.dashboard.pouchPersistedComponentTestEnvironment.deleteTest();
    });

})(jQuery, fluid);
