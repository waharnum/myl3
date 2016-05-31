PouchDB.debug.enable('*');

var notesDB = new PouchDB('notes');

// destroy the DB
// new PouchDB('notes').destroy();

fluid.defaults("floe.dashboard.note", {
    gradeNames: "fluid.modelComponent",
    model: {
        "text": "",
        "timestamp": null,
        "timestampPretty": null
    },
    modelRelay: {
        target: "{that}.model.timestampPretty",
        singleTransform: {
            input: "{that}.model.timestamp",
            type: "fluid.transforms.free",
            args: ["{that}.model.timestamp"],
            func: "floe.dashboard.note.getPrettyTimestamp"
        }
    }
});

fluid.defaults("floe.dashboard.note.new", {
    gradeNames: "floe.dashboard.note",
    listeners: {
        "onCreate.setTimestamp": {
            func: "floe.dashboard.note.setTimestamp",
            args: [Date.now(), "{that}"]
        },
        "onCreate.storeNote": {
            func: "floe.dashboard.note.storeNote",
            args: "{that}",
            priorities: "after:setTimestamp"
        }
    }
});

floe.dashboard.note.setText = function (text, that) {
    that.applier.change("text", text)
}

floe.dashboard.note.setTimestamp = function (date, that) {
    that.applier.change("timestamp", date)
}

floe.dashboard.note.getPrettyTimestamp = function (timestamp) {
    var pretty = new Date(timestamp);
    return pretty;
}

floe.dashboard.note.storeNote = function (that) {
    var note = {
        "_id": "note-" + that.model.timestamp,
        "timestamp": that.model.timestamp,
        "text": that.model.text
    }
    notesDB.put(note);
}

// var note = floe.dashboard.note.new({
//     model: {
//         "text": chance.sentence()
//     }
// });

fluid.defaults("floe.dashboard.journal", {
    gradeNames: "fluid.viewComponent",
    model: {
        "name": "",
        "entries": {}
    },
    events: {
        onEntriesReady: null
    },
    listeners: {
        "onCreate.getEntries": {
            func: "floe.dashboard.journal.getEntries",
            args: "{that}"
        },
        "onEntriesReady.displayJournal": {
            func: "floe.dashboard.journal.displayJournal",
            args: "{that}"
        }
    }
});


floe.dashboard.journal.getEntries = function (that) {
    // console.log("floe.dashboard.journal.getEntries");
    notesDB.allDocs({include_docs: true}).then(function (response) {
        fluid.each(response.rows, function (row) {
            that.applier.change("entries." + row.id, row.doc)
        });
        that.events.onEntriesReady.fire();
    });
}

floe.dashboard.journal.displayJournal = function (that) {
    // console.log("floe.dashboard.journal.displayJournal");
    console.log(that);
    var journalHeading = that.container.append("<h1>" + that.model.name + "</h1>")
    that.container.append("<ol class='floec-entryList'>");
    var entryList = $(".floec-entryList");

    fluid.each(that.model.entries, function (entry, idx) {
        var prettyTime = floe.dashboard.note.getPrettyTimestamp(entry.timestamp);
        entryList.append("<li>" + prettyTime + "<br/>" + entry.text + "</li>");
    });
}

var journal = floe.dashboard.journal(".floec-journal", {
    model: {
        "name": "Alan's Journal"
    }
});

$("#floec-submitEntry").click(function (e) {
    var entryText = $("#floec-newEntry").val()
    var note = floe.dashboard.note.new({
        model: {
            "text": entryText
        }
    });
    e.preventDefault();
});

// notesDB.allDocs({include_docs: true}).then(function (response) {
//     console.log(response);
// });
