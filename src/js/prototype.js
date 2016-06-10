// PouchDB.debug.enable('*');
PouchDB.debug.disable('*');

// var notesDB = new PouchDB('notes');

// destroy the DB
// new PouchDB('notes').destroy();

// var note = floe.dashboard.note.persisted({
//     model: {
//         "text": chance.sentence()
//     }
// });

var journalPage = floe.dashboard.page(".floec-journal", {
    model: {
        "name": "Alan's Journal"
    },
    listeners: {
        "onCreate.bindSubmitEntryClick": {
            func: "floe.dashboard.page.bindSubmitEntryClick",
            args: "{that}"
        },
        "onCreate.bindBackLink": {
            func: "floe.dashboard.page.bindBackLink",
            args: "{that}"
        },
        "onCreate.bindForwardLink": {
            func: "floe.dashboard.page.bindForwardLink",
            args: "{that}"
        }
    },
    dbOptions: {
        localName: "notes",
        remoteName: "http://localhost:5984/notes"
    }
});

fluid.registerNamespace("floe.tests.dashboard");

// Get a random positive integer
floe.tests.dashboard.randInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Generates a random note
floe.tests.dashboard.randomNote = function () {

    var randomText = chance.sentence();
    var randomDate = new Date();
    console.log(randomDate);
    // Get a number between -1 & -14

    var daysBack = floe.tests.dashboard.randInt(0, 14);
    console.log(daysBack);

    randomDate.setDate(randomDate.getDate() - daysBack);
    console.log(randomDate);
    randomDate = randomDate.toJSON();

        var note = floe.dashboard.note.persisted({
            model: {
                "text": randomText,
                timeEvents: {
                    created: randomDate,
                    lastModified: randomDate
                }

            },
            dbOptions: {
                localName: "notes",
                remoteName: "http://localhost:5984/notes"
            }
        });
};

// Random note generator
// Set to number of random notes to generate
var i = 0;
for(i; i > 0; i--) {
    floe.tests.dashboard.randomNote();
}

// Note creator

    // var note = floe.dashboard.note.persisted({
    //     model: {
    //         "text": chance.sentence()
    //     }
    // });


// notesDB.allDocs({include_docs: true}).then(function (response) {
//     console.log(response);
// });

$(document).ready(function () {
    fluid.uiOptions.prefsEditor(".flc-prefsEditor-separatedPanel", {
        terms: {
            "templatePrefix": "/src/lib/infusion/src/framework/preferences/html",
            "messagePrefix": "/src/lib/infusion/src/framework/preferences/messages"
        },
        "tocTemplate": "/src/lib/infusion/src/components/tableOfContents/html/TableOfContents.html",
        "ignoreForToC": {
            "overviewPanel": ".flc-overviewPanel"
        },
        components: {
            prefsEditorLoader: {
                options: {
                    components: {
                        messageLoader: {
                            options: {
                                listeners: {
                                    // "onResourcesLoaded.log": {
                                    //     this: "console",
                                    //     method: "log",
                                    //     args: "{that}"
                                    // }
                                }
                            }
                        },
                        slidingPanel: {
                            options: {
                                listeners: {
                                    "onPanelHide.log": {
                                        func: "floe.dashboard.page.compareCurrentPreferences",
                                        args: ["{prefsEditor}", "{floe.dashboard.page}"]
                                    },
                                    "onPanelShow.log": {
                                        func: "floe.dashboard.page.compareCurrentPreferences",
                                        args: ["{prefsEditor}", "{floe.dashboard.page}"]
                                    },
                                }
                            }
                        },
                        prefsEditor: {
                            options: {
                                listeners: {
                                    "onReady.relayInitialPreferences": {
                                        func: "floe.dashboard.page.relayInitialPreferences",
                                        args: ["{that}", "{floe.dashboard.page}"],
                                        priority: "last"
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });
});
