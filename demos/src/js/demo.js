/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe, chance */

(function ($, fluid) {

    "use strict";

    // PouchDB debug logging
    // PouchDB.debug.enable('*');
    // PouchDB.debug.disable("*");

    // var notesDB = new PouchDB('notes');

    // destroy the DB
    // new PouchDB('notes').destroy();

    // var note = floe.dashboard.note.persisted({
    //     model: {
    //         "text": chance.sentence()
    //     }
    // });

    floe.dashboard.journal(".floec-notes", {
        components: {
            page: {
                options: {
                    dbOptions: {
                        localName: "notes",
                        remoteName: "http://localhost:5984/notes"
                    }
                }
            }
        }
    });

    floe.dashboard.goals(".floec-goals", {
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

        floe.dashboard.note.persisted({
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
            distributeOptions: {
                target: "{that fluid.prefs.panel}.options",
                record: {
                    listeners: {
                        "onCreate.registerSelf": {
                            func: "floe.dashboard.page.addPreferenceMessage",
                            args: ["{that}", "{floe.dashboard.journal}.page"]
                        }
                    }
                }
            },
            components: {
                prefsEditorLoader: {
                    options: {
                        components: {
                            slidingPanel: {
                                options: {
                                    listeners: {
                                        "onPanelHide.trackPreferenceChanges": {
                                            func: "floe.dashboard.page.trackPreferenceChanges",
                                            args: ["{prefsEditor}", "{floe.dashboard.journal}.page"]
                                        },
                                        "onPanelShow.trackPreferenceChanges": {
                                            func: "floe.dashboard.page.trackPreferenceChanges",
                                            args: ["{prefsEditor}", "{floe.dashboard.journal}.page"]
                                        },
                                    }
                                }
                            },
                            prefsEditor: {
                                options: {
                                    listeners: {
                                        "onReady.relayInitialPreferences": {
                                            func: "floe.dashboard.page.relayInitialPreferences",
                                            args: ["{that}", "{floe.dashboard.journal}.page"],
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

})(jQuery, fluid);
