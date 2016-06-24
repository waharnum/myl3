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
            that.entryIDCounter = 0;
            fluid.each(response.rows, function (row) {
                var displayComponentType = row.doc.persistenceInformation.typeName.replace(".persisted", ".displayed");
                var entryContainer = floe.dashboard.page.injectEntryContainer(that);
                that.events.onEntryRetrieved.fire(row.doc, displayComponentType, entryContainer);
            });
        });
    };

    floe.dashboard.page.injectEntryContainer = function (that) {
        // console.log(that);
        var entryList = that.locate("entryList");
        var currentId = "note-" + that.entryIDCounter;
        entryList.append("<li id='" + currentId + "'></li>");
        var entryContainer = $("#" + currentId);
        that.entryIDCounter++;
        // console.log(entryContainer);
        return entryContainer;
    };

    floe.dashboard.page.createPageMarkup = function (that) {
        that.container.empty();
        that.container.append("<h1>" + that.model.name + "</h1>");
        that.container.append("<h2>" + that.model.formattedCurrentDate + "</h2>");
        that.container.append("<ol class='floec-entryList floe-entryList'>");
    };

    floe.dashboard.page.bindSubmitEntryClick = function (that, promptId, buttonId, textAreaId, prompt) {
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
                        func: "floe.dashboard.page.addEntry",
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

    floe.dashboard.page.bindBackLink = function (that) {
        $("#floec-page-back").click(function (e) {
            console.log("back");
            that.rollDate(-1);
            e.preventDefault();
        });
    };

    floe.dashboard.page.bindForwardLink = function (that) {
        $("#floec-page-forward").click(function (e) {
            console.log("forward");
            that.rollDate(1);
            e.preventDefault();
        });
    };

    floe.dashboard.page.addEntry = function (note, page) {
        console.log("floe.dashboard.page.addEntry");
        // console.log(that);
        var db = new PouchDB(page.options.dbOptions.localName);
        db.get(note.model._id).then(function (dbNote) {
            var displayComponentType = dbNote.persistenceInformation.typeName.replace(".persisted", ".displayed");
            var entryContainer = floe.dashboard.page.injectEntryContainer(page);
            page.events.onEntryRetrieved.fire(dbNote, displayComponentType, entryContainer);
        });
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
                            func: "floe.dashboard.page.addEntry",
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
