/*globals define, _, $*/
/*jshint browser: true, camelcase: false*/

define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.DecoratorBase',
    '../Core/ContractStateDecorator.Core',
    'text!./ContractStateDecorator.DiagramDesignerWidget.html',
    'css!./ContractStateDecorator.DiagramDesignerWidget.css'
], function (CONSTANTS,
            nodePropertyNames,
            DiagramDesignerWidgetDecoratorBase,
            ContractStateDecoratorCore,
            ContractStateDecoratorTemplate) {

    'use strict';

    var ContractStateDecorator,
        DECORATOR_ID = 'ContractStateDecorator';

    ContractStateDecorator = function (options) {
        var opts = _.extend({}, options);

        DiagramDesignerWidgetDecoratorBase.apply(this, [opts]);
        ContractStateDecoratorCore.apply(this, [opts]);

        this.name = '';

        this.logger.debug('ContractStateDecorator ctor');
    };

    _.extend(ContractStateDecorator.prototype, DiagramDesignerWidgetDecoratorBase.prototype);
    _.extend(ContractStateDecorator.prototype, ContractStateDecoratorCore.prototype);
    ContractStateDecorator.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ContractStateDecorator.prototype.$DOMBase = $(ContractStateDecoratorTemplate);

    ContractStateDecorator.prototype.on_addTo = function () {
            this._render();

            DiagramDesignerWidgetDecoratorBase.prototype.on_addTo.apply(this, arguments);
        };

    ContractStateDecorator.prototype.update = function () {
            this._render();
        };

    ContractStateDecorator.prototype._render = function () {
            var client = this._control._client,
                nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]),
                metaNode;

            if (nodeObj) {
                this.name = nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '';
                metaNode = client.getNode(nodeObj.getMetaTypeId());
                if (metaNode) {
                    this.metaTypeName = metaNode.getAttribute('name');
                }
            }

            this.updateSvg();
        };

    ContractStateDecorator.prototype.getConnectionAreas = function (id /*, isEnd, connectionMetaInfo*/) {
            var result = [],
                edge = 10;

            // This is where the connections will be connected too. (Right click to see the green boxes).
            // TODO: Add more areas around the circle..
            if (id === undefined || id === this.hostDesignerItem.id) {

                //EAST-CENTRE
                result.push({
                    id: '0',
                    x1: 48,
                    y1: 20,
                    x2: 48,
                    y2: 28,
                    // angle1: 0,
                    // angle2: 0
                });

                //EAST - SOUTH - 30
                result.push({
                    id: '1',
                    x1: 46,
                    y1: 31,
                    x2: 46,
                    y2: 39,
                    // angle1: 30,
                    // angle2: 30
                });

                //EAST - SOUTH - 60
                result.push({
                    id: '2',
                    x1: 37,
                    y1: 41,
                    x2: 37,
                    y2: 49,
                    // angle1: 60,
                    // angle2: 60
                });


                //WEST - CENTRE
                result.push({
                    id: '3',
                    x1: 0,
                    y1: 20,
                    x2: 0,
                    y2: 28,
                    // angle1: 180,
                    // angle2: 180
                });

                //WEST - NORTH - 210
                result.push({
                    id: '4',
                    x1: 5,
                    y1: 9,
                    x2: 5,
                    y2: 17,
                    // angle1: 210,
                    // angle2: 210
                });

                //WEST - NORTH - 240
                result.push({
                    id: '5',
                    x1: 14,
                    y1: 0,
                    x2: 14,
                    y2: 8,
                    // angle1: 240,
                    // angle2: 240
                });


                //NORTH - CENTRE
                result.push({
                    id: '6',
                    x1: 22,
                    y1: 0,
                    x2: 30,
                    y2: 0,
                    // angle1: 270,
                    // angle2: 270
                });

                //NORTH - EAST - 270
                result.push({
                    id: '7',
                    x1: 34,
                    y1: 4,
                    x2: 42,
                    y2: 4,
                    // angle1: 270,
                    // angle2: 270
                });

                //NORTH - EAST - 300
                result.push({
                    id: '8',
                    x1: 42,
                    y1: 14,
                    x2: 50,
                    y2: 14,
                    // angle1: 300,
                    // angle2: 300
                });

                //SOUTH - CENTRE
                result.push({
                    id: '9',
                    x1: 22,
                    y1: 48,
                    x2: 30,
                    y2: 48,
                    // angle1: 90,
                    // angle2: 90
                });

                //SOUTH - WEST - 120
                result.push({
                    id: '10',
                    x1: 11,
                    y1: 45,
                    x2: 19,
                    y2: 45,
                    // angle1: 90,
                    // angle2: 90
                });

                //SOUTH - WEST - 150
                result.push({
                    id: '11',
                    x1: 5,
                    y1: 36,
                    x2: 5,
                    y2: 36,
                    // angle1: 90,
                    // angle2: 90
                });

            }

            return result;
        };

    /**************** EDIT NODE TITLE ************************/

    ContractStateDecorator.prototype._onNodeTitleChanged = function (oldValue, newValue) {
            var client = this._control._client;

            client.setAttribute(this._metaInfo[CONSTANTS.GME_ID], nodePropertyNames.Attributes.name, newValue);
        };

    /**************** END OF - EDIT NODE TITLE ************************/

    ContractStateDecorator.prototype.doSearch = function (searchDesc) {
            var searchText = searchDesc.toString();
            if (this.name && this.name.toLowerCase().indexOf(searchText.toLowerCase()) !== -1) {
                return true;
            }

            return false;
        };

    return ContractStateDecorator;
});
