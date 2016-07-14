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
        gradeNames: ["fluid.viewComponent"],
        model: {
            // Who does the journal belong to?
            journalName: "My Journal"
        },
        selectors: {
            page: ".floec-journal-page"
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
            "onCreate.bindMoodSubmitClick": {
                func: "floe.dashboard.journal.bindMoodSubmitClick",
                args: ["{page}", "#floec-prompt-feel", "#floec-submitEntry-feel", "#floec-newEntry-feel", "I felt..."]
            },
            "onCreate.bindAchieveSubmitEntryClick": {
                func: "floe.dashboard.journal.bindGoalSubmitClick",
                args: ["{page}", "#floec-prompt-achieve",  "#floec-submitEntry-achieve", "#floec-newEntry-achieve", "#floec-newEntry-achieve-date", "I set a goal to..."]
            },
            "onCreate.bindBackOneMonthLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-back-oneMonth", -30]
            },
            "onCreate.bindBackOneWeekLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-back-oneWeek", -7]
            },
            "onCreate.bindBackOneDayLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-back-oneDay", -1]
            },
            "onCreate.bindForwardOneDayLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-forward-oneDay", 1]
            },
            "onCreate.bindForwardOneWeekLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-forward-oneWeek", 7]
            },
            "onCreate.bindForwardOneMonthLink": {
                func: "floe.dashboard.journal.bindJournalNavLink",
                args: ["{page}", "#floec-page-forward-oneMonth", 30]
            },
            "onCreate.bindTodayLink": {
                func: "floe.dashboard.journal.bindJournalNavLinkToday",
                args: ["{page}", "#floec-page-today"]
            }
        },
        // page, selector, roll
        resources: {
            markup: "<div class=\"floec-journal-page\"></div><form><p>Right now, I feel... <input id=\"floec-newEntry-feel\"></input> <button id=\"floec-submitEntry-feel\" type=\"submit\">Submit</button></p></form><form><p>I want to set a goal to... <input id=\"floec-newEntry-achieve\"></input> <input id=\"floec-newEntry-achieve-date\" type=\"date\" value=\"yyyy-mm-dd\"></input> <button id=\"floec-submitEntry-achieve\" type=\"submit\">Submit</button></p></form><span class=\"floe-journalNav\"><a href=\"#\" id=\"floec-page-back-oneMonth\"><span class=\"floe-navArrow floe-navArrow-back\">&#x25C0;&#x25C0;&#x25C0;</span><span class=\"hidden\">Back</span> One Month</a> <a href=\"#\" id=\"floec-page-back-oneWeek\"><span class=\"floe-navArrow floe-navArrow-back\">&#x25C0;&#x25C0;</span><span class=\"hidden\">Back</span> One Week</a> <a href=\"#\" id=\"floec-page-back-oneDay\"><span class=\"floe-navArrow floe-navArrow-back\">&#x25C0;</span><span class=\"hidden\">Back</span> One Day</a> <span class=\"floe-page-today\"><a href=\"#\" id=\"floec-page-today\">Today</a></span> <a href=\"#\" id=\"floec-page-forward-oneDay\"><span class=\"floe-navArrow floe-navArrow-forward\">&#x25B6;</span><span class=\"hidden\">Forward</span> One Day</a> <a href=\"#\" id=\"floec-page-forward-oneWeek\"><span class=\"floe-navArrow floe-navArrow-forward\">&#x25B6;&#x25B6;</span><span class=\"hidden\">Forward</span> One Week</a> <a href=\"#\" id=\"floec-page-forward-oneMonth\"><span class=\"floe-navArrow floe-navArrow-forward\">&#x25B6;&#x25B6;&#x25B6;</span><span class=\"hidden\">Forward</span> One Month</a></span>"
        }
    });

    floe.dashboard.journal.bindMoodSubmitClick = function (page, promptId, buttonId, textAreaId, prompt) {
        $(buttonId).click(function (e) {
            var entryText = $(textAreaId).val();
            floe.dashboard.mood.persisted({
                model: {
                    "text": entryText,
                    "prompt": prompt
                },
                listeners: {
                    "onMoodStored.addMoodEntry": {
                        func: page.addEntry,
                        args: ["{that}"]
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

    floe.dashboard.journal.bindGoalSubmitClick = function (page, promptId, buttonId, textAreaId, entryDueId, prompt) {
        $(buttonId).click(function (e) {
            var entryText = $(textAreaId).val();
            var entryDue = $(entryDueId).val();
            floe.dashboard.goal.persisted({
                model: {
                    "text": entryText,
                    "prompt": prompt,
                    "due": entryDue
                },
                listeners: {
                    "onGoalStored.addGoalEntry": {
                        func: page.addEntry,
                        args: ["{that}"]
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

    floe.dashboard.journal.bindJournalNavLink = function (page, selector, roll) {
        $(selector).click(function (e) {
            page.rollDate(roll);
            e.preventDefault();
        });
    };

    floe.dashboard.journal.bindJournalNavLinkToday = function (page, selector) {
        $(selector).click(function (e) {
            var today = new Date().toJSON();
            page.applier.change("currentDate", today);
            e.preventDefault();
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
                func: "{that}.getEntries"
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
            },
            "getEntries": {
                funcName: "floe.dashboard.page.getEntries",
                args: "{that}"
            },
            "addEntry": {
                funcName: "floe.dashboard.page.addEntry",
                args: ["{arguments}.0", "{that}"]
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

    floe.dashboard.page.addEntry = function (entry, page) {
        var db = new PouchDB(page.options.dbOptions.localName);
        db.get(entry.model._id).then(function (dbNote) {
            var displayComponentType = dbNote.persistenceInformation.typeName.replace(".persisted", ".displayed");
            var entryContainer = floe.dashboard.page.injectEntryContainer(page);
            page.events.onEntryRetrieved.fire(dbNote, displayComponentType, entryContainer);
        });
    };

    floe.dashboard.page.rollDate = function (that, daysToRoll) {
        var currentDate = new Date(that.model.currentDate);
        currentDate.setDate(currentDate.getDate() + daysToRoll);
        that.applier.change("currentDate", currentDate);
    };

    floe.dashboard.page.retrieveFromPouch = function (dbName, startkey, endkey, that, callbackFunc) {
        var db = new PouchDB(dbName);
        db.allDocs({
            include_docs: true,
            // start and end date filtering
            startkey: startkey,
            endkey: endkey
        }).then(function (response) {
            callbackFunc(that, response);
        });
    };

    floe.dashboard.page.createEntriesFromPouchResponse = function (that, pouchResponse) {
        fluid.each(pouchResponse.rows, function (row) {
            var displayComponentType = row.doc.persistenceInformation.typeName.replace(".persisted", ".displayed");
            var entryContainer = floe.dashboard.page.injectEntryContainer(that);
            that.events.onEntryRetrieved.fire(row.doc, displayComponentType, entryContainer);
        });
    };

    floe.dashboard.page.getEntries = function (that) {
        var pageDate = new Date(that.model.currentDate);
        var pageUTCFull = pageDate.toJSON();
        var pageUTCDate = pageUTCFull.slice(0,pageUTCFull.indexOf("T"));

        var startkey = pageUTCDate + that.options.constants.startOfDayUTC,
            endkey = pageUTCDate + that.options.constants.endOfDayUTC,
            dbName = that.options.dbOptions.localName;

        floe.dashboard.page.retrieveFromPouch(dbName, startkey, endkey, that, floe.dashboard.page.createEntriesFromPouchResponse);
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

    floe.dashboard.page.filterModelOptions = function(prefPanel, filterString) {
        var copiedModelOptions = fluid.copy(prefPanel.options.model[0]);
        var filtered = fluid.remove_if(copiedModelOptions, function (modelItem) {
            return !(modelItem.indexOf(filterString) > -1);
        });
        return filtered;
    };

    floe.dashboard.page.extractPreferenceMessages = function(prefPanelOptions, filterString, messageBaseOptionsBlock) {
        var messages = {};
        fluid.each(prefPanelOptions, function (modelItem) {
                var prefKey = modelItem.replace(filterString + ".", "");
                // console.log(prefKey);

                    var prefsModelMessages = {
                        // label,
                        // description,
                        // multiplier
                        // various values...
                        values: {
                        }
                    };

                    fluid.each(messageBaseOptionsBlock, function (message, key) {
                        if(key.indexOf("Label") > -1) {
                            // console.log("Label case");
                            // console.log(key, message);
                            prefsModelMessages.label = message;
                        } else if (key.indexOf("Descr") > -1) {
                            // console.log("Descr case");
                            // console.log(key, message);
                            prefsModelMessages.description = message;
                        } else if (key.indexOf("-") > -1) {
                            // console.log("Value case");
                            // console.log(key, message);
                            var valueKey = key.split("-")[1];
                            prefsModelMessages.values[valueKey] = message;
                        } else {
                            // console.log("other case");
                            // console.log(key, message);
                            prefsModelMessages[key] = message;
                        }
                    });

                    messages[prefKey] = prefsModelMessages;
        });
        return messages;
    };

    // Relay initial preferences
    floe.dashboard.page.addPreferenceMessage = function (prefPanel, page) {
        // Panel itself

        var modelOptionsBlock = fluid.copy(prefPanel.options.model[0]);

        var messageBaseOptionsBlock = fluid.copy(prefPanel.options.messageBase);

        var singlePanelFilterString = "{prefsEditor}.model.preferences";
        var compositePanelFilterString = "{compositePanel}.model";

        var singlePanelOptions = floe.dashboard.page.filterModelOptions(prefPanel, singlePanelFilterString);

        var compositePanelOptions = floe.dashboard.page.filterModelOptions(prefPanel, compositePanelFilterString);

        var singlePanelMessages = floe.dashboard.page.extractPreferenceMessages(singlePanelOptions, singlePanelFilterString, messageBaseOptionsBlock);

        // console.log(singlePanelMessages);

        page.preferencesMessagesSinglePanel = page.preferencesMessagesSinglePanel || {};

        fluid.each(singlePanelMessages, function (message, key) {
            page.preferencesMessagesSinglePanel[key] = message;
        });

        var compositePanelMessages = floe.dashboard.page.extractPreferenceMessages(compositePanelOptions, compositePanelFilterString, messageBaseOptionsBlock);

        page.preferencesMessagesCompositePanel = page.preferencesMessagesCompositePanel || {};

        // console.log(compositePanelMessages);
        fluid.each(compositePanelMessages, function (message, key) {
            page.preferencesMessagesCompositePanel[key] = message;
        });
    };

    // Relay initial preferences
    floe.dashboard.page.relayInitialPreferences = function (prefsEditor, page) {
        page.applier.change("preferences", prefsEditor.model.preferences);
    };

    floe.dashboard.page.lookupPreferenceMessage = function(preferenceType, preferenceValue, page) {
        // Try composite panel messages first (assume more specific)
        var compositeMessages = page.preferencesMessagesCompositePanel;
        // Try single panel next
        var singleMessages = page.preferencesMessagesSinglePanel;
        // Fall back to raw
        var messageToUse = compositeMessages[preferenceType] ? compositeMessages[preferenceType] : singleMessages[preferenceType] ? singleMessages[preferenceType] : preferenceType;
                var typeLabelToUse = messageToUse.label ? messageToUse.label : preferenceType;

        var valueLabelToUse;
        if(messageToUse.values) {
            valueLabelToUse = messageToUse.values[preferenceValue] ? messageToUse.values[preferenceValue] : preferenceValue;
        } else valueLabelToUse = preferenceValue;

        return {
            typeLabelToUse: typeLabelToUse,
            valueLabelToUse: valueLabelToUse
        };

    };

    // Compares the current preferences
    floe.dashboard.page.trackPreferenceChanges = function (prefsEditor, page) {
        var prefsEditorPreferences = fluid.get(prefsEditor, "model.preferences");
        var pagePreferences = fluid.get(page, "model.preferences");
        var stats = {changes: 0, unchanged: 0, changeMap: {}};
        if(fluid.model.diff(prefsEditorPreferences, pagePreferences, stats) === false) {
            page.applier.change("preferences", prefsEditor.model.preferences);
            fluid.each(stats.changeMap, function (changeType, changePath) {
                var preferenceType = changePath;
                var preferenceValue = fluid.get(page, "model.preferences." + changePath);

                var lookedUpValues = floe.dashboard.page.lookupPreferenceMessage(preferenceType, preferenceValue, page);

                floe.dashboard.preferenceChange.persisted({
                    model: {
                        "preferenceChange": {
                            // What preference was changed
                            "preferenceType": preferenceType,
                            "preferenceTypeLabel": lookedUpValues.typeLabelToUse,
                            "preferenceValueLabel": lookedUpValues.valueLabelToUse,
                            // What was it changed to
                            "preferenceValue": preferenceValue
                        }
                    },
                    listeners: {
                        "onPreferenceChangeStored.addEntry": {
                            func: page.addEntry,
                            args: ["{that}"]
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
