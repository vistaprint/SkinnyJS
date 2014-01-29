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

        // if the element has different sizes for different positions, then specify them as a <direction,size> hash
        var contentSizes = options.contentSizes;

        // the element you are calculating the position for is the content
        var content = options.bounds ? options.bounds : $(this).clientRect();

        // if you provide us a context (position relative to this element)
        var context = $(options.context).clientRect();

        // if a container is provided we must keep the position restrained within
        var container = options.container ? $(options.container).clientRect() : null;

        // areas of the screen that are off-limits to the content
        var obstacles = options.exclusions;

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

        function getContentSize(direction) {
            var bounds;
            if (contentSizes) {
                bounds = contentSizes[direction];
            }
            if (!bounds) {
                bounds = content;
            }
            return bounds;
        }

        function attemptDirection(direction) {
            content = getContentSize(direction);
            switch (direction) {
            case 'north':
                // first attempt to position content directly centered above the context
                pos.top = context.top - content.height - offsets.vertical;
                pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));
                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                if (options.cornerAdjacent && !isCornerAdjacent(direction, pos)) {
                    pos.left = context.left + offsets.padding;
                }
                break;

            case 'east':
                // first attempt to position content directly centered right of the context
                pos.top = context.top + (context.height / 2) - (content.height / 2);
                pos.left = context.left + context.width + offsets.horizontal;
                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                if (options.cornerAdjacent && !isCornerAdjacent(direction, pos)) {
                    pos.top = context.top + offsets.padding;
                }
                break;

            case 'south':
                // first attempt to position content directly centered below the context
                pos.top = context.top + context.height + offsets.vertical;
                pos.left = Math.max(offsets.padding, context.left + (context.width / 2) - (content.width / 2));
                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                if (options.cornerAdjacent && !isCornerAdjacent(direction, pos)) {
                    pos.left = context.left + offsets.padding;
                }
                break;

            case 'west':
                // first attempt to position content directly centered right of context
                pos.top = context.top + (context.height / 2) - (content.height / 2);
                pos.left = context.left - content.width - offsets.horizontal;
                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                if (options.cornerAdjacent && !isCornerAdjacent(direction, pos)) {
                    pos.top = context.top + offsets.padding;
                }
                break;
            }
        }

        // compensate for a container, if we must
        function compensateContainer(direction, posLimits) {
            if (container !== null) {
                // compensate for container, appearing outside to north of container
                if (pos.top < container.top) {
                    pos.top = container.top + offsets.container;
                    if (options.cornerAdjacent && ((direction === 'east') || (direction === 'west')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.top = context.top + offsets.padding;
                        posLimits.minY = pos.top;
                    }
                }
                // compensate for container, appearing outside to south of container
                else if (pos.top + content.height > container.top + container.height) {
                    pos.top = container.top + container.height - content.height - offsets.container;
                    if (options.cornerAdjacent && ((direction === 'east') || (direction === 'west')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.top = (context.top + context.height - offsets.padding) - content.height;
                        posLimits.maxY = pos.top;
                    }
                }

                // compensate for container, appearing outside to east of container
                if (pos.left + content.width > container.left + container.width) {
                    pos.left = container.left + container.width - content.width - offsets.container;
                    if (options.cornerAdjacent && ((direction === 'north') || (direction === 'south')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.left = (context.left + context.width - offsets.padding) - content.width;
                        posLimits.maxX = pos.left;
                    }
                }
                // compensate for container, appearing outside to west of container
                else if (pos.left < container.left) {
                    pos.left = container.left + offsets.container;
                    if (options.cornerAdjacent && ((direction === 'north') || (direction === 'south')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.left = context.left + offsets.padding;
                        posLimits.minX = pos.left;
                    }
                }
            }
        }

        // compensate for the viewport, if we haven't opted out
        function compensateViewport(direction, posLimits) {
            if (options.viewport === true) {
                // north check
                if (pos.top < offsets.viewport) {
                    pos.top = offsets.viewport;
                    if (options.cornerAdjacent && ((direction === 'east') || (direction === 'west')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.top = context.top + offsets.padding;
                        posLimits.minY = pos.top;
                    }
                }
                // south check
                else if (pos.top + content.height > viewport.height) {
                    pos.top = viewport.height - content.height - offsets.viewport;
                    if (options.cornerAdjacent && ((direction === 'east') || (direction === 'west')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.top = (context.top + context.height - offsets.padding) - content.height;
                        posLimits.maxY = pos.top;
                    }
                }

                // east check
                if (pos.left + content.width > viewport.width) {
                    pos.left = viewport.width - content.width - offsets.viewport;
                    if (options.cornerAdjacent && ((direction === 'north') || (direction === 'south')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.left = (context.left + context.width - offsets.padding) - content.width;
                        posLimits.maxX = pos.left;
                    }
                }
                // west check
                else if (pos.left < offsets.viewport) {
                    pos.left = offsets.viewport;
                    if (options.cornerAdjacent && ((direction === 'north') || (direction === 'south')) && !isCornerAdjacent(direction, pos)) {
                        //Need to keep the corners adjancent, so adjust the position and update the posLimits.
                        pos.left = context.left + offsets.padding;
                        posLimits.minX = pos.left;
                    }
                }
            }
        }

        // compensate for exclusions
        function compensateObstacles(direction, posLimits) {
            if (obstacles) {
                var box = $.extend({}, content, pos);
                var rect;
                var intersections = []; //track intersections encountered to prevent an infinite loop where bounce between two positions
                for (var i = 0; i < obstacles.length; i++) {
                    rect = obstacles[i];
                    if ($.doBoundingBoxesIntersect(box, rect)) {
                        //Intersection found.
                        //  Depending on the position of the content relative to the context (i.e. 'direction'),
                        //  shift the box so that it doesn't intersect and then restart the loop.
                        //  The loop should end when all obstacles have been checked or it has been determined
                        //  that no placement is possible without intersecting an obstacle.

                        if (intersections[i]) {
                            //We've seen this intersection before - just give up.
                            box.left = posLimits.maxX + 1;
                            box.top = posLimits.maxY + 1;
                            break;
                        }
                        intersections[i] = true;

                        var newPos = {
                            top: box.top,
                            left: box.left
                        };
                        switch (direction) {
                        case 'north':
                        case 'south':
                            /*
                             *       Example cases:
                             *              ------------
                             *          ____|____ rect |
                             *         |__box____|------
                             *        --------------------
                             *        |     context      |
                             *
                             *              ------------
                             *          ____|_____rect_|__
                             *         |__box_____________|
                             *        --------------------
                             *        |     context      |
                             *
                             *       Solution:
                             *              ------------
                             *    _________ |     rect |
                             *   |__box____|------------
                             *        --------------------
                             *        |     context      |
                             *
                             *             OR
                             *              ------------
                             *              |     rect | _________
                             *              ------------|__box____|
                             *        --------------------
                             *        |     context      |
                             */
                            if ((box.left < rect.left) && (box.left + box.width > rect.left)) {
                                //shift box left if possible
                                newPos.left = rect.left - (box.width + offsets.horizontal);
                                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                if (options.cornerAdjacent && (newPos.left < context.left + offsets.padding) && (newPos.left + content.width > context.left + context.width - offsets.padding)) {
                                    newPos.left = (context.left + context.width) - (content.width + offsets.padding);
                                }
                                if (newPos.left < posLimits.minX) {
                                    //cannot shift box that far - try other side:
                                    newPos.left = (rect.left + rect.width) + offsets.horizontal;
                                    // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                    if (options.cornerAdjacent && (newPos.left < context.left + offsets.padding) && (newPos.left + content.width > context.left + context.width - offsets.padding)) {
                                        newPos.left = context.left + offsets.padding;
                                    }
                                    if (newPos.left > posLimits.maxX) {
                                        //cannot place box in this direction without intersection
                                        //stop checking obstacles
                                        i = obstacles.length;
                                    } else {
                                        //update position limits
                                        posLimits.minX = newPos.left;
                                    }
                                } else {
                                    //update position limits
                                    posLimits.maxX = newPos.left;
                                }
                            }
                            /*
                             *       Example cases:
                             *     ------------
                             *     |   rect __|______
                             *     --------|__box____|
                             *        --------------------
                             *        |     context      |
                             *
                             *     --------------------
                             *     |   rect ________  |
                             *     --------|__box___|--
                             *        --------------------
                             *        |     context      |
                             *
                             *       Solution:
                             *     ------------
                             *     |     rect | _________
                             *     ------------|__box____|
                             *        --------------------
                             *        |     context      |
                             *
                             *              OR
                             *              ------------
                             *    _________ |     rect |
                             *   |__box____|------------
                             *        --------------------
                             *        |     context      |
                             */
                            else /*if ((box.left < rect.left + rect.width) && (box.left + box.width > rect.left + rect.width))*/ {
                                //shift box right if possible
                                newPos.left = (rect.left + rect.width) + offsets.horizontal;
                                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                if (options.cornerAdjacent && (newPos.left < context.left + offsets.padding) && (newPos.left + content.width > context.left + context.width - offsets.padding)) {
                                    newPos.left = context.left + offsets.padding;
                                }
                                if (newPos.left > posLimits.maxX) {
                                    //cannot shift box that far - try other side:
                                    newPos.left = rect.left - (box.width + offsets.horizontal);
                                    // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                    if (options.cornerAdjacent && (newPos.left < context.left + offsets.padding) && (newPos.left + content.width > context.left + context.width - offsets.padding)) {
                                        newPos.left = (context.left + context.width) - (content.width + offsets.padding);
                                    }
                                    if (newPos.left < posLimits.minX) {
                                        //cannot place box in this direction without intersection
                                        //stop checking obstacles
                                        i = obstacles.length;
                                    } else {
                                        //update position limits
                                        posLimits.maxX = newPos.left;
                                    }
                                } else {
                                    //update position limits
                                    posLimits.minX = newPos.left;
                                }
                            }
                            box.left = newPos.left;
                            box.right = box.left + box.width;
                            break;

                        case 'west':
                        case 'east':
                            /*
                             *       Example cases:
                             *         _________   ___
                             *   -----|__box____| |
                             *   | rect     |     |
                             *   ------------     | context
                             *                    |
                             *                    |___
                             *
                             *          ________   ___
                             *   ------| box    | |
                             *   | rect|        | |
                             *   ------|        | | context
                             *         |________| |
                             *                    |___
                             *
                             *       Solution:
                             *                     ___
                             *         _________  |
                             *        |__box____| |
                             *   ------------     | context
                             *   | rect     |     |
                             *   ------------     |___
                             *          OR
                             *                     ___
                             *   ------------     |
                             *   | rect     |     |
                             *   ------------     | context
                             *         _________  |
                             *        |__box____| |
                             *                    |___
                             *
                             */
                            if ((box.top < rect.top) && (box.top + box.height >= rect.top)) {
                                //shift box up if possible
                                newPos.top = rect.top - (box.height + offsets.vertical);
                                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                if (options.cornerAdjacent && (newPos.top < context.top + offsets.padding) && (newPos.top + content.height > context.top + context.height - offsets.padding)) {
                                    newPos.top = (context.top + context.height) - (content.height + offsets.padding);
                                }
                                if (newPos.top < posLimits.minY) {
                                    //cannot shift box that far - try other side:
                                    newPos.top = (rect.top + rect.height) + offsets.vertical;
                                    // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                    if (options.cornerAdjacent && (newPos.top < context.top + offsets.padding) && (newPos.top + content.height > context.top + context.height - offsets.padding)) {
                                        newPos.top = context.top + offsets.padding;
                                    }
                                    if (newPos.top > posLimits.maxY) {
                                        //cannot place box in this direction without intersection
                                        //stop checking obstacles
                                        i = obstacles.length;
                                    } else {
                                        //update position limits
                                        posLimits.minY = newPos.top;
                                    }
                                } else {
                                    //update position limits
                                    posLimits.maxY = newPos.top;
                                }
                            }
                            /*
                             *       Example cases:
                             *                     ___
                             *   ------------     |
                             *   | rect_____|___  |
                             *   -----|__box____| | context
                             *                    |
                             *                    |___
                             *
                             *                     ___
                             *   ------------     |
                             *   | rect_____|___  |
                             *   |    |__box____| | context
                             *   |          |     |
                             *   ------------     |___
                             *
                             *
                             *       Solution:
                             *                     ___
                             *   ------------     |
                             *   | rect     |     |
                             *   ------------     | context
                             *         _________  |
                             *        |__box____| |
                             *                    |___
                             *
                             *          OR
                             *                     ___
                             *         _________  |
                             *        |__box____| |
                             *   ------------     | context
                             *   | rect     |     |
                             *   ------------     |___
                             */
                            else /*if ((box.top > rect.top) && (box.top + box.height > rect.top))*/ {
                                //shift box down if possible
                                newPos.top = (rect.top + rect.height) + offsets.vertical;
                                // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                if (options.cornerAdjacent && (newPos.top < context.top + offsets.padding) && (newPos.top + content.height > context.top + context.height - offsets.padding)) {
                                    newPos.top = context.top + offsets.padding;
                                }
                                if (newPos.top > posLimits.maxY) {
                                    //cannot shift box that far - try other side:
                                    newPos.top = rect.top - (box.height + offsets.vertical);
                                    // If content corner is required to be adjacent to the context edge, then we adjust if necessary.
                                    if (options.cornerAdjacent && (newPos.top < context.top + offsets.padding) && (newPos.top + content.height > context.top + context.height - offsets.padding)) {
                                        newPos.top = (context.top + context.height) - (content.height + offsets.padding);
                                    }
                                    if (newPos.top < posLimits.minY) {
                                        //cannot place box in this direction without intersection
                                        //stop checking obstacles
                                        i = obstacles.length;
                                    } else {
                                        //update position limits
                                        posLimits.maxY = newPos.top;
                                    }
                                } else {
                                    //update position limits
                                    posLimits.minY = newPos.top;
                                }
                            }
                            box.top = newPos.top;
                            box.bottom = box.top + box.height;
                            break;
                        } //end switch (direction)
                        if ((i > 0) && (i < obstacles.length)) {
                            i = -1; //restart loop
                        }
                    } //end if intersection found
                } //end for loop
                pos.left = box.left;
                pos.top = box.top;
            } //end if obstacles
        }

        function calculateMaxPositions(direction, limits) {
            switch (direction) {
            case 'north':
            case 'south':
                //minX is full content width to the west of the container
                limits.minX = Math.max(limits.minX, (context.left - content.width) + offsets.padding);
                //maxX is full content width to the east of the container
                limits.maxX = Math.min((context.left + context.width) - offsets.padding, limits.maxX - content.width);
                //minY and maxY are equal since the content shouldn't be moved vertically
                limits.minY = limits.maxY = pos.top;
                break;

            case 'east':
            case 'west':
                //minY is as north as the content can get
                limits.minY = Math.max(limits.minY, (context.top - content.height) + offsets.padding);
                //maxX is as south as the content can get
                limits.maxY = Math.min((context.top + context.height) - offsets.padding, limits.maxY - content.height);
                //minX and maxX shouldn't change
                limits.minX = limits.maxX = pos.left;
                break;
            }
            return limits;
        }

        function isCornerAdjacent(direction, position) {
            var adjacent = true;
            switch (direction) {
            case 'north':
            case 'south':
                adjacent = ((position.left >= context.left + offsets.padding) && (position.left <= context.left + context.width - offsets.padding)) ||
                    ((position.left + content.width <= context.left + context.width - offsets.padding) && (position.left + content.width >= context.left + offsets.padding));
                break;

            case 'east':
            case 'west':
                adjacent = ((position.top >= context.top + offsets.padding) && (position.top <= context.top + context.bottom - offsets.padding)) ||
                    ((position.top + content.height <= context.top + context.height - offsets.padding) && (position.top + content.height <= context.top + context.height - offsets.padding));
                break;
            }
            return adjacent;
        }

        // attempt the direction requested first
        var direction = options.direction;
        //Default to "north" if the direction is invalid.
        if (!(direction in nextDirection)) {
            direction = 'north';
        }
        var originalDirection = direction;
        // limits of content in each direction
        var origMinX, origMinY, origMaxX, origMaxY;
        origMinX = origMinY = 0;
        origMaxX = viewport.width;
        origMaxY = viewport.height;

        if (container !== null) {
            origMinX = container.left + offsets.container;
            origMinY = container.top + offsets.container;
            origMaxX = container.left + container.width - offsets.container;
            origMaxY = container.top + container.height - offsets.container;
        }
        if (options.viewport === true) {
            origMinX = Math.max(offsets.viewport, origMinX);
            origMinY = Math.max(offsets.viewport, origMinY);
            origMaxX = Math.min(viewport.width - offsets.viewport, origMaxX);
            origMaxY = Math.min(viewport.height - offsets.viewport, origMaxY);
        }
        var maxBounds;
        while (true) {
            attemptDirection(direction);
            maxBounds = calculateMaxPositions(direction, {
                minX: origMinX,
                minY: origMinY,
                maxX: origMaxX,
                maxY: origMaxY
            });
            compensateContainer(direction, maxBounds);
            compensateViewport(direction, maxBounds);
            compensateObstacles(direction, maxBounds);

            var box = $.extend({}, content, pos);

            // verify position is not over the context and within expected limits
            if ((box.left < maxBounds.minX) || (box.left > maxBounds.maxX) ||
                (box.top < maxBounds.minY) || (box.top > maxBounds.maxY) ||
                (options.cornerAdjacent && !isCornerAdjacent(direction, pos)) ||
                $.doBoundingBoxesIntersect(box, context)) {
                // check to see if we are about to start over
                if (nextDirection[direction] === originalDirection) {
                    //Return null to signify that we could not position this content.
                    return null;
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
        return (a.left < b.left + b.width && a.left + a.width > b.left && a.top < b.top + b.height && a.top + a.height > b.top);
    };

})(jQuery);