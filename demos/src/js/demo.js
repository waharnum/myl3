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

    fluid.defaults("floe.dashboard.lab", {
        gradeNames: ["fluid.viewComponent"],
        events: {
            "onTemplatesReady": null,
            "onContainerMarkupReady": null,
            "onEntryRemoved": null
        },
        listeners: {
            "onTemplatesReady.appendLabTemplate": {
                "this": "{that}.container",
                "method": "append",
                args: ["{templateLoader}.resources.labTemplate.resourceText"]
            },
            "onTemplatesReady.fireOnContainerMarkupReady": {
                func: "{that}.events.onContainerMarkupReady.fire",
                priority: "after:appendLabTemplate"
            }
        },
        components: {
            templateLoader: {
                type: "fluid.prefs.resourceLoader",
                options: {
                    resources: {
                        labTemplate: "/src/html/labTemplate.html"
                    },
                    listeners: {
                        "onResourcesLoaded.escalate": "{floe.dashboard.lab}.events.onTemplatesReady"
                    }
                }
            },
            journal: {
                type: "floe.dashboard.journal",
                container: ".floec-notes",
                createOnEvent: "onContainerMarkupReady",
                options: {
                    components: {
                        page: {
                            options: {
                                dbOptions: {
                                    localName: "notes",
                                    remoteName: "http://localhost:5984/notes"
                                },
                                dynamicComponents: {
                                    entry: {
                                        options: {
                                            listeners: {
                                                "onEntryRemoved.fireLabEvent": {
                                                    "func": "{lab}.events.onEntryRemoved.fire",
                                                    "args": ["{that}"]
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            goals: {
                type: "floe.dashboard.goals",
                container: ".floec-goals",
                createOnEvent: "onContainerMarkupReady",
                options: {
                    dbOptions: {
                        localName: "notes",
                        remoteName: "http://localhost:5984/notes"
                    },
                    dynamicComponents: {
                        entry: {
                            options: {
                                listeners: {
                                    "{lab}.events.onEntryRemoved": {
                                        func: "floe.dashboard.lab.removeEntryIfSamePouchId",
                                        "args": ["{arguments}.0", "{that}"]
                                    }
                                }
                            }
                        }
                    },
                    listeners: {
                        "{journal}.events.onGoalAdded": {
                            "namespace": "addToGoalsList",
                            func: "{goals}.addEntry",
                            args: ["{arguments}.0"]
                        }
                    }
                }
            },
            prefs: {
                type: "fluid.uiOptions.prefsEditor",
                container: ".flc-prefsEditor-separatedPanel",
                createOnEvent: "onContainerMarkupReady",
                options: {
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
                                    args: ["{that}", "{journal}.page"]
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
                                                    args: ["{prefsEditor}", "{journal}.page"]
                                                },
                                                "onPanelShow.trackPreferenceChanges": {
                                                    func: "floe.dashboard.page.trackPreferenceChanges",
                                                    args: ["{prefsEditor}", "{journal}.page"]
                                                },
                                            }
                                        }
                                    },
                                    prefsEditor: {
                                        options: {
                                            listeners: {
                                                "onReady.relayInitialPreferences": {
                                                    func: "floe.dashboard.page.relayInitialPreferences",
                                                    args: ["{that}", "{journal}.page"],
                                                    priority: "last"
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    floe.dashboard.lab.removeEntryIfSamePouchId = function(removedEntry, entryToTest) {
        console.log(entryToTest);
        var removedEntryPouchId = fluid.get(removedEntry.model, "_id");
        var entryToTestPouchId = fluid.get(entryToTest.model, "_id");
        if(removedEntryPouchId === entryToTestPouchId) {
            entryToTest.removeEntryMarkup();
        }
    };

    floe.dashboard.lab(".floec-labContainer");

})(jQuery, fluid);
