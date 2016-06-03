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
            "onCreate.createPageMarkup": {
                func: "floe.dashboard.page.createPageMarkup",
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

    floe.dashboard.page.createPageMarkup = function (that) {
        var journalHeading = that.container.append("<h1>" + that.model.name + "</h1>");
        var pageHeading = that.container.append("<h2>" + that.model.createdDatePretty + "</h2>");
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
                    name: page.options.dbOptions.name
                }
            });

            e.preventDefault();
        });
    };

    floe.dashboard.page.addNote = function (note, page) {
        console.log("floe.dashboard.page.addNote");
        // console.log(that);
        var db = new PouchDB(page.options.dbOptions.name);
        db.get(note.model._id).then(function (dbNote) {
            var entryContainer = floe.dashboard.page.injectEntryContainer(page);
            page.events.onEntryRetrieved.fire(dbNote, entryContainer);
        });
    };
})(jQuery, fluid);
