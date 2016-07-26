/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, jqUnit, floe */

(function ($, fluid) {
        "use strict";

    // Mixin to make sure everything shares the same test DB
    fluid.defaults("floe.tests.dashboard.testDBOptions", {
        dbOptions: {
            localName: "test"
        }
    });

    // Sets up and tears down a test DB for each test case
    fluid.defaults("floe.tests.dashboard.pouchPersistedTestCaseHolder", {
        gradeNames: ["fluid.test.testCaseHolder", "floe.tests.dashboard.testDBOptions"],
        listeners: {
            "onCreate.setupPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedTestCaseHolder.setupPouchTestDB",
                args: ["{that}.options.dbOptions.localName", "{that}.options.dbOptions.remoteName"]
            },
            "onDestroy.tearDownPouchTestDB": {
                funcName: "floe.tests.dashboard.pouchPersistedTestCaseHolder.tearDownPouchTestDB",
                args: ["{that}.options.dbOptions.localName"]
            }
        }
    });

    // Any necessary setup
    floe.tests.dashboard.pouchPersistedTestCaseHolder.setupPouchTestDB = function (localName) {
        console.log(".setupPouchTestDB");
        console.log(localName);
    };

    // Any necessary teardown
    floe.tests.dashboard.pouchPersistedTestCaseHolder.tearDownPouchTestDB = function (localName) {
        console.log(".tearDownPouchTestDB");
        new PouchDB(localName).destroy();
    };
})(jQuery, fluid);
