/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

(function ($, fluid) {

    "use strict";

    fluid.registerNamespace("floe.tests.dashboard");

    jqUnit.test("Test pouchPersisted grade", function () {
        jqUnit.expect(0);
        var that = floe.dashboard.pouchPersisted({
            dbOptions: {
                name: "test"
            }
        });

        console.log(that);

        // jqUnit.assertTrue("If created without a timestamp, gets a timestamp", that.model.timeEvents.created);
        //
        // jqUnit.assertTrue("Automatic timestamp generates a parseable time", floe.tests.dashboard.isParseableTime(that.model.timeEvents.created));
        //
        // jqUnit.assertTrue("A lastModified time event is generated", that.model.timeEvents.lastModified);
        //
        // jqUnit.assertTrue("LastModified time event is parseable", floe.tests.dashboard.isParseableTime(that.model.timeEvents.created));
        //
        // var userSuppliedTime = "May, 2016";
        // // Expected result of cnverting new Date(userSuppliedTime) via
        // // Date.toJSON();
        // var convertedUserSuppliedTime = "2016-05-01T04:00:00.000Z";
        //
        // that = floe.dashboard.eventInTimeAware({
        //     model: {
        //         timeEvents: {
        //             created: userSuppliedTime
        //         }
        //     },
        // });
        //
        // jqUnit.assertEquals("User-supplied timestamp is respected", convertedUserSuppliedTime, that.model.timeEvents.created);
        //
        // jqUnit.assertTrue("A lastModified time event is generated", that.model.timeEvents.lastModified);

    });

})(jQuery, fluid);
