/*globals define, _, DEBUG, $*/
/*jshint browser: true*/

/**
 * @author rkereskenyi / https://github.com/rkereskenyi
 */


define([
    'js/Constants',
    'js/NodePropertyNames',
    'js/Widgets/PartBrowser/PartBrowserWidget.DecoratorBase',
    'js/Widgets/DiagramDesigner/DiagramDesignerWidget.Constants',
    'text!../DiagramDesigner/ContractStateDcoratorDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/ContractStateDcoratorDecorator.DiagramDesignerWidget.css',
    'css!./ContractStateDcoratorDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             ContractStateDcoratorDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var ContractStateDcoratorDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'ContractStateDcoratorDecoratorPartBrowserWidget';

    ContractStateDcoratorDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('ContractStateDcoratorDecoratorPartBrowserWidget ctor');
    };

    _.extend(ContractStateDcoratorDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    ContractStateDcoratorDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ContractStateDcoratorDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(ContractStateDcoratorDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the ContractStateDcoratorDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    ContractStateDcoratorDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    ContractStateDcoratorDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    ContractStateDcoratorDecoratorPartBrowserWidget.prototype._renderContent = function () {
        var client = this._control._client,
            nodeObj = client.getNode(this._metaInfo[CONSTANTS.GME_ID]);

        //render GME-ID in the DOM, for debugging
        if (DEBUG) {
            this.$el.attr({'data-id': this._metaInfo[CONSTANTS.GME_ID]});
        }

        if (nodeObj) {
            this.skinParts.$name.text(nodeObj.getAttribute(nodePropertyNames.Attributes.name) || '');
        }
    };

    ContractStateDcoratorDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return ContractStateDcoratorDecoratorPartBrowserWidget;
});