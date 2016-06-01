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
        modelListeners: {
            "": {
                funcName: "floe.dashboard.eventInTimeAware.setModifiedTimeStamp",
                args: "{that}"                
            }
        }
    });

    floe.dashboard.eventInTimeAware.setCreatedTimeStamp = function (that) {
        // Only set the timestamp to Date.now() if the model's current one is falsey
        var timestamp = that.model.timeEvents.created || Date.now();
        that.applier.change("timeEvents.created", timestamp);
    };

    floe.dashboard.eventInTimeAware.setModifiedTimeStamp = function (that) {
        that.applier.change("timeEvents.lastModified", Date.now());
    };

})(jQuery, fluid);
