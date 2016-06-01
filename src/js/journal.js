fluid.defaults("floe.dashboard.journal", {
    gradeNames: "fluid.viewComponent",
    selectors: {
        entryList: ".floec-entryList"
    },
    model: {
        "name": "",
        "entries": {}
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
                "model": "{that}.options.onEntryRetrievedArgs"
            }
        }
    },
    listeners: {
        "onCreate.getEntries": {
            func: "floe.dashboard.journal.getEntries",
            args: "{that}"
        },
        "onCreate.createJournalMarkup": {
            func: "floe.dashboard.journal.createJournalMarkup",
            args: "{that}",
            priority: "before:getEntries"
        }
    }
});

floe.dashboard.journal.getEntries = function (that) {
    // console.log("floe.dashboard.journal.getEntries");
    notesDB.allDocs({include_docs: true}).then(function (response) {
        that.noteIdCounter = 0;
        fluid.each(response.rows, function (row) {
            entryContainer = floe.dashboard.journal.injectEntryContainer(that);
            that.events.onEntryRetrieved.fire(row.doc, entryContainer);
        });
    });
};

floe.dashboard.journal.injectEntryContainer = function (that) {
    console.log(that);
    var entryList = that.locate("entryList");
    var currentId = "note-"+that.noteIdCounter;
    entryList.append("<li id='" + currentId + "'></li>");
    var entryContainer = $("#"+currentId);
    that.noteIdCounter++;
    console.log(entryContainer);
    return entryContainer;
};

floe.dashboard.journal.createJournalMarkup = function (that) {
    var journalHeading = that.container.append("<h1>" + that.model.name + "</h1>");
    that.container.append("<ol class='floec-entryList'>");
};

floe.dashboard.journal.bindSubmitEntryClick = function (that) {
    var journal = that;
    $("#floec-submitEntry").click(function (e) {
        var entryText = $("#floec-newEntry").val();
        var note = floe.dashboard.note.new({
            model: {
                "text": entryText
            },
            listeners: {
                "onNoteStored.AddNoteToJournal": {
                    func: "floe.dashboard.journal.addNoteToJournal",
                    args: ["{that}", journal]
                }
            }
        });

        // console.log(noteDoc);

        e.preventDefault();
    });
};

floe.dashboard.journal.addNoteToJournal = function (note, journal) {
    console.log("floe.dashboard.journal.addNoteToJournal");
    // console.log(that);
    notesDB.get(note.model._id).then(function (dbNote) {
        var entryContainer = floe.dashboard.journal.injectEntryContainer(journal);
        journal.events.onEntryRetrieved.fire(dbNote, entryContainer);
    });
};
