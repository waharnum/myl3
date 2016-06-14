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
            "persistedValues": {
                "boolean": true,
                "integer": 3,
                "string": "Hello World",
                "decimal": 3.76,
            }
        },
        modelListeners: {
            "persistedValues": {
                func: "{that}.store",
                excludeSource: "init"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base", {
        gradeNames: ["fluid.test.testEnvironment"],
        components: {
            pouchPersistedComponent: {
                type: "floe.tests.dashboard.pouchPersistedComponent"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storage", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedComponentTester.storage"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTestEnvironment.delete", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTestEnvironment.base"],
        components: {
            pouchPersistedComponentTester: {
                type: "floe.tests.dashboard.pouchPersistedComponentTester.delete"
            }
        }
    });

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTester.base", {
        gradeNames: ["fluid.test.testCaseHolder"],
        dbOptions: {
            localName: "test",
            remoteName: "http://localhost:5984/test"
        },
        listeners: {
            "onCreate.setupPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedComponentTester.setupPouchTestDB",
                args: ["{that}.options.dbOptions.localName", "{that}.options.dbOptions.remoteName"]
            },
            "onDestroy.tearDownPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedComponentTester.tearDownPouchTestDB",
                args: ["{that}.options.dbOptions.localName", "{that}.options.dbOptions.remoteName"]
            }
        }
    });

    // Any necessary setup
    floe.tests.dashboard.pouchPersistedComponentTester.setupPouchTestDB = function (localName, remoteName) {

    };

    // Any necessary teardown
    floe.tests.dashboard.pouchPersistedComponentTester.tearDownPouchTestDB = function (localName, remoteName) {
        console.log(".tearDownPouchTestDB")
        new PouchDB(localName).destroy();
    };

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTester.storage", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTester.base"],
        modules: [ {
            name: "PouchDB persisted component - storage test cases",
            tests: [{
                expect: 1,
                name: "Test basic storage",
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
        // Remove the _rev on retrievedDoc
        var retrievedDocMinusRev = fluid.censorKeys(retrievedDoc, ["_rev"]);
        jqUnit.assertDeepEq("Component model and retrieved document are identical, except for _rev", that.model, retrievedDocMinusRev);
    };

    fluid.defaults("floe.tests.dashboard.pouchPersistedComponentTester.delete", {
        gradeNames: ["floe.tests.dashboard.pouchPersistedComponentTester.base"],
        modules: [ {
            name: "PouchDB persisted component - delete test cases",
            tests: [{
                expect: 1,
                name: "Test basic delete",
                sequence: [
                    {
                        func: "{pouchPersistedComponent}.store"
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
        jqUnit.assertUndefined(that.retrieve());
    };

    $(document).ready( function() {
        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.storage();
        floe.tests.dashboard.pouchPersistedComponentTestEnvironment.delete();
    });

})(jQuery, fluid);
