PouchDB.debug.enable('*');

// var notesDB = new PouchDB('notes');

// destroy the DB
// new PouchDB('notes').destroy();

// var note = floe.dashboard.note.new({
//     model: {
//         "text": chance.sentence()
//     }
// });

var journal = floe.dashboard.page(".floec-journal", {
    model: {
        "name": "Alan's Journal"
    },
    listeners: {
        "onCreate.bindSubmitEntryClick": {
            func: "floe.dashboard.page.bindSubmitEntryClick",
            args: "{that}"
        }
    },
    dbOptions: {
        name: "notes"
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

    // Get a number between -1 & -14

    var daysBack = floe.tests.dashboard.randInt(0, 14);
    console.log(daysBack);

    randomDate.setDate(-daysBack);
    randomDate = randomDate.toJSON();

        var note = floe.dashboard.note.new({
            model: {
                "text": randomText,
                timeEvents: {
                    created: randomDate,
                    lastModified: randomDate
                }

            },
            dbOptions: {
                name: "notes"
            }
        });
};

// floe.tests.dashboard.randomNote();

// Note creator

    // var note = floe.dashboard.note.new({
    //     model: {
    //         "text": chance.sentence()
    //     }
    // });


// notesDB.allDocs({include_docs: true}).then(function (response) {
//     console.log(response);
// });
