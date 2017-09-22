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
    'text!../DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.html',
    'css!../DiagramDesigner/ContractStateDecorator.DiagramDesignerWidget.css',
    'css!./ContractStateDecorator.PartBrowserWidget.css'
], function (CONSTANTS,
             nodePropertyNames,
             PartBrowserWidgetDecoratorBase,
             DiagramDesignerWidgetConstants,
             ContractStateDecoratorDiagramDesignerWidgetTemplate) {

    'use strict';

    var ContractStateDecoratorPartBrowserWidget,
        __parent__ = PartBrowserWidgetDecoratorBase,
        DECORATOR_ID = 'ContractStateDecoratorPartBrowserWidget';

    ContractStateDecoratorPartBrowserWidget = function (options) {
        var opts = _.extend({}, options);

        __parent__.apply(this, [opts]);

        this.logger.debug('ContractStateDecoratorPartBrowserWidget ctor');
    };

    _.extend(ContractStateDecoratorPartBrowserWidget.prototype, __parent__.prototype);
    ContractStateDecoratorPartBrowserWidget.prototype.DECORATORID = DECORATOR_ID;

    /*********************** OVERRIDE DiagramDesignerWidgetDecoratorBase MEMBERS **************************/

    ContractStateDecoratorPartBrowserWidget.prototype.$DOMBase = (function () {
        var el = $(ContractStateDecoratorDiagramDesignerWidgetTemplate);
        //use the same HTML template as the ContractStateDecorator.DiagramDesignerWidget
        //but remove the connector DOM elements since they are not needed in the PartBrowser
        el.find('.' + DiagramDesignerWidgetConstants.CONNECTOR_CLASS).remove();
        return el;
    })();

    ContractStateDecoratorPartBrowserWidget.prototype.beforeAppend = function () {
        this.$el = this.$DOMBase.clone();

        //find name placeholder
        this.skinParts.$name = this.$el.find('.name');

        this._renderContent();
    };

    ContractStateDecoratorPartBrowserWidget.prototype.afterAppend = function () {
    };

    ContractStateDecoratorPartBrowserWidget.prototype._renderContent = function () {
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

    ContractStateDecoratorPartBrowserWidget.prototype.update = function () {
        this._renderContent();
    };

    return ContractStateDecoratorPartBrowserWidget;
});