/*
Copyright 2016 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://raw.githubusercontent.com/fluid-project/chartAuthoring/master/LICENSE.txt
*/

/* global fluid, floe */

(function ($, fluid) {

    "use strict";

    // A grade that can automatically generate a view based on the supplied
    // model definition, and generate bindings between it and the model
    fluid.defaults("floe.dashboard.inferredView", {
        gradeNames: ["{that}.generateBindingGrade", "fluid.viewComponent"],
        // TODO: the spec for this needs documentation
        model: {
            inferredViews: {}
        },
        events: {
            onTemplateAppended: null,
            onBindingsApplied: null
        },
        listeners: {
            "onCreate.appendTemplate": {
                funcName: "floe.dashboard.inferredView.appendTemplate",
                args: ["{that}"]
            },
            "onCreate.applyBindings": {
                "funcName": "gpii.binder.applyBinding",
                args: ["{that}"],
                priority: "after:appendTemplate"
            },
            "onCreate.fireOnBindingsApplied": {
                this: "{that}.events.onBindingsApplied",
                method: "fire",
                priority: "after:applyBindings"
            }
        },
        invokers: {
            "generateBindingGrade": {
                funcName: "floe.dashboard.inferredView.generateBindingGrade",
                args: ["{that}.model.inferredViews", "{that}.options.stringTemplates.conf", "{that}.options.strings.conf"]
            }
        },
        strings: {
            conf: {
                valueSuffix: "value"
            }
        },
        stringTemplates: {
            conf: {
                classPrefix: "floec-inferredView-%inferredViewKey",
                selectorPrefix: "inferredView-%inferredViewKey",
                bindingPathPrefix: "inferredViews.%inferredViewKey"
            },
            choices: {
                "checkbox-choice": "<label for='%choiceId'>%choiceValue</label><input id='%choiceId' class='%classPrefix-value' name='%name' value='%choiceValue' type='checkbox' />",

                "select-choice": "<option value='%choiceValue'>%choiceValue</option>",

                "radio-choice": "<label for='%choiceId'>%choiceValue</label><input id='%choiceId' class='%classPrefix-value' name='%name' value='%choiceValue' type='radio' />"
            },
            wrappers: {
                "checkbox":  "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %classPrefix-wrapper floe-inferredView-%inferredViewKey-wrapper'><fieldset><legend>%label</legend>%renderedChoices</fieldset></div>",

                "text": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %classPrefix-wrapper floe-inferredView-%inferredViewKey-wrapper'><label for='%inputId' class='%classPrefix-label'>%label</label> <input id='%inputId' class='%classPrefix-value' type='text' value='%value' /></div>",

                "textarea": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %classPrefix-wrapper floe-inferredView-%inferredViewKey-wrapper'><label for='%inputId' class='%classPrefix-label'>%label</label> <textarea id='%inputId' class='%classPrefix-value'></textarea></div>",

                "select": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %classPrefix-wrapper floe-inferredView-%inferredViewKey-wrapper'><label for='%inputId' class='%classPrefix-label'>%label</label> <select class='%classPrefix-value' id='%inputId'>%renderedChoices</select></div>",

                "radio": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %classPrefix-wrapper floe-inferredView-%inferredViewKey-wrapper'><fieldset><legend>%label</legend>%renderedChoices</fieldset></div>"
            }
        }
    });

    floe.dashboard.inferredView.appendTemplate = function (that) {
        var totalMarkup = "";
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.generateInferredMarkup(that, inferredViewValue, inferredViewKey);
            totalMarkup = totalMarkup + markup;
        });
        that.container.append("<form class='floe-inferredView-form'>" + totalMarkup + "</form>");
        that.events.onTemplateAppended.fire();
    };

    floe.dashboard.inferredView.generateInferredMarkup = function (that, inferredViewValue, inferredViewKey ) {

        var baseTemplateValues = {inferredViewKey: inferredViewKey,
            label: inferredViewValue.label,
            value: inferredViewValue.value,
            inputId: "input-" + fluid.allocateGuid(),
            classPrefix: fluid.stringTemplate(that.options.stringTemplates.conf.classPrefix,       {inferredViewKey: inferredViewKey})};

        if(inferredViewValue.choices) {
            var renderedChoices = floe.dashboard.inferredView.getChoicesMarkup(that, inferredViewValue, inferredViewKey);
            $.extend(baseTemplateValues, {renderedChoices: renderedChoices});
        }

        var template = that.options.stringTemplates.wrappers[inferredViewValue.type];

        return fluid.stringTemplate(template, baseTemplateValues);


    };

    floe.dashboard.inferredView.getChoicesMarkup = function (that, inferredViewValue, inferredViewKey) {
        var type = inferredViewValue.type;
        var choiceTemplate = that.options.stringTemplates.choices[type + "-choice"];
        var renderedChoices = "";
        var name = type + "-" + fluid.allocateGuid();
        fluid.each(inferredViewValue.choices, function (choiceValue) {

            var baseTemplateValues = {choiceValue: choiceValue,
                  inferredViewValue: inferredViewValue,
                  inferredViewKey: inferredViewKey,
                  name: name,
                  choiceId: "choice-" + fluid.allocateGuid(),
                  classPrefix: fluid.stringTemplate(that.options.stringTemplates.conf.classPrefix, {inferredViewKey: inferredViewKey})};

            renderedChoices = renderedChoices + fluid.stringTemplate(choiceTemplate, baseTemplateValues);
        });
        return renderedChoices;
    };

    // Automatically generates bindings and selectors from inferred views
    floe.dashboard.inferredView.generateBindingGrade = function (inferredViews, confStringTemplates, confStrings) {
        var gradeName = "floe.dashboard.inferredView." + fluid.allocateGuid();

        var bindings = {}, selectors = {};

        fluid.each(inferredViews, function (inferredViewValue, inferredViewKey) {
            var templateValues = {inferredViewKey: inferredViewKey};

            var selectorKey = fluid.stringTemplate(confStringTemplates.selectorPrefix, templateValues) + "-" + confStrings.valueSuffix;

            var selectorClass = "." + fluid.stringTemplate(confStringTemplates.classPrefix, templateValues) + "-" + confStrings.valueSuffix;

            var bindingPath = fluid.model.composeSegments(fluid.stringTemplate(confStringTemplates.bindingPathPrefix, templateValues), confStrings.valueSuffix);

            selectors[selectorKey] = selectorClass;
            bindings[selectorKey] = {selector: selectorKey, path: bindingPath};
        });

        fluid.defaults(gradeName, {
            bindings: bindings,
            selectors: selectors
        });

        return gradeName;
    };

})(jQuery, fluid);
