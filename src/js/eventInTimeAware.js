(function ($, fluid) {

    // A grade that deals in time,
    // and things related to time
    fluid.defaults("floe.dashboard.eventInTimeAware", {
        gradeNames: "fluid.modelComponent",
        model: {
            // A series of key-timestamp pairs
            timeEvents: {
                // created: "",
                // lastModified: ""
            }
        },
        listeners: {
            "onCreate.setCreatedTimeStamp": {
                func: "floe.dashboard.eventInTimeAware.setCreatedTimeStamp",
                args: ["{that}"]
            },
        },
        // We update "timeEvents.lastModified"  whenever the model is updated
        // except on initialization
        modelListeners: {
            "": {
                funcName: "floe.dashboard.eventInTimeAware.setModifiedTimeStamp",
                args: "{that}",
                excludeSource: "init"
            }
        }
    });

    floe.dashboard.eventInTimeAware.setCreatedTimeStamp = function (that) {
        // Only set the timestamp to current time if the model's current one is falsey
        var timestamp = that.model.timeEvents.created ? new Date(that.model.timeEvents.created) : new Date();
        that.applier.change("timeEvents.created", timestamp.toJSON());
    };

    floe.dashboard.eventInTimeAware.setModifiedTimeStamp = function (that) {
        var modifiedTimestamp = new Date();
        that.applier.change("timeEvents.lastModified", modifiedTimestamp.toJSON());
    };

})(jQuery, fluid);
