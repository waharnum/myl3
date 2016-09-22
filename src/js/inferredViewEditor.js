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

    fluid.defaults("floe.dashboard.inferredView.editable", {
        gradeNames: ["fluid.viewComponent"],
        selectors: {
            editable: ".floec-editable",
            currentInferredView: ".floec-currentInferredView"
        },
        events: {
            "onCurrentInferredViewReady": null
        },
        components: {
            currentInferredView: {
                type: "floe.dashboard.inferredView",
                container: "{that}.dom.currentInferredView",
                options: {
                    model: {
                        inferredViews: {
                            name: {
                                label: "What are you called?",
                                value: "William",
                                type: "select",
                                choices: ["William", "Alan"]
                            },
                            neighbourhood: {
                                label: "Which Toronto neighbourhoods have you lived in?",
                                value: ["Upper Beaches", "Annex"],
                                type: "checkbox",
                                choices: ["Upper Beaches", "Annex", "High Park Village"]
                            }
                        }
                    },
                    listeners: {
                        "onBindingsApplied.escalate": "{editable}.events.onCurrentInferredViewReady.fire"
                    },
                    modelListeners: {
                        "redoPreview": {
                            "path": "inferredViews",
                            "funcName": "floe.dashboard.inferredView.appendModelGeneratedTemplate",
                            "args": ["{that}", true],
                            excludeSource: "init"
                        }
                    }
                }
            },
            editor: {
                type: "floe.dashboard.inferredView.editor",
                container: "{that}.dom.editable",
                createOnEvent: "{editable}.events.onCurrentInferredViewReady",
                options: {
                    inferredViewKey: "name",
                    inferredViewsToEdit: "{currentInferredView}.model.inferredViews"
                }
            }
        }
    });

    fluid.defaults("floe.dashboard.inferredView.editor", {
        gradeNames: ["{that}.getEditorGrade", "floe.dashboard.inferredView"],
        // inferredViewKey: "name"
        // inferredViewsToEdit:
        invokers: {
            "getEditorGrade": {
                "funcName": "floe.dashboard.inferredView.editable.getEditorGrade",
                "args": ["{that}.options.inferredViewKey", "{that}.options.inferredViewsToEdit"]
            }
        }
    });


    floe.dashboard.inferredView.editor.getInferredViewForEditable = function (inferredViewDefinitionValue, inferredViewDefinitionKey, type, modelRelayCurrentInferredView) {

        console.log(inferredViewDefinitionKey, inferredViewDefinitionValue, type);
        // label - always free text
        if(inferredViewDefinitionKey === "label") {
            console.log("Label case");
            return {
                label: "Label",
                value: modelRelayCurrentInferredView + ".label",
                type: "text"
            };
        }

        // value - free text or select
        if(inferredViewDefinitionKey === "value") {
            console.log("Value case");
            return {
                label: "Default Value",
                value: modelRelayCurrentInferredView + ".value",
                type: "select",
                choices: modelRelayCurrentInferredView + ".choices"
            };
        }

        // type - from types
        if(inferredViewDefinitionKey === "type") {
            console.log("Type case");
            return {
                label: "Type",
                value: modelRelayCurrentInferredView + ".type",
                type: "select",
                choices: {
                    expander: {
                        funcName: "floe.dashboard.inferredView.editable.getAvailableTypes",
                        args: ["{that}.options.stringTemplates.values"]
                    }
                }
            };
        }

        // choices - if from a choice type
        if(inferredViewDefinitionKey === "choices") {
            console.log("Choices case");
            return {
                label: "Choices",
                type: "textarea"
            };
        }

    };

    floe.dashboard.inferredView.editor.getChoicesRelayForEditable = function (inferredViewKey, type, modelRelayCurrentInferredView, modelPath) {
        var relayBlock = {};

        relayBlock[inferredViewKey + "-choicesEdit"] = {
            target: modelRelayCurrentInferredView + ".choices",
            singleTransform: {
                input: "{editor}.model.inferredViews." + inferredViewKey + "-choices.value",
                type: "fluid.transforms.free",
                func: "floe.dashboard.inferredView.editable.relayChoicesChange",
                args: ["{currentInferredView}", "{editor}.model.inferredViews." + inferredViewKey + "-choices.value", modelPath]
            },
            forward: {
                excludeSource: "init"
            },
            backward: {
                excludeSource: "*"
            }
        };

        relayBlock[inferredViewKey + "-choicesInit"] = {
            target: "{editor}.model.inferredViews." + inferredViewKey + "-choices.value",
            singleTransform: {
                input: modelRelayCurrentInferredView + ".choices",
                type: "fluid.transforms.literalValue"
            },
            forward: {
                includeSource: "init"
            },
            backward: {
                excludeSource: "init"
            }
        };

        return relayBlock;
    };

    floe.dashboard.inferredView.editable.getEditorGrade = function (inferredViewKey, inferredViewsToEdit) {
        console.log(inferredViewsToEdit);

        var gradeName = "floe.dashboard.inferredView.editorGrade-" + fluid.allocateGuid();

        var newModelBlock = {};

        var newModelRelayBlock = {};

        fluid.each(inferredViewsToEdit, function (inferredViewDefinition, inferredViewKey) {
            var modelRelayCurrentInferredView = "{currentInferredView}.model.inferredViews." + inferredViewKey;
            var modelPath = "inferredViews." + inferredViewKey;
            var type = inferredViewDefinition.type;

            fluid.each(inferredViewDefinition, function (inferredViewDefinitionValue, inferredViewDefinitionKey) {
                var block = floe.dashboard.inferredView.editor.getInferredViewForEditable(inferredViewDefinitionValue, inferredViewDefinitionKey, type, modelRelayCurrentInferredView);
                newModelBlock[inferredViewKey + "-" + inferredViewDefinitionKey] = block;
            });

            if (inferredViewDefinition.choices) {
                var block = floe.dashboard.inferredView.editor.getChoicesRelayForEditable(inferredViewKey, type, modelRelayCurrentInferredView, modelPath);
                $.extend(true, newModelRelayBlock, block);
            }

            console.log(newModelRelayBlock);

        });

        var editorBlock = {
            model: {
                inferredViews: newModelBlock
            },
            modelRelay: newModelRelayBlock
        };

        fluid.defaults(gradeName, editorBlock);

        return gradeName;
    };

    floe.dashboard.inferredView.editable.getAvailableTypes = function (valueTypes) {
        var filteredTypes = fluid.remove_if(fluid.copy(valueTypes), function (valueType, valueKey) {
            return (valueKey.indexOf("-default") > -1);
        });
        return fluid.keys(filteredTypes);
    };

    floe.dashboard.inferredView.editable.relayChoicesChange = function (currentInferredView, choicesChange, modelPath) {
        console.log(currentInferredView, choicesChange);
        currentInferredView.applier.change(modelPath + ".choices", choicesChange.split(","));
    };

})(jQuery, fluid);
