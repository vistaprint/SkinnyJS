/// <reference path="jquery.clientRect.js" />
/// <reference path="jquery.proxyAll.js" />
/// <reference path="jquery.calcRestrainedPos.js" />
/// <reference path="pointy.js" />

(function ($) {
    var tooltips = [];

    var defaults = {
        pos: 'south'
    };

    function Tooltip(context, options) {
        $.proxyAll(this, 'show', 'hide', 'toggle', 'pos', 'unhover', 'onWindowResize', 'onDocumentClick');

        // add this tooltip to the array of tooltips for the page
        tooltips.push(this);

        // target context element that initalizes this tooltip
        this.context = $(context);

        // store options
        this.options = $.extend({}, defaults, options || {});

        // determine the content of the tooltip
        this.content = $(this.options.content).eq(0).addClass('rich-tooltip-content'); // class adds legacy browser support

        // ensure we actually found the content
        if (this.content.length === 0) {
            throw new Error('jquery.richTooltip: failed to find desired tooltip');
        }

        // add functional classes
        this.content.addClass('rich-tooltip-pos-' + this.options.pos);

        // move the content to the body to avoid positioning conflicts
        this.content.appendTo('body');

        // configure the context
        this.context.attr('data-rel', 'tooltip');

        // setup the events
        if (this.options.action === 'hover') {
            // hover is desktop only, and does not support pointer events
            this.context.hover(this.show, this.unhover);

            // hover over the tooltip content should not hide the tooltip yet
            this.content.hover(this.show, this.unhover);
        }

        // always show on click, even with hover enabled
        this.context.on('click', this.toggle);

        // find the container element
        this.container = this.options.container ? $(this.options.container) : null;

        // look for exiting arrow
        this.arrow = this.content.find('.rich-tooltip-arrow');

        // no arrow found, create one
        if (this.arrow.length === 0) {
            this.arrow = $('<div class="rich-tooltip-arrow" />').appendTo(this.content);
        }

        // insert close button
        $('<span class="rich-tooltip-close" data-rel="close" />').appendTo(this.content);

        // anything with [data-rel="close"] can be used to close the tooltip
        this.content.on('click', '[data-rel="close"]', this.hide);
    }

    Tooltip.prototype.unhover = function () {
        this._clearHoverTimeout();
        this.hoverTimeout = setTimeout(this.hide, 250);
    };

    Tooltip.prototype._clearHoverTimeout = function () {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
    };

    Tooltip.prototype.show = function () {
        this._clearHoverTimeout();

        // ensure all other tooltips are closed
        if (tooltips.forEach) {
            tooltips.forEach(function (tooltip) {
                if (tooltip !== this) {
                    tooltip.hide();
                }
            }, this);
        }

        this.content.show();
        this.pos();

        this.viewportSize = {
            height: $(window).height(),
            width: $(window).width()
        };

        // hide the tooltip if the browser resizes, the user can open it back up easily
        $(window).on('resize', this.onWindowResize);
        $(window).one('scroll', this.hide);

        // hide the tooltip if user clicks outside of the tooltip
        $(document).on('click', this.onDocumentClick);
        $(document).one('closeEverything', this.hide);

        this.visible = true;
    };

    Tooltip.prototype.hide = function () {
        this._clearHoverTimeout();
        this.content.hide();

        // remove event listeners
        $(window).off('resize', this.onWindowResize);
        $(window).off('scroll', this.hide);
        $(document).off('click', this.onDocumentClick);
        $(document).off('closeEverything', this.hide);

        this.visible = false;
    };

    Tooltip.prototype.toggle = function (event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    };

    // on window resize, confirm the window actually changed sizes
    // IE9 and below triggers a resize on any element changing size,
    // this includes elements becoming visible or hidding
    // @see http://stackoverflow.com/questions/1852751/window-resize-event-firing-in-internet-explorer
    Tooltip.prototype.onWindowResize = function () {
        if ($(window).height() != this.viewportSize.height || $(window).width() != this.viewportSize.width) {
            this.hide();
        }
    };

    // on a document click event, we close the tooltip is the click
    // was not to the tooltip or a child of the tooltip
    Tooltip.prototype.onDocumentClick = function (e) {
        var target = $(e.target);
        if (!target.is(this.content) && !target.isChildOf(this.content)) {
            this.hide();
        }
    };

    // padding constant used during position calculations
    var PADDING = 10;

    Tooltip.prototype.pos = function () {

        // calculate constants used repeatedly
        var arrowRect = {}; // this.arrow.clientRect();

        // override, css arrows do not return sized because it uses :before and :after
        if (this.options.pos === 'west' || this.options.pos === 'east') {
            arrowRect.width = 15;
            arrowRect.height = 25;
        } else {
            arrowRect.width = 25;
            arrowRect.height = 15;
        }

        var restrainedPos = $.calcRestrainedPos({
            giveMeSomething: true,
            direction: this.options.pos,
            content: this.content.css('max-width', '100%'),
            context: this.context,
            container: this.container,
            reset: {
                margin: 0
            },
            offsets: {
                viewport: PADDING,
                vertical: arrowRect.height,
                horizontal: arrowRect.width
            }
        });

        var pos = restrainedPos.pos;
        var contextRect = this.context.clientRect();
        var arrowPos = {};

        if (restrainedPos.direction !== this.options.pos) {
            this.content
                .removeClass('rich-tooltip-pos-' + this.options.pos)
                .addClass('rich-tooltip-pos-' + restrainedPos.direction);
        }

        // position the arrow for top and bottom
        switch (restrainedPos.direction) {
        case 'north':
        case 'south':
            arrowPos.left = contextRect.left - pos.left + (contextRect.width / 2);
            arrowPos[restrainedPos.direction === 'north' ? 'bottom' : 'top'] = 0;
            break;

        case 'east':
        case 'west':
            arrowPos.top = contextRect.top - pos.top + (contextRect.height / 2);
            arrowPos[restrainedPos.direction === 'east' ? 'left' : 'right'] = 0;
            break;
        }

        this.content.css(pos);
        this.arrow.css(arrowPos);
    };

    $.fn.tooltip = function jQueryTooltip(options) {
        var el = $(this);
        var tooltip = el.data('__tooltip');

        if (!tooltip) {
            tooltip = new Tooltip(el, options);
            el.data('__tooltip', tooltip);
        }

        // allow this to be used to run methods on the tooltips
        if (typeof options === 'string' && options in tooltip) {
            tooltip[options]();
        }
    };

    $.fn.isChildOf = function jQueryIsChildOf(filter_string) {
        var parents = $(this).parents();

        for (var j = 0; j < parents.length; j++) {
            if ($(parents[j]).is(filter_string)) {
                return true;
            }
        }

        return false;
    };

    // initialize all existing tooltips
    $(function () {
        $('[data-rel="tooltip"] + aside').each(function (i, el) {
            var context = $(el).prev().addClass('rich-tooltip-context');
            var content = $(el);
            var data = context.data();

            // translate data attributes to options
            context.tooltip({
                content: content,
                action: data.tooltipAction || 'click',
                pos: data.tooltipPos || 'south',
                container: data.tooltipContainer || undefined
            });
        });

        // allow instances without the <aside> directly after the context
        $('[data-tooltip]').each(function (i, el) {
            var context = $(el);
            var data = context.data();
            var content = $(data.tooltip);

            // translate data attributes to options
            context.tooltip({
                content: content,
                action: data.tooltipAction || 'click',
                pos: data.tooltipPos || 'south',
                container: data.tooltipContainer || undefined
            });
        });
    });
})(jQuery);