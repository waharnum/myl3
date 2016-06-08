(function ($, fluid) {
    fluid.defaults("floe.dashboard.page", {
        gradeNames: ["floe.dashboard.eventInTimeAware", "fluid.viewComponent"],
        selectors: {
            entryList: ".floec-entryList"
        },
        events: {
            onEntryRetrieved: null
        },
        model: {
            // The date of the page
            date: new Date().toJSON()
        },
        dynamicComponents: {
            note: {
                createOnEvent: "onEntryRetrieved",
                type: "floe.dashboard.note.displayed",
                container: "{arguments}.1",
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
        modelListeners: {
            "createPageMarkup": {
                path: "date",
                func: "floe.dashboard.page.createPageMarkup",
                args: "{that}",
                priority: "before:getEntries",
                excludeSource: "init"
            },
            "getEntries": {
                path: "date",
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
        var currentDate = new Date(that.model.date);
        currentDate.setDate(currentDate.getDate() + daysToRoll);
        that.applier.change("date", currentDate);
    };

    floe.dashboard.page.getEntries = function (that, date) {
        // console.log("floe.dashboard.page.getEntries");

        var pageDate = new Date(that.model.date);
        var pageUTCFull = pageDate.toJSON();
        var pageUTCDate = pageUTCFull.slice(0,pageUTCFull.indexOf("T"));

        var db = new PouchDB(that.options.dbOptions.localName);
        db.allDocs({
            include_docs: true,
            // start and end date filtering
            startkey: pageUTCDate + that.options.constants.startOfDayUTC,
            endkey: pageUTCDate + that.options.constants.endOfDayUTC
            }).then(function (response) {
            that.noteIdCounter = 0;
            fluid.each(response.rows, function (row) {
                entryContainer = floe.dashboard.page.injectEntryContainer(that);
                that.events.onEntryRetrieved.fire(row.doc, entryContainer);
            });
        });
    };

    floe.dashboard.page.injectEntryContainer = function (that) {
        // console.log(that);
        var entryList = that.locate("entryList");
        var currentId = "note-"+that.noteIdCounter;
        entryList.append("<li id='" + currentId + "'></li>");
        var entryContainer = $("#"+currentId);
        that.noteIdCounter++;
        // console.log(entryContainer);
        return entryContainer;
    };

    floe.dashboard.page.createPageMarkup = function (that) {
        that.container.empty();
        var journalHeading = that.container.append("<h1>" + that.model.name + "</h1>");
        var pageHeading = that.container.append("<h2>" + that.model.date + "</h2>");
        that.container.append("<ol class='floec-entryList floe-entryList'>");
    };

    floe.dashboard.page.bindSubmitEntryClick = function (that) {
        var page = that;
        $("#floec-submitEntry").click(function (e) {
            var entryText = $("#floec-newEntry").val();
            var note = floe.dashboard.note.new({
                model: {
                    "text": entryText
                },
                listeners: {
                    "onNoteStored.AddNote": {
                        func: "floe.dashboard.page.addNote",
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

    floe.dashboard.page.addNote = function (note, page) {
        console.log("floe.dashboard.page.addNote");
        // console.log(that);
        var db = new PouchDB(page.options.dbOptions.localName);
        db.get(note.model._id).then(function (dbNote) {
            var entryContainer = floe.dashboard.page.injectEntryContainer(page);
            page.events.onEntryRetrieved.fire(dbNote, entryContainer);
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
            var prefChangeNote = "";
            fluid.each(stats.changeMap, function (changeType, changePath) {
                var preferenceType = changePath;
                var preferenceValue = fluid.get(page, "model.preferences."+changePath);
                var note = floe.dashboard.note.new({
                    model: {
                        "text": "Changed " + preferenceType + " to " + preferenceValue
                    },
                    listeners: {
                        "onNoteStored.AddNote": {
                            func: "floe.dashboard.page.addNote",
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
