/// <reference path="../../jquery/jquery-current.js" />
/// <reference path="jquery.clientRect.js" />
/// <reference path="jquery.pointerEvents.js" />
/// <reference path="jquery.proxyAll.js" />
/// <reference path="jquery.calcRestrainedPos.js" />

(function ($) {
    var tooltips = [];

    var defaults = {
        pos: 'bottom'
    };

    function Tooltip(context, options) {
        $.proxyAll(this, 'show', 'hide', 'toggle', 'pos', 'onDocumentClick');

        // add this tooltip to the array of tooltips for the page
        tooltips.push(this);

        // target context element that initalizes this tooltip
        this.context = $(context);

        // store options
        this.options = $.extend({}, defaults, options || {});

        // determine the content of the tooltip
        var content = this.options.content;
        if (content === 'text' || content === 'html') {
            this.content = $('<aside class="tooltip-content">');

            if (this.context.data('header')) {
                $('<header>').text(this.context.data('header')).appendTo(this.content);
            }

            if (this.context.data('content')) {
                $('<p>').text(this.context.data('content')).appendTo(this.content);
            }
        } else {
            content = $(content).eq(0);

            if (content.length === 0) {
                throw new Error('richTooltip: failed to find desired tooltip');
            }

            // if (content.prop('tagName') !== 'ASIDE') {
            //     content = $('<aside>').append(content).appendTo('body');
            // }

            this.content = content;
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
            this.context.on('mouseover', this.show);

            // need to add delay to this?
            this.context.on('mouseout', this.hide);
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

    Tooltip.prototype.show = function () {
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

        // hide the tooltip if the browser resizes, the user can open it back up easily
        $(window).one('resize', this.hide);
        $(window).one('scroll', this.hide);

        // hide the tooltip if user clicks outside of the tooltip
        $(document).on('click', this.onDocumentClick);

        this.visible = true;
    };

    Tooltip.prototype.hide = function () {
        this.content.hide();

        // remove event listeners
        $(window).off('resize', this.hide);
        $(window).off('scroll', this.hide);
        $(document).off('click', this.onDocumentClick);

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
        var arrowRect = this.arrow.clientRect();

        // override, css arrows do not return sized because it uses :before and :after
        if (this.options.pos === 'west' || this.options.pos === 'east') {
            arrowRect.width = 15;
            arrowRect.height = 25;
        } else {
            arrowRect.width = 25;
            arrowRect.height = 15;
        }

        var pos = this.content.calcRestrainedPos({
            direction: this.options.pos,
            context: this.context,
            container: this.container,
            reset: {
                margin: 0
            },
            offsets: {
                viewportPadding: PADDING,
                vertical: arrowRect.height,
                horizontal: arrowRect.width
            }
        });

        var contextRect = this.context.clientRect();
        var arrowPos = {};

        // position the arrow for top and bottom
        switch (this.options.pos) {
        case 'north':
        case 'south':
            arrowPos.left = contextRect.left - pos.left + (contextRect.width / 2);
            arrowPos[this.options.pos === 'north' ? 'bottom' : 'top'] = 0;
            break;

        case 'east':
        case 'west':
            arrowPos.top = contextRect.top - pos.top + (contextRect.height / 2);
            arrowPos[this.options.pos === 'east' ? 'left' : 'right'] = 0;
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
            var content = $(el).addClass('rich-tooltip-content'); // class adds legacy browser support
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
            var content = $(data.tooltip).addClass('rich-tooltip-content'); // class adds legacy browser support

            // translate data attributes to options
            context.tooltip({
                content: content,
                action: data.tooltipAction || 'click',
                pos: data.tooltipPos || 'south',
                container: data.tooltipContainer || undefined
            });
        });

        // $('[data-rel="tooltip"] + aside').addClass('tooltip');

        $('body').removeClass('nojs');
    });
})(jQuery);
