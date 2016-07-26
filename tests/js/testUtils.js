
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
