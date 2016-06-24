/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe, PouchDB */

(function ($, fluid) {

    "use strict";

    // The journal handles overall journal behaviour - navigation primarily
    fluid.defaults("floe.dashboard.journal", {
        gradeNames: ["floe.chartAuthoring.valueBinding"],
        model: {
            // Who does the journal belong to?
            journalName: "My Journal"
        },
        selectors: {
            page: ".floec-journal-page",
            journalName: ".floec-journal-name"
        },
        bindings: {
            journalName: "journalName",
        },
        components: {
            page: {
                type: "floe.dashboard.page",
                container: "{journal}.dom.page",
                createOnEvent: "onJournalMarkupReady"
            }
        },
        events: {
            onJournalMarkupReady: null
        },
        listeners: {
            "onCreate.createJournalMarkup": {
                this: "{that}.container",
                method: "append",
                args: "{that}.options.resources.markup",
                priority: "first"
            },
            "onCreate.journalMarkupReady": {
                priority: "after:createJournalMarkup",
                func: "{that}.events.onJournalMarkupReady.fire"
            },
            "onCreate.bindFeelSubmitEntryClick": {
                func: "floe.dashboard.journal.bindSubmitEntryClick",
                args: ["{page}", "#floec-prompt-feel", "#floec-submitEntry-feel", "#floec-newEntry-feel", "Today I feel..."]
            },
            "onCreate.bindAchieveSubmitEntryClick": {
                func: "floe.dashboard.journal.bindSubmitEntryClick",
                args: ["{page}", "#floec-prompt-achieve",  "#floec-submitEntry-achieve", "#floec-newEntry-achieve", "Today I want to..."]
            },
            "onCreate.bindBackLink": {
                func: "floe.dashboard.journal.bindBackLink",
                args: "{page}"
            },
            "onCreate.bindForwardLink": {
                func: "floe.dashboard.journal.bindForwardLink",
                args: "{page}"
            }
        },
        resources: {
            markup: "<h1 class=\"floec-journal-name\">My Journal</h1><div class=\"floec-journal-page\"></div><h3 id=\"floec-prompt-feel\">Today I feel...</h3><form><p><input id=\"floec-newEntry-feel\"></input> <button id=\"floec-submitEntry-feel\" type=\"submit\">Add Entry</button></p></form><h3 id=\"floec-prompt-achieve\">Today I want to...</h3><form><p><input id=\"floec-newEntry-achieve\"></input> <button id=\"floec-submitEntry-achieve\" type=\"submit\">Add Entry</button></p></form><a href=\"#\" id=\"floec-page-back\">Back One Day</a> | <a href=\"#\" id=\"floec-page-forward\">Forward One Day</a>"
        }
    });

    floe.dashboard.journal.bindSubmitEntryClick = function (that, promptId, buttonId, textAreaId, prompt) {
        var page = that;
        $(buttonId).click(function (e) {
            var entryText = $(textAreaId).val();
            floe.dashboard.note.persisted({
                model: {
                    "text": entryText,
                    "prompt": prompt
                },
                listeners: {
                    "onNoteStored.AddNote": {
                        func: "floe.dashboard.journal.addEntry",
                        args: ["{that}", page]
                    }
                },
                dbOptions: {
                    localName: page.options.dbOptions.localName,
                    remoteName: page.options.dbOptions.remoteName
                }
            });
            e.preventDefault();
        });
    };

    floe.dashboard.journal.bindBackLink = function (that) {
        $("#floec-page-back").click(function (e) {
            console.log("back");
            that.rollDate(-1);
            e.preventDefault();
        });
    };

    floe.dashboard.journal.bindForwardLink = function (that) {
        $("#floec-page-forward").click(function (e) {
            console.log("forward");
            that.rollDate(1);
            e.preventDefault();
        });
    };

    floe.dashboard.journal.addEntry = function (note, page) {
        console.log("floe.dashboard.journal.addEntry");
        // console.log(that);
        var db = new PouchDB(page.options.dbOptions.localName);
        db.get(note.model._id).then(function (dbNote) {
            var displayComponentType = dbNote.persistenceInformation.typeName.replace(".persisted", ".displayed");
            var entryContainer = floe.dashboard.page.injectEntryContainer(page);
            page.events.onEntryRetrieved.fire(dbNote, displayComponentType, entryContainer);
        });
    };

    // The page represents a particular "page"
    fluid.defaults("floe.dashboard.page", {
        gradeNames: ["floe.dashboard.eventInTimeAware", "fluid.viewComponent"],
        selectors: {
            entryList: ".floec-entryList"
        },
        events: {
            onEntryRetrieved: null,
            onPreferenceChangeRetrieved: null
        },
        model: {
            // The date of the page to display
            currentDate: new Date().toJSON(),
            // Formatted date for display
            formattedCurrentDate: null
        },
        dynamicComponents: {
            entry: {
                createOnEvent: "onEntryRetrieved",
                type: "{arguments}.1",
                container: "{arguments}.2",
                options: {
                    // Necessary because passing "{arguments}.0"
                    // directly to model: in block fails
                    // because the framework interprets this as an
                    // implicit relay
                    onEntryRetrievedArgs: "{arguments}.0",
                    "model": "{that}.options.onEntryRetrievedArgs",
                    dbOptions: {
                        localName: "{page}.options.dbOptions.localName",
                        remoteName: "{page}.options.dbOptions.remoteName"
                    }
                }
            }
        },
        listeners: {
            "onCreate.getEntries": {
                func: "floe.dashboard.page.getEntries",
                args: "{that}"
            },
            "onCreate.createPageMarkup": {
                func: "floe.dashboard.page.createPageMarkup",
                args: "{that}",
                priority: "before:getEntries"
            }
        },
        modelRelay: {
            target: "{that}.model.formattedCurrentDate",
            singleTransform: {
                input: "{that}.model.currentDate",
                type: "fluid.transforms.free",
                args: ["{that}.model.currentDate"],
                func: "floe.dashboard.eventInTimeAware.getFormattedDate"
            }
        },
        // Reload entries if date changes, such as on navigation
        modelListeners: {
            "createPageMarkup": {
                path: "currentDate",
                func: "floe.dashboard.page.createPageMarkup",
                args: "{that}",
                priority: "before:getEntries",
                excludeSource: "init"
            },
            "getEntries": {
                path: "currentDate",
                func: "floe.dashboard.page.getEntries",
                args: "{that}",
                excludeSource: "init"
            }
        },
        invokers: {
            "rollDate": {
                funcName: "floe.dashboard.page.rollDate",
                args: ["{that}", "{arguments}.0"]
            }
        },
        dbOptions: {
            // localName: "notes"
        },
        // Some key constants
        constants: {
            startOfDayUTC: "T00:00:00.000Z",
            endOfDayUTC: "T23:59:59.999Z"
        },
        resources: {
            stringTemplate: "<h2>%formattedCurrentDate</h2><ol class=\"floec-entryList floe-entryList\">",
            entryContainerTemplate: "<li id=\"%noteId\"></li>"
        }
    });

    floe.dashboard.page.rollDate = function (that, daysToRoll) {
        var currentDate = new Date(that.model.currentDate);
        currentDate.setDate(currentDate.getDate() + daysToRoll);
        that.applier.change("currentDate", currentDate);
    };

    floe.dashboard.page.getEntries = function (that) {
        // console.log("floe.dashboard.page.getEntries");

        var pageDate = new Date(that.model.currentDate);
        var pageUTCFull = pageDate.toJSON();
        var pageUTCDate = pageUTCFull.slice(0,pageUTCFull.indexOf("T"));

        var db = new PouchDB(that.options.dbOptions.localName);
        db.allDocs({
            include_docs: true,
            // start and end date filtering
            startkey: pageUTCDate + that.options.constants.startOfDayUTC,
            endkey: pageUTCDate + that.options.constants.endOfDayUTC
        }).then(function (response) {
            fluid.each(response.rows, function (row) {
                var displayComponentType = row.doc.persistenceInformation.typeName.replace(".persisted", ".displayed");
                var entryContainer = floe.dashboard.page.injectEntryContainer(that);
                that.events.onEntryRetrieved.fire(row.doc, displayComponentType, entryContainer);
            });
        });
    };

    floe.dashboard.page.injectEntryContainer = function (that) {
        var entryList = that.locate("entryList");
        var noteId = "note-" + fluid.allocateGuid();
        var templateValues = {
            noteId: noteId
        };
        entryList.append(fluid.stringTemplate(that.options.resources.entryContainerTemplate, templateValues));
        var entryContainer = $("#" + noteId);
        return entryContainer;
    };

    floe.dashboard.page.createPageMarkup = function (that) {
        that.container.empty();
        var templateValues = {
            formattedCurrentDate: that.model.formattedCurrentDate
        };
        that.container.append(fluid.stringTemplate(that.options.resources.stringTemplate, templateValues));
    };

    // Relay initial preferences
    floe.dashboard.page.relayInitialPreferences = function (prefsEditor, page) {
        console.log("floe.dashboard.page.relayInitialPreferences");
        page.applier.change("preferences", prefsEditor.model.preferences);
        console.log(page);
    };

    // Compares the current preferences
    floe.dashboard.page.compareCurrentPreferences = function (prefsEditor, page) {
        console.log("floe.dashboard.page.comparePreferences");
        var prefsEditorPreferences = fluid.get(prefsEditor, "model.preferences");
        var pagePreferences = fluid.get(page, "model.preferences");
        var stats = {changes: 0, unchanged: 0, changeMap: {}};
        if(fluid.model.diff(prefsEditorPreferences, pagePreferences, stats) === false) {
            page.applier.change("preferences", prefsEditor.model.preferences);
            fluid.each(stats.changeMap, function (changeType, changePath) {
                var preferenceType = changePath;
                var preferenceValue = fluid.get(page, "model.preferences." + changePath);
                floe.dashboard.preferenceChange.persisted({
                    model: {
                        "preferenceChange": {
                            // What preference was changed
                            "preferenceType": preferenceType,
                            // What was it changed to
                            "preferenceValue": preferenceValue
                        }
                    },
                    listeners: {
                        "onPreferenceChangeStored.addEntry": {
                            func: "floe.dashboard.journal.addEntry",
                            args: ["{that}", page]
                        }
                    },
                    dbOptions: {
                        localName: page.options.dbOptions.localName,
                        remoteName: page.options.dbOptions.remoteName
                    }
                });
            });
        }
    };

})(jQuery, fluid);
