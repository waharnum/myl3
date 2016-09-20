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
        gradeNames: ["{that}.getAutoBindingGrade", "fluid.viewComponent"],
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
            "getAutoBindingGrade": {
                funcName: "floe.dashboard.inferredView.getAutoBindingGrade",
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
                "checkable-choice": "<label for='%choiceId'>%choiceValue</label><input id='%choiceId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' name='%name' value='%choiceValue' type='%type' />",

                "checkbox-choice": "{that}.options.stringTemplates.choices.checkable-choice",

                "radio-choice": "{that}.options.stringTemplates.choices.checkable-choice",

                "select-choice": "<option value='%choiceValue'>%choiceValue</option>"
            },
            values: {
                "checkable": "<fieldset><legend>%label</legend>%choices</fieldset>",

                "checkbox":  "{that}.options.stringTemplates.values.checkable",

                "radio": "{that}.options.stringTemplates.values.checkable",

                "input": "<label for='%inputId' class='%controlClassPrefix-label'>%label</label> <input id='%inputId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' type='%type' value='%value' />",

                "text": "{that}.options.stringTemplates.values.input",

                "number": "{that}.options.stringTemplates.values.input",

                "textarea": "<label for='%inputId' class='%controlClassPrefix-label'>%label</label> <textarea id='%inputId' class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix'></textarea>",

                "select": "<label for='%inputId' class='%controlClassPrefix-label'>%label</label> <select class='%controlClassPrefix-%valueSuffix %styleClassPrefix-%valueSuffix' id='%inputId'>%choices</select>"
            },
            wrappers: {
                "default-wrapper": "<div class='floec-inferredView-wrapper floe-inferredView-wrapper %controlClassPrefix-wrapper %styleClassPrefix-wrapper'>%values</div>"
            }
        }
    });

    floe.dashboard.inferredView.appendModelGeneratedTemplate = function (that) {
        var totalMarkup = "";
        fluid.each(that.model.inferredViews, function (inferredViewValue, inferredViewKey) {
            var markup = floe.dashboard.inferredView.getInferredMarkup(that, inferredViewValue, inferredViewKey);
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

    floe.dashboard.inferredView.getInferredMarkup = function (that, inferredViewValue, inferredViewKey) {
        var type = inferredViewValue.type;

        var baseTemplateValues =
            {
                label: inferredViewValue.label,
                value: inferredViewValue.value,
                inputId: "input-" + fluid.allocateGuid(),
                type: type
            };

        $.extend(true, baseTemplateValues, floe.dashboard.inferredView.getCommonTemplateValues(that, inferredViewValue, inferredViewKey ));

        if(inferredViewValue.choices) {
            var renderedChoices = floe.dashboard.inferredView.getChoicesMarkup(that, inferredViewValue, inferredViewKey);
            $.extend(true, baseTemplateValues, {choices: renderedChoices});
        }

        var template = that.options.stringTemplates.values[type];

        var renderedValues = fluid.stringTemplate(template, baseTemplateValues);

        var templateValues = $.extend(true, floe.dashboard.inferredView.getCommonTemplateValues(that, inferredViewValue, inferredViewKey), {values: renderedValues});

        var wrapperTemplate = that.options.stringTemplates.wrappers[type + "-wrapper"] ? that.options.stringTemplates.wrappers[type + "-wrapper"] : that.options.stringTemplates.wrappers["default-wrapper"];

        return fluid.stringTemplate(wrapperTemplate, templateValues);

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
                    type: type
                };

            $.extend(true, baseTemplateValues, floe.dashboard.inferredView.getCommonTemplateValues(that, inferredViewValue, inferredViewKey ));

            renderedChoices = renderedChoices + fluid.stringTemplate(choiceTemplate, baseTemplateValues);
        });
        return renderedChoices;
    };

    // Automatically generates bindings and selectors from inferred views
    floe.dashboard.inferredView.getAutoBindingGrade = function (inferredViews, confStringTemplates, confStrings) {
        var gradeName = "floe.dashboard.inferredView.bindingGrade-" + fluid.allocateGuid();

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
