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
            // Keys in this model block will be used to automatically
            // generate markup and bindings for display and manipulation of
            // the model
            inferredViews: {
                // key: {
                //  label: descriptive label for the values
                //  value: the initial starting value
                //  type: the type of control to be generated - must match one
                //  of the wrapper types
                // choices: array of value choices for choice-supporting types -
                // type must be one of the choices-supporting types
                // }
            }
        },
        events: {
            onTemplateAppended: null,
            onBindingsApplied: null
        },
        listeners: {
            "onCreate.appendModelGeneratedTemplate": {
                funcName: "floe.dashboard.inferredView.appendModelGeneratedTemplate",
                args: ["{that}"]
            },
            "onCreate.applyBindings": {
                "funcName": "gpii.binder.applyBinding",
                args: ["{that}"],
                priority: "after:appendModelGeneratedTemplate"
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
                controlClassPrefix: "floec-inferredView-%inferredViewKey",
                styleClassPrefix: "floe-inferredView-%inferredViewKey",
                selectorPrefix: "inferredView-%inferredViewKey",
                bindingPathPrefix: "inferredViews.%inferredViewKey"
            },
            choices: {
                "checkbox-choice": "<label for='%choiceId'>%choiceValue</label><input id='%choiceId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' name='%name' value='%choiceValue' type='checkbox' />",

                "select-choice": "<option value='%choiceValue'>%choiceValue</option>",

                "radio-choice": "<label for='%choiceId'>%choiceValue</label><input id='%choiceId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' name='%name' value='%choiceValue' type='radio' />"
            },
            wrappers: {
                "checkbox":  "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'><fieldset><legend>%label</legend>%renderedChoices</fieldset></div>",

                "text": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'><label for='%inputId' class='%controlClassPrefix-label'>%label</label> <input id='%inputId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' type='text' value='%value' /></div>",

                "textarea": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'><label for='%inputId' class='%controlClassPrefix-label'>%label</label> <textarea id='%inputId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix'></textarea></div>",

                "select": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'><label for='%inputId' class='%controlClassPrefix-label'>%label</label> <select class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' id='%inputId'>%renderedChoices</select></div>",

                "radio": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'><fieldset><legend>%label</legend>%renderedChoices</fieldset></div>"
            }
        }
    });

    floe.dashboard.inferredView.appendModelGeneratedTemplate = function (that) {
        var totalMarkup = "";
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.generateInferredMarkup(that, inferredViewValue, inferredViewKey);
            totalMarkup = totalMarkup + markup;
        });
        that.container.append("<form class='floe-inferredView-form'>" + totalMarkup + "</form>");
        that.events.onTemplateAppended.fire();
    };

    // Returns the base set of template values shared between different template functions
    floe.dashboard.inferredView.getCommonTemplateValues = function (that, inferredViewValue, inferredViewKey) {
        return  {
            inferredViewKey: inferredViewKey,
            controlClassPrefix: fluid.stringTemplate(that.options.stringTemplates.conf.controlClassPrefix, {inferredViewKey: inferredViewKey}),
            styleClassPrefix: fluid.stringTemplate(that.options.stringTemplates.conf.styleClassPrefix, {inferredViewKey: inferredViewKey}),
            valueSuffix: that.options.strings.conf.valueSuffix
        };
    };

    floe.dashboard.inferredView.generateInferredMarkup = function (that, inferredViewValue, inferredViewKey) {

        var baseTemplateValues =
            {
                label: inferredViewValue.label,
                value: inferredViewValue.value,
                inputId: "input-" + fluid.allocateGuid()
            };

        $.extend(true, baseTemplateValues, floe.dashboard.inferredView.getCommonTemplateValues(that, inferredViewValue, inferredViewKey ));

        if(inferredViewValue.choices) {
            var renderedChoices = floe.dashboard.inferredView.getChoicesMarkup(that, inferredViewValue, inferredViewKey);
            $.extend(true, baseTemplateValues, {renderedChoices: renderedChoices});
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

            var baseTemplateValues =
                {
                    choiceValue: choiceValue,
                    name: name,
                    choiceId: "choice-" + fluid.allocateGuid(),
                };

            $.extend(true, baseTemplateValues, floe.dashboard.inferredView.getCommonTemplateValues(that, inferredViewValue, inferredViewKey ));

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

            var selectorClass = "." + fluid.stringTemplate(confStringTemplates.controlClassPrefix, templateValues) + "-" + confStrings.valueSuffix;

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
