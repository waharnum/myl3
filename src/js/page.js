(function ($, fluid) {
    fluid.defaults("floe.dashboard.page", {
        gradeNames: ["floe.dashboard.eventInTimeAware", "fluid.viewComponent"],
        selectors: {
            entryList: ".floec-entryList"
        },
        events: {
            onEntryRetrieved: null
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
                        name: "{page}.options.dbOptions.name"
                    }
                }
            }
        },
        listeners: {
            "onCreate.getEntries": {
                func: "floe.dashboard.page.getEntries",
                args: "{that}"
            },
            "onCreate.createJournalMarkup": {
                func: "floe.dashboard.page.createJournalMarkup",
                args: "{that}",
                priority: "before:getEntries"
            }
        },
        dbOptions: {
            // name: "notes"
        }
    });

    floe.dashboard.page.getEntries = function (that) {
        // console.log("floe.dashboard.page.getEntries");
        var db = new PouchDB(that.options.dbOptions.name);
        db.allDocs({include_docs: true}).then(function (response) {
            that.noteIdCounter = 0;
            fluid.each(response.rows, function (row) {
                entryContainer = floe.dashboard.page.injectEntryContainer(that);
                that.events.onEntryRetrieved.fire(row.doc, entryContainer);
            });
        });
    };

    floe.dashboard.page.injectEntryContainer = function (that) {
        console.log(that);
        var entryList = that.locate("entryList");
        var currentId = "note-"+that.noteIdCounter;
        entryList.append("<li id='" + currentId + "'></li>");
        var entryContainer = $("#"+currentId);
        that.noteIdCounter++;
        console.log(entryContainer);
        return entryContainer;
    };

    floe.dashboard.page.createJournalMarkup = function (that) {
        var journalHeading = that.container.append("<h1>" + that.model.createdDatePretty + "</h1>");
        that.container.append("<ol class='floec-entryList floe-entryList'>");
    };

    floe.dashboard.page.bindSubmitEntryClick = function (that) {
        var journal = that;
        $("#floec-submitEntry").click(function (e) {
            var entryText = $("#floec-newEntry").val();
            var note = floe.dashboard.note.new({
                model: {
                    "text": entryText
                },
                listeners: {
                    "onNoteStored.AddNoteToJournal": {
                        func: "floe.dashboard.page.addNoteToJournal",
                        args: ["{that}", journal]
                    }
                },
                dbOptions: {
                    name: journal.options.dbOptions.name
                }
            });

            // console.log(noteDoc);

            e.preventDefault();
        });
    };

    floe.dashboard.page.addNoteToJournal = function (note, journal) {
        console.log("floe.dashboard.page.addNoteToJournal");
        // console.log(that);
        var db = new PouchDB(journal.options.dbOptions.name);
        db.get(note.model._id).then(function (dbNote) {
            var entryContainer = floe.dashboard.page.injectEntryContainer(journal);
            journal.events.onEntryRetrieved.fire(dbNote, entryContainer);
        });
    };
})(jQuery, fluid);
