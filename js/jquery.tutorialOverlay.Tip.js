/**
 * @fileOverview Tip for Tutorial Overlay.
 * @author Tex Clayton
 * @version 1.1
 */
(function ($) {
    //Constants
    var DATA_TIP_TARGET_ATTR = "overlay-tip-target";
    var DATA_TIP_POSITION_ATTR = "overlay-tip-position";
    var DATA_TIP_COLOR_ATTR = "overlay-tip-color";
    var DATA_TIP_OFFSET_ATTR = "overlay-tip-offset";

    $.tutorialOverlay = $.tutorialOverlay || {};

    /**
     * Public factory method to create a Tip.
     * @param {object} options the options used to initialize this Tip.
     **/
    $.tutorialOverlay.createTip = function (options) {
        return new Tip(options);
    };

    /**
     * Factory method to create a Tip from a jQuery object.
     * @returns {Tip} a Tip created from the jQuery object
     **/
    $.fn.tutorialOverlayTip = function () {
        return $.tutorialOverlay.createTip({
            target: this.data(DATA_TIP_TARGET_ATTR),
            direction: this.data(DATA_TIP_POSITION_ATTR),
            content: this[0],
            color: this.data(DATA_TIP_COLOR_ATTR),
            offset: this.data(DATA_TIP_OFFSET_ATTR),
        });
    };

    /**
     * A Tip to be displayed on a Tutorial Overlay
     * @constructor
     * @property {string} target the selector specifying this Tip's target element
     * @property {string|object} content the selector specifying this Tip's content element or the element itself
     * @param {object} options the options used to initialize this Tip.
     **/
    function Tip(options) {
        //Constants
        var DEFAULT_TIP_COLOR = "#FFFFFF";
        var DEFAULT_TIP_DIRECTION = "north";
        var DEFAULT_TIP_OFFSET = 5;

        var DEFAULT_ARROW_SIZE = 40;
        var DEFAULT_ARROW_PADDING = 5;
        var DEFAULT_ARROW_HEAD_SIZE = 10;

        //public properties
        this.target = options.target;
        this.content = options.content;

        //private variables
        var _direction = (options.direction || DEFAULT_TIP_DIRECTION).toLowerCase().trim(); // Sanitize the direction string
        var offsetValue = parseInt(options.offset, 10);
        var _offset = isFinite(offsetValue) ? offsetValue : DEFAULT_TIP_OFFSET;
        var _color = options.color || DEFAULT_TIP_COLOR;
        var $tip; //the cached jquery object for our tip content

        /**
         * Get the space between the Tip and its target.
         * @returns {number} the offset of the Tip
         **/
        this.getOffset = function () {
            return _offset;
        };

        /**
         * Get the (cached) jQuery object that this Tip is associated with.
         * @returns {jQuery} the jquery object corresponding to this Tip's 'content' selector
         **/
        this.getTipEl = function () {
            if (!$tip) {
                $tip = $(this.content);
            }
            return $tip;
        };

        /**
         * Get the on-screen size of the rendered Tip.  This assumes that the Tip is in the DOM and not display:none.
         * This function will return null if the target is not visible or is partially off the screen.
         * This function will also return null if the Tip cannot be positioned around the target in such a way that the entire Tip is on the screen.
         * @param {object} [windowSize=current window size] - the width and height of the viewport
         **/
        this.getTipBounds = function (windowSize) {
            //Make sure the target is completely visible on the page before calculating the tip position.
            var $tipTarget = $(this.target);
            if (!$tipTarget.length || !$tipTarget.is(":visible")) {
                //Don't show the tip if we can't find the target.
                return null;
            } else {
                //else if target is not *entirely* on the screen, then don't show the tip
                var targetRect = $tipTarget.clientRect();
                if (!windowSize) {
                    var $window = $(window);
                    windowSize = {
                        width: $window.width(),
                        height: $window.height()
                    };
                }
                //If the target is partially or wholly off the screen, then don't show the tip.
                if ((targetRect.left < 0) || (targetRect.right > windowSize.width) || (targetRect.top < 0) || (targetRect.bottom > windowSize.height)) {
                    return null;
                }
            }

            //If the tip is display:block, this sometimes gives the full width of the overlay.
            //  It would be possible to fix this in code by changing the display to inline-block before getting the size.
            //TODO: What about images that haven't loaded yet?
            //TODO: What about web fonts that haven't loaded yet?
            var tipRect = this.getTipEl().clientRect();

            var offset = this.getOffset();

            //Calculate the original position of the tip.
            var estimatedTipSizes = _getSizeEstimates(this, tipRect, windowSize);
            var calculatedPos = this.getTipEl().calcRestrainedPos({
                contentSizes: estimatedTipSizes,
                context: $tipTarget,
                direction: this.direction,
                offsets: {
                    vertical: offset,
                    horizontal: offset,
                    viewport: offset,
                    padding: offset
                },
                cornerAdjacent: true
            });
            if (!calculatedPos || !calculatedPos.pos.top) {
                return null; //invalid direction - don't show this tip
            }
            tipRect.left = calculatedPos.pos.left;
            tipRect.right = tipRect.left + tipRect.width;
            tipRect.top = calculatedPos.pos.top;
            tipRect.bottom = tipRect.top + tipRect.height;

            return tipRect;
        };

        /**
         * Render the Tip, and Arrow onto the Tutorial Overlay.
         * This function will set the 'direction' property of the tipRect parameter to the direction of this Tip.
         * @param {object} tipRect the bounding box of the Tip content
         **/
        this.render = function (tipRect, canvasContext, overlaySize, occupiedRects) {
            if (!tipRect) {
                //else the target is not entirely on the page, so hide the tip
                this.getTipEl().hide();
                return;
            }

            //Calculate possible tip rects for each direction.
            var expectedTipSizes = _getSizeEstimates(this, tipRect, overlaySize);
            var arrowOptions = _getArrowOptions();

            var arrow = this._addArrow(tipRect, _direction, overlaySize, arrowOptions);
            var viewportMargin = arrow.getSize() / 2;
            var arrowPadding = arrow.getPadding();

            var newTipRect = $.extend({}, tipRect);
            arrow.addToTip(newTipRect);
            var calculatedPos = this.getTipEl().calcRestrainedPos({
                contentSizes: expectedTipSizes,
                context: this.target,
                direction: _direction,
                offsets: {
                    vertical: _offset,
                    horizontal: _offset,
                    viewport: viewportMargin,
                    padding: arrowPadding
                },
                exclusions: occupiedRects,
                cornerAdjacent: true
            });
            if (calculatedPos && calculatedPos.pos.top) {
                if (calculatedPos.direction !== _direction) {
                    //Adjust the arrow.
                    arrow = this._addArrow(tipRect, calculatedPos.direction, overlaySize, arrowOptions);
                    newTipRect = $.extend({}, tipRect);
                    arrow.addToTip(newTipRect);
                }

                var dx = calculatedPos.pos.left - newTipRect.left;
                var dy = calculatedPos.pos.top - newTipRect.top;
                if ((dx !== 0) || (dy !== 0)) {
                    $.translateRect(tipRect, dx, dy);
                    arrow.translate(dx, dy);

                    //Check arrow position - it may need to be changed if it no longer points to the target
                    var targetRect = $(this.target).clientRect();
                    $.growRect(targetRect, -arrowPadding);
                    if (!arrow.isValid(targetRect)) {
                        arrow.toggleDirection(tipRect);
                    }
                }
            } else {
                //can't position it.  Give up.
                this.getTipEl().hide();
                return;
            }

            //Check for collisions with the center content, other tips (and other child elements of the overlay?)
            if (occupiedRects) {
                newTipRect = $.extend({}, tipRect);
                arrow.addToTip(newTipRect);

                //TODO: This shouldn't be needed any more.
                var intersectingRect = _detectCollisions(newTipRect, occupiedRects);
                if (!intersectingRect) {
                    occupiedRects.push(newTipRect);
                } else {
                    //collision detected
                    // move the tip?
                    //Note: this should never happen in practice.  See above TODO.
                    this.getTipEl().hide();
                    return;
                }
            }

            //Set the tip's position
            this.getTipEl().css({
                position: "absolute",
                top: tipRect.top + "px",
                left: tipRect.left + "px",
                visibility: ""
            }).show();

            arrow.render(_color, canvasContext);
        };

        /**
         * Create an Arrow for this Tip and add it's bounds to tipRect.
         * This function is public only for testing purposes.  It is not meant for public use.
         * @private
         * @param {object} tipRect the bounding box of the Tip
         * @param {string} tipPosition the layout position of the Tip
         * @param {object} overlaySize the size of the containing Tutorial Overlay
         * @param {object} arrowOptions options used to creat the Arrow
         * @returns {Arrow} a new Arrow object
         **/
        this._addArrow = function (tipRect, tipPosition, overlaySize, arrowOptions) {
            var overlayCenterX = overlaySize.width / 2;
            var overlayCenterY = overlaySize.height / 2;

            var arrowSize = arrowOptions.size;
            var arrowDirection;
            var dx = 0;
            var dy = 0;

            switch (tipPosition) {
            case "south":
                if (overlayCenterX - tipRect.left > tipRect.width / 2) {
                    //Left of center
                    //NNE curved arrow
                    dx = -(arrowSize + tipRect.width / 2);
                    dy = arrowSize - tipRect.height / 2;
                    arrowDirection = "NNE";
                } else {
                    //Right of center
                    //NNW curved arrow
                    dx = arrowSize + tipRect.width / 2;
                    dy = arrowSize - tipRect.height / 2;
                    arrowDirection = "NNW";
                }
                break;

            default: // Default to "north"
            case "north":
                if (overlayCenterX - tipRect.left > tipRect.width / 2) {
                    //Left of center
                    //SSE curved arrow
                    dx = -(arrowSize + tipRect.width / 2);
                    dy = -(arrowSize - tipRect.height / 2);
                    arrowDirection = "SSE";
                } else {
                    //Right of center
                    //SSW curved arrow
                    dx = arrowSize + tipRect.width / 2;
                    dy = -(arrowSize - tipRect.height / 2);
                    arrowDirection = "SSW";
                }
                break;

            case "east":
                if (overlayCenterY - tipRect.top > tipRect.height / 2) {
                    //Above center
                    //WSW curved arrow
                    dx = arrowSize / 2;
                    dy = -(arrowSize + tipRect.height / 2);
                    arrowDirection = "WSW";
                } else {
                    //Below center
                    //WNW curved arrow
                    dx = arrowSize / 2;
                    dy = arrowSize + (tipRect.height / 2);
                    arrowDirection = "WNW";
                }
                break;

            case "west":
                if (overlayCenterY - tipRect.top > tipRect.height / 2) {
                    //Above center
                    //ESE curved arrow
                    dx = -arrowSize / 2;
                    dy = -(arrowSize + tipRect.height / 2);
                    arrowDirection = "ESE";
                } else {
                    //Below center
                    //ENE curved arrow
                    dx = -arrowSize / 2;
                    dy = arrowSize + (tipRect.height / 2);
                    arrowDirection = "ENE";
                }
                break;
            }
            arrowOptions.direction = arrowDirection;
            $.translateRect(tipRect, dx, dy);
            return $.tutorialOverlay.createArrow(tipRect, arrowOptions);
        };

        var _getArrowOptions = function () {
            return {
                size: DEFAULT_ARROW_SIZE,
                padding: DEFAULT_ARROW_PADDING,
                headSize: DEFAULT_ARROW_HEAD_SIZE
            };
        };

        /**
         * Get size estimates for the Tip, including Arrow, in each possible layout direction.
         * @private
         * @param {object} tipRect the bounding box of the tip content
         * @param {object} overlaySize the size of the containing Tutorial Overlay
         * @returns {object} a hashtable of sizes keyed by direction
         **/
        var _getSizeEstimates = function (tip, tipRect, overlaySize) {
            var expectedTipSizes = {};

            var arrowOptions = _getArrowOptions();

            expectedTipSizes["north"] = $.extend({}, tipRect);
            var arrow = tip._addArrow(expectedTipSizes["north"], "north", overlaySize, arrowOptions);
            arrow.addToTip(expectedTipSizes["north"]);
            expectedTipSizes["south"] = expectedTipSizes["north"]; //north/south should be same size

            expectedTipSizes["west"] = $.extend({}, tipRect);
            arrow = tip._addArrow(expectedTipSizes["west"], "west", overlaySize, arrowOptions);
            arrow.addToTip(expectedTipSizes["west"]);
            expectedTipSizes["east"] = expectedTipSizes["west"]; //east/west should be same size

            return expectedTipSizes;
        };

        var _detectCollisions = function (rect1, otherRects) {
            //stupid n^2 algorithm to detect collisions.
            //  If performance is a concern, use a quadtree or even sort the list of otherRects
            //  on one axis.
            var collision = null;
            for (var i = 0;
                (i < otherRects.length) && !collision; i++) {
                if ($.rectsIntersect(otherRects[i], rect1)) {
                    collision = otherRects[i];
                }
            }
            return collision;
        };
    }
}(jQuery));