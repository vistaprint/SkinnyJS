/// <reference path="jquery.clientRect.js" />

(function ($) {

    var defaults = {
        apply: false,
        container: null,
        direction: 'north',
        offsets: {},
        viewport: true
    };

    var nextDirection = {
        'north': 'east',
        'east': 'south',
        'south': 'west',
        'west': 'north'
    };

    // calculate a position restrained within a container and the viewport
    $.fn.calcRestrainedPos = function (options) {
        // merge options
        options = $.extend({}, defaults, options);

        // the element you are calculating the position for is the content
        var content = $(this).clientRect();

        // if you provide us a context (position relative to this element)
        var context = $(options.context).clientRect();

        // if a container is provided we must keep the position restrained within
        var container = options.container ? $(options.container).clientRect() : null;

        // get the size of the viewport
        var viewport = {
            width: window.innerWidth || $(window).width(),
            height: window.innerHeight || $(window).height()
        };

        // allow offsets to be passed
        var offsets = $.extend({
            padding: 0,

            // applies spacing to keep content X pixels away from bounds of viewport
            viewport: 0,

            // applies spacing to keep content X pixels away from bounds of container
            container: 0,

            // applies spacing to keep content X pixels away from bounds of context
            vertical: 0,
            horizontal: 0
        }, options.offsets || {});

        // pos we return at the end, we add to this object
        var pos = options.reset || {};

        function attemptDirection(direction) {
            switch (direction) {
            case 'north':
                // first attempt to position content directly centered above the context
                pos.top = context.top - content.height - offsets.vertical;
                pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));
                break;

            case 'east':
                // first attempt to position content directly centered right of the context
                pos.top = context.top + (context.height / 2) - (content.height / 2);
                pos.left = context.left + context.width + offsets.horizontal;
                break;

            case 'south':
                // first attempt to position content directly centered below the context
                pos.top = context.top + context.height + offsets.vertical;
                pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));
                break;

            case 'west':
                // first attempt to position content directly centered right of context
                pos.top = context.top + (context.height / 2) - (content.height / 2);
                pos.left = context.left - content.width - offsets.horizontal;
                break;
            }
        }

        // compensate for a container, if we must
        function compensateContainer() {
            if (container !== null) {
                // compensate for container, appearing outside to north of container
                if (pos.top < container.top) {
                    pos.top = container.top + offsets.container;
                }
                // compensate for container, appearing outside to south of container
                else if (pos.top + content.height > container.top + container.height) {
                    pos.top = container.top + container.height - content.height - offsets.container;
                }

                // compensate for container, appearing outside to east of container
                if (pos.left + content.width > container.left + container.width) {
                    pos.left = container.left + container.width - content.width - offsets.container;
                }
                // compensate for container, appearing outside to west of container
                else if (pos.left < container.left) {
                    pos.left = container.left + offsets.container;
                }
            }
        }

        // compensate for the viewport, if we haven't opted out
        function compensateViewport() {
            if (options.viewport === true) {
                // north check
                if (pos.top < offsets.viewport) {
                    pos.top = offsets.viewport;
                }
                // south check
                else if (pos.top + content.height > viewport.height) {
                    pos.top = viewport.height - content.height - offsets.viewport;
                }

                // east check
                if (pos.left + content.width > viewport.width) {
                    pos.left = viewport.width - content.width - offsets.padding;
                }
                // west check
                else if (pos.left < offsets.viewport) {
                    pos.left = offsets.viewport;
                }
            }
        }

        // attempt the direction requested first
        var direction = options.direction;
        while (true) {
            attemptDirection(direction);
            compensateContainer();
            compensateViewport();

            var box = $.extend({}, content, pos);

            // verify position is not over the context
            if ($.doBoundingBoxesIntersect(box, context)) {
                // check to see if we are about to start over
                if (nextDirection[direction] === options.direction) {
                    break;
                }

                // try again
                direction = nextDirection[direction];
                continue;
            }

            // this direction checks out
            break;
        }

        // calculate the max width to ensure the content is not outside viewport
        pos.maxWidth = viewport.width - pos.left - offsets.viewport;

        // ensure that the content isn't too large for the viewport
        if (content.width >= viewport.width) {
            pos.width = 'auto';
            pos.left = '0px';
            pos.margin = '0 ' + offsets.padding + 'px';
            pos.maxWidth = '100%';
        }

        if (options.apply) {
            return $(this).css(pos);
        }

        return {
            direction: direction,
            pos: pos
        };
    };

    $.doBoundingBoxesIntersect = function doBoundingBoxesIntersect(a, b) {
        return (a.left < b.left + b.width  && a.left + a.width  > b.left && a.top < b.top + b.height && a.top + a.height > b.top);
    };

})(jQuery);