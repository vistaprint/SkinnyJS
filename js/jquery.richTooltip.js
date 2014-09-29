/// <reference path="jquery.clientRect.js" />
/// <reference path="jquery.proxyAll.js" />
/// <reference path="jquery.calcRestrainedPos.js" />
/// <reference path="jquery.hoverDelay.js" />

(function ($, undefined) {
    var arrowDirections = {
        south: 'north',
        north: 'south',
        east: 'west',
        west: 'east'
    };

    // commonly used array for looping over
    var directions = ['north', 'south', 'west', 'east'];

    var defaults = {
        pos: 'south',
        arrowDirection: null,
        arrowStyle: 'outset',
        closeOnWindowResize: true,
        closeOnDocumentClick: true
    };

    function Tooltip(context, options) {
        $.proxyAll(this, 'show', 'hide', 'toggle', 'pos', 'unhover', 'onWindowResize', 'onDocumentClick', 'onUiElementOpen');

        // target context element that initalizes this tooltip
        this.context = $(context).addClass('rich-tooltip-context');

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

        // configure the context
        this.context.attr('data-rel', 'tooltip');

        // setup the hover events
        if (this.options.action === 'hover') {
            // soft dependency on hoverDelay
            if ($.fn.hoverDelay) {
                // hover is desktop only, and does not support pointer events
                this.context.hoverDelay(this.show, this.unhover, { delayOver: 200, delayOut: 500, addChildren: this.content });

                // hover over the tooltip content should not hide the tooltip yet
                this.content.hoverDelay(this.show, this.unhover, { delayOver: 200, delayOut: 500, addChildren: this.context });
            } else {
                // hover is desktop only, and does not support pointer events
                this.context.hover(this.show, this.unhover);

                // hover over the tooltip content should not hide the tooltip yet
                this.content.hover(this.show, this.unhover);
            }

            // listen to pointer down and record the event to be used on click
            // calling prevent default on pointerup/pointerdown does not
            // prevent navigation, preventDefault must happen within click event
            this.context.on('press', $.proxy(function (event) {
                // toggle visibility on touches
                if (event.pointerType === 'touch') {
                    event.preventClick();
                    this.toggle(event);
                }
            }, this));
        } else {
            // when hover is off, we simply toggle on click event
            this.context.on('click', this.toggle);
        }

        // find the container element
        this.container = this.options.container ? $(this.options.container) : null;

        // look for exiting arrow
        this.arrow = this.content.find('.rich-tooltip-arrow');

        // no arrow found, create one
        if (this.arrow.length === 0) {
            this.arrow = $('<div class="rich-tooltip-arrow"><div class="hack" /></div>').appendTo(this.content);
        }

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

    //Borrowed from the JQuery UI core method zIndex. 
    //See https://github.com/jquery/jquery-ui/blob/master/ui/core.js 
    function findZIndex( elem ) {
        var pos;
        var zIndexVal;
        if ( this.length ) {
            while ( elem.length && elem[ 0 ] !== $(document) ) {
                // Ignore z-index if position is set to a value where z-index is ignored by the browser
                // This makes behavior of this function consistent across browsers
                // WebKit always returns auto if the element is positioned
                pos = elem.css( "position" );
                if ( pos === "absolute" || pos === "relative" || pos === "fixed" ) {
                    // IE returns 0 when zIndex is not specified
                    // other browsers return a string
                    // we ignore the case of nested elements with an explicit value of 0
                    // <div style="z-index: -10;"><div style="z-index: 0;"></div></div>
                    zIndexVal = parseInt( elem.css( "zIndex" ), 10 );
                    if ( !isNaN( zIndexVal ) && zIndexVal !== 0 ) {
                        return zIndexVal;
                    }
                }
                elem = elem.parent();
            }
        }
        return 0;
    }

    Tooltip.prototype.show = function () {
        this._clearHoverTimeout();

        if (this.visible) {
            return;
        }

        var zIndex = findZIndex(this.content.parent());
        // if the tooltip has a parent with z-index, set tooltip's one higher.
        // In case the tooltip being used inside a control like a modal dialog.
        if (zIndex > 0) {
            this.content.css('z-index', zIndex + 1);
        }

        // move the content to the body to avoid positioning conflicts
        if (!this.content.parent().is('body')) { 
            this.content.appendTo('body');
        }

        // tell other ui events we are opening, hopefully they all close themselves
        $(document).trigger('ui.element.open', this);

        this.content.show();
        this.pos();

        // mark the tooltip as visible
        this.visible = true;

        // indicate to the context the tooltip is open
        this.context.addClass('rich-tooltip-open').trigger('richTooltip:open');

        this.viewportSize = {
            height: $(window).height(),
            width: $(window).width()
        };

        // hide the tooltip if the browser resizes, the user can open it back up easily
        if (this.options.closeOnWindowResize) {
            $(window).on('resize', this.onWindowResize);
        }

        // hide the tooltip if user clicks outside of the tooltip
        if (this.options.closeOnDocumentClick) {
            $(document).on('click', this.onDocumentClick);
        }

        // listen for other ui elements opening, and if one opens, close this tooltip
        $(document).one('ui.element.open', this.onUiElementOpen);
    };

    Tooltip.prototype.hide = function () {
        this._clearHoverTimeout();

        if (!this.visible) {
            return;
        }

        this.content.hide();

        // mark the tooltip as not visible
        this.visible = false;

        // indicate to the context the tooltip is now closed
        this.context.removeClass('rich-tooltip-open').trigger('richTooltip:close');

        // remove event listeners
        if (this.options.closeOnWindowResize) {
            $(window).off('resize', this.onWindowResize);
        }

        if (this.options.closeOnDocumentClick) {
            $(document).off('click', this.onDocumentClick);
        }

        // stop listening for other ui elements opening, since we no longer need to care
        $(document).off('ui.element.open', this.onUiElementOpen);
    };

    Tooltip.prototype.toggle = function (event) {
        if (event) {
            event.preventDefault();

            // we need to call stop propagation or else this will trigger
            // up to the document and result in closing the tooltip.
            event.stopPropagation();
        }

        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    };

    Tooltip.prototype.onUiElementOpen = function (event, item) {
        if (item !== this) {
            this.hide();
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
    var ARROW_WIDTH = 15;

    Tooltip.prototype.pos = function () {

        // find the size of the arrow
        // .css-arrow elements do not have a size itself because it uses :before and :after
        var arrowSize = this.options.arrowStyle === 'inset' || this.arrow.css('display') == 'none' ? 0 : ARROW_WIDTH;

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
                vertical: arrowSize,
                horizontal: arrowSize
            }
        });

        var pos = restrainedPos.pos;
        var contextRect = this.context.clientRect();
        var arrowPos = {
            top: 'auto',
            right: 'auto',
            bottom: 'auto',
            left: 'auto'
        };

        if (restrainedPos.direction !== this.options.pos) {
            this.content
                .removeClass('rich-tooltip-pos-' + this.options.pos)
                .addClass('rich-tooltip-pos-' + restrainedPos.direction);
        }

        // determine the new arrow direction
        var arrowDirection = this.options.arrowDirection || arrowDirections[restrainedPos.direction];

        // position the arrow for top and bottom
        switch (restrainedPos.direction) {
        case 'north':
        case 'south':
            arrowPos.left = contextRect.left - pos.left + (contextRect.width / 2) - ARROW_WIDTH;
            arrowPos[restrainedPos.direction === 'north' ? 'bottom' : 'top'] = 0;
            break;

        case 'east':
        case 'west':
            arrowPos.top = contextRect.top - pos.top + (contextRect.height / 2) - ARROW_WIDTH;
            arrowPos[restrainedPos.direction === 'east' ? 'left' : 'right'] = 0;
            break;
        }

        // if we are changing the default behavior we have to adjust slightly
        if (this.options.arrowStyle === 'inset') {
            switch (arrowDirection) {
            case 'north':
                arrowPos.top += 1;
                break;

            case 'east':
                arrowPos.left -= 1;
                break;

            case 'south':
                arrowPos.top -= 1;
                break;

            case 'west':
                arrowPos.left += 1;
                break;
            }
        }

        this.content.css(pos);

        this.arrow
            // remove any previously added tooltip arrow direction class
            .removeClass(directions.join(' '))
            // add the tooltip arrow direction class
            .addClass(arrowDirection)
            // assign the new arrow styling
            .css(arrowPos);
    };

    $.fn.tooltip = $.fn.richTooltip = function jQueryTooltip(options) {
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

        return this;
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
        // translate data attributes to options
        function getOptionsFromData(context, content) {
            var data = context.data();

            if (!content) {
                content = $(data.tooltip);
            }

            return {
                content: content,
                action: data.tooltipAction || 'click',
                pos: data.tooltipPos || 'south',
                container: data.tooltipContainer || undefined,
                arrowDirection: data.tooltipArrowDirection || null,
                arrowStyle: data.tooltipArrowStyle || null,
                closeOnWindowResize: data.tooltipIgnoreWindowResize === undefined,
                closeOnDocumentClick: data.tooltipIgnoreDocumentClick === undefined
            };
        }

        // convert <span data-rel="tooltip" /><aside /> to tooltips
        $('[data-rel="tooltip"] + aside').each(function (i, el) {
            var content = $(el); // this is the aside
            var context = content.prev(); // element prior to aside

            context.richTooltip(getOptionsFromData(context, content));
        });

        // allow instances without the <aside> directly after the context
        $('[data-tooltip]').each(function (i, context) {
            context = $(context);
            context.richTooltip(getOptionsFromData(context));
        });
    });
})(jQuery);
