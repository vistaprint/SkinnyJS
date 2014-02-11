/// <reference path="jquery.tutorialOverlayArrow.js" />

/*
Tip for Tutorial Overlay
*/
(function ($) {
    var DEFAULT_TIP_COLOR = "#FFFFFF";
    var DEFAULT_TIP_DIRECTION = "north";
    var DEFAULT_TIP_OFFSET = 5;

    var DEFAULT_ARROW_SIZE = 40;
    var DEFAULT_ARROW_PADDING = 5;
    var DEFAULT_ARROW_HEAD_SIZE = 10;

    function Tip(options) {
        this.top = this.left = this.width = this.height = 0;

        this.direction = options.direction || DEFAULT_TIP_DIRECTION;
        this.target = options.target;
        this.content = options.content;
        this.color = options.color || DEFAULT_TIP_COLOR;
        this.offset = ("offset" in options) ? options.offset : DEFAULT_TIP_OFFSET;

        //this.arrow = new Arrow(arrowOptions);
    }

    $.tutorialOverlay.createTip = function (options) {
        return new Tip(options);
    };

    //Get estimates of the tip size, including arrow, for each direction.
    Tip.prototype.getSizeEstimates = function (tipRect, overlaySize) {
        var expectedTipSizes = {};

        var arrowOptions = this.getArrowOptions();

        expectedTipSizes["north"] = $.extend({}, tipRect);
        expectedTipSizes["north"].direction = "north";
        var arrow = _addArrow(expectedTipSizes["north"], overlaySize, arrowOptions);
        arrow.addToTip(expectedTipSizes["north"]);
        expectedTipSizes["south"] = expectedTipSizes["north"]; //north/south should be same size

        expectedTipSizes["west"] = $.extend({}, tipRect);
        expectedTipSizes["west"].direction = "west";
        arrow = _addArrow(expectedTipSizes["west"], overlaySize, arrowOptions);
        arrow.addToTip(expectedTipSizes["west"]);
        expectedTipSizes["east"] = expectedTipSizes["west"]; //east/west should be same size

        return expectedTipSizes;
    };

    Tip.prototype.render = function (tipRect, canvasContext, overlaySize, occupiedRects) {
        //calculate the position of the tip
        var offset = this.offset;
        tipRect.direction = this.direction;

        //Calculate possible tip rects for each direction.
        var expectedTipSizes = this.getSizeEstimates(tipRect, overlaySize);
        var arrowOptions = this.getArrowOptions();

        var arrow = _addArrow(tipRect, overlaySize, arrowOptions);
        var viewportMargin = arrow.size / 2;
        var arrowPadding = arrow.padding;

        var newTipRect = $.extend({}, tipRect);
        arrow.addToTip(newTipRect);
        var calculatedPos = this.$tip.calcRestrainedPos({
            contentSizes: expectedTipSizes,
            context: this.target,
            direction: tipRect.direction,
            offsets: {
                vertical: offset,
                horizontal: offset,
                viewport: viewportMargin,
                padding: arrowPadding
            },
            exclusions: occupiedRects,
            cornerAdjacent: true
        });
        if (calculatedPos && calculatedPos.pos.top) {
            if (calculatedPos.direction !== tipRect.direction) {
                //Adjust the arrow.
                tipRect.direction = calculatedPos.direction;

                arrow = _addArrow(tipRect, overlaySize, arrowOptions);
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
                    /*
                    //The following is code to double-check the arrow position, but should never be needed.
                    var endPt = arrow.endPt;
                    switch (arrow.direction) {
                    case "SSE":
                    case "SSW":
                    case "NNE":
                    case "NNW":
                        //Arrow points south/north
                        if (endPt.x > targetRect.right) {
                            dx = targetRect.right - endPt.x;
                        } else if (endPt.x < targetRect.left) {
                            dx = targetRect.left - endPt.x;
                        } else {
                            dx = 0;
                        }
                        dy = 0;
                        break;

                    case "WSW":
                    case "WNW":
                    case "ESE":
                    case "ENE":
                        //Arrow points east/west
                        if (endPt.y > targetRect.bottom) {
                            dy = targetRect.bottom - endPt.y;
                        } else if (endPt.y < targetRect.top) {
                            dy = targetRect.top - endPt.y;
                        } else {
                            dy = 0;
                        }
                        dx = 0;
                        break;
                    }
                    if ((dx !== 0) || (dy !== 0)) {
                        //TODO: Does this state still occur?
                        $.translateRect(tipRect, dx, dy);
                        arrow.translate(dx, dy);
                    }
                    */
                }
            }
        } else {
            //can't position it.  Give up.
            this.$tip.hide();
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
                this.$tip.hide();
                return;
            }
        }

        //Set the tip's position
        this.$tip.css({
            position: "absolute",
            top: tipRect.top + "px",
            left: tipRect.left + "px",
            visibility: ""
        }).show();

        arrow.render(this.color, canvasContext);
    };

    /*Tip.prototype.getBounds = function () {
        return {
            top: this.top,
            left: this.left,
            width: this.width,
            height: this.height
        };
    };*/

    Tip.prototype.getArrowOptions = function () {
        return {
            size: DEFAULT_ARROW_SIZE,
            padding: DEFAULT_ARROW_PADDING,
            headSize: DEFAULT_ARROW_HEAD_SIZE,
            tip: this
        };
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

    //TODO: DRY and optimize
    var _addArrow = function (tipRect, overlaySize, arrowOptions) {
        var overlayCenterX = overlaySize.width / 2;
        var overlayCenterY = overlaySize.height / 2;

        var arrowSize = arrowOptions.size;

        switch (tipRect.direction) {
        case "north":
        default: // Default to "north"
            if (overlayCenterX - tipRect.left > tipRect.width / 2) {
                //Left of center
                //SSE curved arrow
                $.translateRect(tipRect, -(arrowSize + tipRect.width / 2), -(arrowSize - tipRect.height / 2));
                arrowOptions.direction = "SSE";
            } else {
                //Right of center
                //SSW curved arrow
                $.translateRect(tipRect, arrowSize + tipRect.width / 2, -(arrowSize - tipRect.height / 2));
                arrowOptions.direction = "SSW";
            }
            break;

        case "south":
            if (overlayCenterX - tipRect.left > tipRect.width / 2) {
                //Left of center
                //NNE curved arrow
                $.translateRect(tipRect, -(arrowSize + tipRect.width / 2), (arrowSize - tipRect.height / 2));
                arrowOptions.direction = "NNE";
            } else {
                //Right of center
                //NNW curved arrow
                $.translateRect(tipRect, arrowSize + tipRect.width / 2, (arrowSize - tipRect.height / 2));
                arrowOptions.direction = "NNW";
            }
            break;

        case "east":
            if (overlayCenterY - tipRect.top > tipRect.height / 2) {
                //Above center
                //WSW curved arrow
                $.translateRect(tipRect, arrowSize / 2, -(arrowSize + tipRect.height / 2));
                arrowOptions.direction = "WSW";
            } else {
                //Below center
                //WNW curved arrow
                $.translateRect(tipRect, arrowSize / 2, arrowSize + (tipRect.height / 2));
                arrowOptions.direction = "WNW";
            }
            break;

        case "west":
            if (overlayCenterY - tipRect.top > tipRect.height / 2) {
                //Above center
                //ESE curved arrow
                $.translateRect(tipRect, -arrowSize / 2, -(arrowSize + tipRect.height / 2));
                arrowOptions.direction = "ESE";
            } else {
                //Below center
                //ENE curved arrow
                $.translateRect(tipRect, -arrowSize / 2, arrowSize + tipRect.height / 2);
                arrowOptions.direction = "ENE";
            }
            break;
        }
        return $.tutorialOverlay.createArrow(tipRect, arrowOptions);
    };
}(jQuery));