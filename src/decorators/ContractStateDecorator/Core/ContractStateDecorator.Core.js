/*globals define, $*/
/*jshint browser: true*/


define([
    'text!./svgs/state.svg',
    'text!./svgs/state-highlight.svg'
], function (STATE_SVG,
    HIGHLIGHT_SVG) {

    'use strict';
    var META_TO_TEMPLATE = {
        State: STATE_SVG,
        InitialState: STATE_SVG,
        FinalState: STATE_SVG
    };

    function ContractStateDecoratorCore() {
        this.skinParts.$svg = null;
        this.skinParts.$svgContainer = null;
        this.prevMetaTypeName = null;
        this.metaTypeName = null;
        this.highlightColors = [];
        this.colorToPathEl = {};
    }

    function getCoordinatesForPercent(percent) {
        return {
            x: Math.cos(2 * Math.PI * percent),
            y: Math.sin(2 * Math.PI * percent)
        };
    }

    ContractStateDecoratorCore.prototype.updateSvg = function () {
        var self = this,
            template = META_TO_TEMPLATE[this.metaTypeName] || STATE_SVG,
            cumulativePercent = 0,
            slicePercent;

        if (this.skinParts.$svgHighlight) {
            this.skinParts.$svgHighlight.remove();
            delete this.skinParts.$svgHighlight;
        }

        if (this.highlightColors.length > 0) {
            this.colorToPathEl = {};
            this.skinParts.$svgContainer = this.$el.find('.svg-container');
            this.skinParts.$svgContainer.empty();

            this.skinParts.$svg = $(template);
            this.skinParts.$name = this.skinParts.$svg.find('.name');

            this.skinParts.$svg.find('g').css('fill-opacity', 0); // Make default circle transparent
            this.skinParts.$svgHighlight = $(HIGHLIGHT_SVG);
            slicePercent = 1 / this.highlightColors.length;

            this.highlightColors.forEach(function (color) {
                var start = getCoordinatesForPercent(cumulativePercent),
                    largeArcFlag = slicePercent > 0.5 ? 1 : 0,
                    pathEl,
                    pathData,
                    end;
                //https://hackernoon.com/a-simple-pie-chart-in-svg-dbdd653b6936
                // each slice starts where the last slice ended, so keep a cumulative percent
                cumulativePercent += slicePercent;
                //console.log('cumPer', cumulativePercent);
                end = getCoordinatesForPercent(cumulativePercent);

                // create an array and join it just for code readability
                pathData = [
                    'M', start.x, start.y, // Move
                    'A 1 1 0', largeArcFlag, '1', end.x, end.y, // Arc
                    'L 0 0', // Line
                ].join(' ');

                // create a <path> and append it to the <svg> element
                pathEl = $(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
                pathEl.attr('d', pathData);
                pathEl.attr('fill', color);
                pathEl.attr('opacity', 0);
                self.colorToPathEl[color] = pathEl;
                // Append a white clone to ensure the decorator isn't transparent when transitioning.
                self.skinParts.$svgHighlight.append(pathEl.clone().attr('fill', 'white').attr('opacity', 1));

                self.skinParts.$svgHighlight.append(pathEl);
            });

            self.skinParts.$svgContainer.append(self.skinParts.$svgHighlight);
        } else if (this.prevMetaTypeName !== this.metaTypeName) {
            this.skinParts.$svgContainer = this.$el.find('.svg-container');
            this.skinParts.$svgContainer.empty();

            this.skinParts.$svg = $(template);
            this.skinParts.$name = this.skinParts.$svg.find('.name');
        } else {
            this.skinParts.$svg.find('g').css('fill-opacity', 1); // Make default circle is white again.
        }

        this.skinParts.$svgContainer.append(this.skinParts.$svg);

        if (this.name) {
            if (this.name.length < 8) {
                this.skinParts.$name.text(this.name);
            } else {
                this.skinParts.$name.text(this.name.substring(0, 5).concat('...'));
            }

            if (this.name.length > 7 || this.highlightColors.length > 1) {
                this.skinParts.$svgContainer.popover({
                    delay: {
                        show: 150,
                        hide: 0
                    },
                    animation: false,
                    trigger: 'hover',
                    content: this.name
                });
            }
        }

        // Store the current one as previous for next iteration.
        this.prevMetaTypeName = this.metaTypeName;

        // If state is InitialState then, the border color is red
        if (this.metaTypeName === 'InitialState') {
            this.skinParts.$svg.find('circle').css('stroke', 'red');
        }
        else if (this.metaTypeName === 'FinalState') {
            this.skinParts.$svg.find('circle').css('stroke', 'blue');
        }
    };


    ContractStateDecoratorCore.prototype.setHighlightColors = function (colors) {
        this.highlightColors = colors;
        this.updateSvg();
    };

    return ContractStateDecoratorCore;
});
