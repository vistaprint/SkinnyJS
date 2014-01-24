/// <reference path="jquery.clientRect.js" />

// calculate a position restrained within a container and the viewport
$.fn.calcRestrainedPos = function (options) {
    // the element you are calculating the position for is the content
    var content = $(this).clientRect();

    // if you provide us a context (position relative to this element)
    var context = $(options.context).clientRect();

    // if a container is provided we must keep the position restrained within
    var container = options.container ? $(options.container).clientRect() : null;

    // get the size of the viewport
    var viewport = {
        width: $(window).width(),
        height: $(window).height()
    };

    // allow offsets to be passed
    var offsets = $.extend({
        // applies a padding distance between the content and context
        padding: 0,

        // applies additional margin between the content and context
        vertical: 0,
        horizontal: 0
    }, options.offsets || {});

    // pos we return at the end, we add to this object
    var pos = options.reset || {};

    switch (options.direction) {
    // case 'w':
    //     pos.top = context.top + (context.height / 2) - (content.height / 2);
    //     pos.left = context.left - content.width - offsets.margin;
    //     break;

    // case 'e':
    //     pos.top = context.top + (context.height / 2) - (content.height / 2);
    //     pos.left = context.left + context.width + offsets.margin;
    //     break;

    case 'north':
        // we first attempt to position tooltip directly centered below the context
        pos.top = context.top - content.height - offsets.vertical;
        pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));

        // compensate for a container for the position if we must
        if (container && pos.left + content.width > container.width + container.left) {
            pos.left = container.width + container.left - content.width;
        }

        // compensate for the position staying within the viewport
        if (pos.left + content.width > viewport.width) {
            pos.left = viewport.width - content.width - offsets.padding;
        }
        break;

    case 'south':
        // we first attempt to position tooltip directly centered below the context
        pos.top = context.top + context.height + offsets.vertical;
        pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));

        // compensate for the position staying within the container
        if (container && pos.left + content.width > container.width + container.left) {
            pos.left = container.width + container.left - content.width;
        }

        // compensate for the position staying within the viewport
        if (pos.left + content.width > viewport.width) {
            pos.left = viewport.width - content.width - offsets.padding;
        }
        break;
    }

    // calculate the max width to ensure the tooltip is not outside viewport
    // assign a max-width to prevent tooltip from going outside of viewport
    pos.maxWidth = viewport.width - pos.left - offsets.padding;

    // ensure that the tooltip isn't too large for the viewport
    if (content.width >= viewport.width) {
        pos.width = 'auto';
        pos.left = '0px';
        pos.margin = '0 ' + offsets.padding + 'px';
        pos.maxWidth = '100%';
    }

    // round numbers (IE compatibility)
    // if (pos.top) pos.top = Math.round(pos.top);
    // if (pos.left) pos.left = pos.

    if (options.apply) {
        return $(this).css(pos);
    }

    return pos;
};