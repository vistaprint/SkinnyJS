(function ($) {
    var OVERLAY_CLASS = ".tutorial-overlay";
    var VEIL_CLASS = ".tutorial-overlay-veil";
    var CANVAS_CLASS = ".tutorial-overlay-canvas";
    var TIP_CLASS = ".tutorial-overlay-tip";
    var CONTENT_CLASS = ".tutorial-overlay-content";
    var CLOSE_OVERLAY_CLASS = ".close-overlay";

    var DATA_AUTOLOAD_ATTR = "data-overlay-autoload";
    var DATA_ZINDEX_ATTR = "data-overlay-zindex";
    var DATA_HIDE_ON_CLICK_ATTR = "overlay-hideonclick";
    var DATA_TIP_TARGET_ATTR = "overlay-tip-target";
    var DATA_TIP_POSITION_ATTR = "overlay-tip-position";

    var DEFAULT_TIP_COLOR = "#FFFFFF";
    var DEFAULT_TIP_POSITION = "north";
    var DEFAULT_ARROW_SIZE = 40;
    var DEFAULT_ARROW_PADDING = 5;
    var DEFAULT_ARROW_HEAD_SIZE = 10;

    // Default values
    $.tutorialOverlay.defaults = {
        zIndex: 10000, // Allow callers to participate in zIndex arms races
        //        destroyOnClose: false, // If true, the overlay DOM will be destroyed and all events removed when the overlay closes
        hideOnClick: true,
        autoLoad: false,
    };

    function TutorialOverlay(settings) {
        if (!settings) {
            settings = {};
        }
        this.settings = settings;

        $.proxyAll(this, "show", "hide", "destroy", "isShowing", "setHideOnClick", "addTip", "setCenterContent", "_render", "_renderTip", "_clickHandler", "_windowResized");

        this._tips = [];

        var clickHide = $.tutorialOverlay.defaults.hideOnClick;
        if ((settings.hideOnClick !== undefined) && !settings.hideOnClick) {
            clickHide = settings.hideOnClick;
        }

        this._$overlay = settings.overlay;
        var centerContent = this._$overlay.find(CONTENT_CLASS);
        if (centerContent.length) {
            this.setCenterContent(centerContent);
        }

        this._$overlay.css("z-index", settings.zIndex);

        this._initializeTips();

        this.setHideOnClick(clickHide);
        var me = this;
        this._$overlay.on("click", CLOSE_OVERLAY_CLASS, function (e) {
            e.preventDefault();

            // Defer to the next tick of the event loop. It makes it more useful
            // to apply this class without having to worry if the close handler will
            // run before any other handlers.
            setTimeout(function () {
                me.hide();
            }, 0);
        });
    }

    // returns true iff the overlay is currently showing
    TutorialOverlay.prototype.isShowing = function () {
        return this._$overlay && this._$overlay.is(":visible");
    };

    // shows the overlay
    TutorialOverlay.prototype.show = function () {
        if (!this.isShowing()) {
            this._ensureVeil();
            this._ensureCanvas();

            this._render();
            $(window).on("resize", this._windowResized);
            this._$overlay.show();
        }
    };

    // hides the overlay
    TutorialOverlay.prototype.hide = function () {
        this._$overlay.hide();
        $(window).off("resize", this._windowResized);
        if (this.settings.destroyOnClose) {
            this.destroy();
            this._destroyed = true;
        }
    };

    TutorialOverlay.prototype.destroy = function () {
        this._$overlay.empty();
        this._$overlay.remove();
    };

    // set the hide-on-click behavior
    TutorialOverlay.prototype.setHideOnClick = function (hideOnClick) {
        this.hideOnClick = hideOnClick;

        this._$overlay.off("click", this._clickHandler);

        if (this.hideOnClick) {
            this._$overlay.on("click", this._clickHandler);
        }
    };

    // add a new Tip
    //  A Tip should have:
    //      content
    //      target
    //      relative position (optional)
    //      color (optional)
    //      offset (optional)
    TutorialOverlay.prototype.addTip = function (newTip) {
        this._tips.push({
            target: newTip.target,
            content: newTip.content,
            relativePos: newTip.position.toLowerCase(),
            color: newTip.color,
            offset: newTip.offset,
        });
    };

    // set the content to be displayed in the center of the overlay
    TutorialOverlay.prototype.setCenterContent = function (newCenterContent) {
        //TODO: repaint
        this._$centerContent = $(newCenterContent);
    };

    /*
     * Ensure that a 'veil' element exists in the overlay.  This is necessary to support older IE where transparency isn't supported.
     * The 'veil' will be translucent and capture click events.  All other elements in the overlay should be rendered on top of it.
     */
    TutorialOverlay.prototype._ensureVeil = function () {
        if (!this._$veil) {
            var $veil = this._$overlay.find(VEIL_CLASS);
            if (!$veil.length) {
                //create and add a veil div
                $veil = $("<div class='" + VEIL_CLASS.substring(1) + "''></div>");
                this._$overlay.prepend($veil);

                //if (this.hideOnClick) {
                //    $veil.on("click", this._clickHandler);
                //}
            }
            this._$veil = $veil;
        }
    };

    TutorialOverlay.prototype._ensureCanvas = function () {
        if (!this._$canvas) {
            var $canvas = this._$overlay.find("canvas" + CANVAS_CLASS);
            if (!$canvas.length) {
                $canvas = $("<canvas width='1024' height='1024' class='" + CANVAS_CLASS.substring(1) + "'></canvas>");
                this._$overlay.append($canvas);
                if (typeof (G_vmlCanvasManager) != "undefined") {
                    G_vmlCanvasManager.initElement($canvas[0]);
                }
                //if (this.hideOnClick) {
                //    $canvas.on("click", this._clickHandler);
                //}
            }
            this._$canvas = $canvas;
        }
    };

    TutorialOverlay.prototype._initializeTips = function () {
        if (this._$overlay) {
            //find tips in DOM
            var domTips = this._$overlay.find(TIP_CLASS);
            var tips = this._tips;
            $.each(domTips, function () {
                var $tipEl = $(this);
                tips.push({
                    target: $tipEl.data(DATA_TIP_TARGET_ATTR),
                    relativePos: $tipEl.data(DATA_TIP_POSITION_ATTR).toLowerCase(),
                    content: this,
                    color: $tipEl.data("overlay-tip-color"),
                    offset: $tipEl.data("overlay-tip-offset"),
                });
            });
        }
    };

    TutorialOverlay.prototype._render = function () {
        var me = this;

        var context = this._$canvas[0].getContext("2d");
        //Ensure canvas fills the entire window
        var overlaySize = _getOverlaySize();
        this._$overlay.width(overlaySize.width);
        this._$overlay.height(overlaySize.height);
        context.canvas.width = overlaySize.width;
        context.canvas.height = overlaySize.height;

        var $window = $(window);
        var windowSize = {
            width: $window.width(),
            height: $window.height()
        };

        //TODO: If tip targets need to be highlighted via cutting of the veil:
        //      1) use fillRect to paint the translucent veil on the canvas INSTEAD OF CSS background-color on the overlay component
        //      2) cut holes in the veil by filling the bounding box of the target in the canvas with 'destination-out' compositing.
        //Fill the entire canvas with a translucent veil.
        //context.fillStyle = "rgba(0, 0, 0, 0.6)";
        //context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        //In order to measure the content and tips for proper positioning:
        //  1) set the overlay to visibility:hidden
        //  2) measure everything
        //  3) set the overlay to display:none to prevent reflows while positioning
        //  4) position everything
        //  5) show the overlay

        // Make sure all tips are in the overlay element before trying to calculate their size and positions:
        $.each(this._tips, function () {
            if (!this.$tip) {
                this.$tip = $(this.content);
            }
            this.$tip.css({
                visibility: "hidden",
                display: ""
            }); //tip may have been hidden at other screen widths - make sure it is available now to get a valid calculated size
            if (!$.contains(me._$overlay[0], this.$tip[0])) {
                me._$overlay.append(this.$tip);
            }
        });

        // 1) Make the overlay available to the browser's layout calculations:
        var overlayWasVisible = this._$overlay.is(":visible");
        if (!overlayWasVisible) {
            this._$overlay.css({
                visibility: "hidden",
                display: "block"
            });
        }

        // 2) Measure everything and calculate positions
        //      (Since there's no good way to get a unique hash for the tip and content elements, use an array and index instead of a hashtable.)
        //      Set up an array of clientRect
        //      Calculate the centerContent's size and store it in the array
        //      For each tip, calculate it's size and and initial position and store them in the array
        var tipBounds = [];
        var tipBoundsIndex = 0;
        if (this._$centerContent) {
            this._$centerContent.tipBoundsIndex = tipBoundsIndex++;
            tipBounds[this._$centerContent.tipBoundsIndex] = this._$centerContent.clientRect();
        }

        $.each(this._tips, function () {
            this.tipBoundsIndex = tipBoundsIndex++;

            //Make sure the target is completely visible on the page before calculating the tip position.
            var $tipTarget = $(this.target);
            if (!$tipTarget.length || !$tipTarget.is(":visible")) {
                //Don't show the tip if we can't find the target.
                tipBounds[this.tipBoundsIndex] = null;
                return true; //skip this tip
            } else {
                //else if target is not *entirely* on the screen, then return
                var targetRect = $tipTarget.clientRect();
                if ((targetRect.left < 0) || (targetRect.right > windowSize.width) || (targetRect.top < 0) || (targetRect.bottom > windowSize.height)) {
                    tipBounds[this.tipBoundsIndex] = null;
                    return true; //skip this tip
                }
            }

            //If the tip is display:block, this sometimes gives the full width of the overlay.
            //  It would be possible to fix this in code by changing the display to inline-block before getting the size.
            //TODO: What about images that haven't loaded yet?
            //TODO: What about web fonts that haven't loaded yet?
            var tipRect = this.$tip.clientRect();

            var offset = this.offset;
            if (!offset) {
                offset = DEFAULT_ARROW_PADDING;
            }

            //Calculate the original position of the tip.
            var estimatedTipSizes = _estimateTipSizes(tipRect, windowSize, {
                padding: DEFAULT_ARROW_PADDING,
                size: DEFAULT_ARROW_SIZE
            });
            var calculatedPos = this.$tip.calcRestrainedPos({
                contentSizes: estimatedTipSizes,
                context: $tipTarget,
                direction: this.relativePos,
                offsets: {
                    vertical: offset,
                    horizontal: offset,
                    viewport: offset,
                    padding: offset
                },
                cornerAdjacent: true
            });
            if (!calculatedPos || !calculatedPos.pos.top) {
                tipBounds[this.tipBoundsIndex] = null;
                return true; //invalid direction - skip this tip
            }
            tipRect.left = calculatedPos.pos.left;
            tipRect.right = tipRect.left + tipRect.width;
            tipRect.top = calculatedPos.pos.top;
            tipRect.bottom = tipRect.top + tipRect.height;
            tipRect.direction = calculatedPos.direction;

            tipBounds[this.tipBoundsIndex] = tipRect;
        });

        // 3) Remove the overlay from the flow calculations
        if (!overlayWasVisible) {
            this._$overlay.css({
                display: "none",
                visibility: "visible"
            });
        }

        // 4) Move everything to their new positions
        //      Position the center content
        //      Position each tip

        var occupiedRects = [];
        var contentRect = null;
        //Center content
        if (this._$centerContent) {
            var rect = tipBounds[this._$centerContent.tipBoundsIndex];
            var contentX = (windowSize.width - rect.width) / 2;
            var contentY = (windowSize.height - rect.height) / 2;

            this._$centerContent.css({
                position: "absolute",
                top: contentY + "px",
                left: contentX + "px"
            });

            contentRect = {
                top: contentY,
                left: contentX,
                bottom: contentY + rect.height,
                right: contentX + rect.width,
                width: rect.width,
                height: rect.height
            };
            occupiedRects.push(contentRect);
        }

        //For each tip:
        //  position tip relative to target
        //  add tip content at absolute position
        $.each(this._tips, function () {
            if (!this.$tip) {
                this.$tip = $(this.content);
            }
            var targetRect = $(this.target).clientRect();
            if (tipBounds[this.tipBoundsIndex] &&
                //If targetRect intersects center content, then ignore this tip.
                (!contentRect || !_rectsIntersect(targetRect, contentRect))) {
                me._renderTip(this, tipBounds[this.tipBoundsIndex], context, {
                    width: windowSize.width,
                    height: windowSize.height
                }, occupiedRects);
            } else {
                //else the target is not entirely on the page
                this.$tip.hide();
            }
        });

        // 5) Show the overlay
        this._$overlay.show();
    };

    //TODO: use an options argument here.  Include things like arrow-padding, stroke width, etc.
    TutorialOverlay.prototype._renderTip = function (tip, tipRect, canvasContext, overlaySize, occupiedRects) {
        //calculate the position of the tip
        var offset = this.offset;
        if (!offset) {
            offset = DEFAULT_ARROW_PADDING;
        }
        var viewportMargin = DEFAULT_ARROW_SIZE / 2;

        var arrowPadding = DEFAULT_ARROW_PADDING;
        var arrowOptions = {
            padding: arrowPadding,
            size: DEFAULT_ARROW_SIZE
        };

        //Calculate possible tip rects for each direction.
        var expectedTipSizes = _estimateTipSizes(tipRect, overlaySize, arrowOptions);

        var arrow = _addArrowToTip(tipRect, overlaySize, arrowOptions);
        var newTipRect = $.extend({}, tipRect);
        _addPointToRect(arrow.endPt.x, arrow.endPt.y, newTipRect);
        var calculatedPos = tip.$tip.calcRestrainedPos({
            contentSizes: expectedTipSizes,
            context: tip.target,
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

                arrow = _addArrowToTip(tipRect, overlaySize, arrowOptions);
                newTipRect = $.extend({}, tipRect);
                _addPointToRect(arrow.endPt.x, arrow.endPt.y, newTipRect);
            }

            var dx = calculatedPos.pos.left - newTipRect.left;
            var dy = calculatedPos.pos.top - newTipRect.top;
            if ((dx !== 0) || (dy !== 0)) {
                _translateRect(tipRect, dx, dy);
                _translateArrow(arrow, dx, dy);

                //Check arrow position - it may need to be changed if it no longer points to the target
                var targetRect = $(tip.target).clientRect();
                _growRect(targetRect, -arrowPadding * 2);
                if (!_isValidArrow(targetRect, arrow)) {
                    _toggleArrow(tipRect, arrow, arrowOptions);
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
                        _translateRect(tipRect, dx, dy);
                        _translateArrow(arrow, dx, dy);
                    }
                }
            }
        } else {
            //can't position it.  Give up.
            tip.$tip.hide();
            return;
        }

        //Check for collisions with the center content, other tips (and other child elements of the overlay?)
        if (occupiedRects) {
            newTipRect = $.extend({}, tipRect);
            _addPointToRect(arrow.endPt.x, arrow.endPt.y, newTipRect);

            //TODO: This shouldn't be needed any more.
            var intersectingRect = this._detectCollisions(newTipRect, occupiedRects);
            if (!intersectingRect) {
                occupiedRects.push(newTipRect);
            } else {
                //collision detected
                // move the tip?
                tip.$tip.hide();
                return;
            }
        }

        //Set the tip's position
        tip.$tip.css({
            position: "absolute",
            top: tipRect.top + "px",
            left: tipRect.left + "px",
            visibility: ""
        }).show();

        this._renderArrow(arrow.startPt, arrow.endPt, arrow.controlPt, tip.color, canvasContext);
    };

    TutorialOverlay.prototype._renderArrow = function (startPt, endPt, controlPt, color, canvasContext) {
        canvasContext.beginPath();
        if (!color) {
            color = DEFAULT_TIP_COLOR;
        }
        canvasContext.strokeStyle = color;

        //draw curve from startPt to endPt
        canvasContext.moveTo(startPt.x, startPt.y);
        canvasContext.quadraticCurveTo(controlPt.x, controlPt.y, endPt.x, endPt.y);

        //draw tip of arrow
        var headSize = DEFAULT_ARROW_HEAD_SIZE; // length of head in pixels
        var dx = endPt.x - controlPt.x;
        var dy = endPt.y - controlPt.y;
        var angle;
        if (dx === 0) {
            angle = Math.PI / 2;
            if (startPt.y > endPt.y) {
                angle *= 3;
            }
        } else {
            angle = Math.atan2(dy, dx);
        }
        canvasContext.lineTo(
            endPt.x - headSize * Math.cos(angle - Math.PI / 6),
            endPt.y - headSize * Math.sin(angle - Math.PI / 6)
        );
        canvasContext.moveTo(endPt.x, endPt.y);
        canvasContext.lineTo(
            endPt.x - headSize * Math.cos(angle + Math.PI / 6),
            endPt.y - headSize * Math.sin(angle + Math.PI / 6)
        );

        canvasContext.stroke();
    };

    TutorialOverlay.prototype._clickHandler = function (e) {
        //Ignore clicks in the centerContent element and its descendants.
        //  TODO: there has to be a better way to do this.
        if (!(this._$centerContent && $.contains(this._$centerContent[0], e.target))) {
            this.hide();
        }
    };

    //TODO: DRY and optimize
    var _addArrowToTip = function (tipRenderInfo, overlaySize, options) {
        var overlayCenterX = overlaySize.width / 2;
        var overlayCenterY = overlaySize.height / 2;

        var arrowPadding = (options && options.padding) ? options.padding : DEFAULT_ARROW_PADDING;
        var arrowSize = (options && options.size) ? options.size : DEFAULT_ARROW_SIZE;

        var arrow = {};
        switch (tipRenderInfo.direction) {
        case "north":
            if (overlayCenterX - tipRenderInfo.left > tipRenderInfo.width / 2) {
                //Left of center
                //SSE curved arrow
                _translateRect(tipRenderInfo, -(arrowSize + tipRenderInfo.width / 2), -(arrowSize - tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "SSE", arrowPadding, arrowSize);
            } else {
                //Right of center
                //SSW curved arrow
                _translateRect(tipRenderInfo, arrowSize + tipRenderInfo.width / 2, -(arrowSize - tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "SSW", arrowPadding, arrowSize);
            }
            break;

        case "south":
            if (overlayCenterX - tipRenderInfo.left > tipRenderInfo.width / 2) {
                //Left of center
                //NNE curved arrow
                _translateRect(tipRenderInfo, -(arrowSize + tipRenderInfo.width / 2), (arrowSize - tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "NNE", arrowPadding, arrowSize);
            } else {
                //Right of center
                //NNW curved arrow
                _translateRect(tipRenderInfo, arrowSize + tipRenderInfo.width / 2, (arrowSize - tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "NNW", arrowPadding, arrowSize);
            }
            break;

        case "east":
            if (overlayCenterY - tipRenderInfo.top > tipRenderInfo.height / 2) {
                //Above center
                //WSW curved arrow
                _translateRect(tipRenderInfo, arrowSize / 2, -(arrowSize + tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "WSW", arrowPadding, arrowSize);
            } else {
                //Below center
                //WNW curved arrow
                _translateRect(tipRenderInfo, arrowSize / 2, arrowSize + (tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "WNW", arrowPadding, arrowSize);
            }
            break;

        case "west":
            if (overlayCenterY - tipRenderInfo.top > tipRenderInfo.height / 2) {
                //Above center
                //ESE curved arrow
                _translateRect(tipRenderInfo, -arrowSize / 2, -(arrowSize + tipRenderInfo.height / 2));
                _calculateArrow(tipRenderInfo, arrow, "ESE", arrowPadding, arrowSize);
            } else {
                //Below center
                //ENE curved arrow
                _translateRect(tipRenderInfo, -arrowSize / 2, arrowSize + tipRenderInfo.height / 2);
                _calculateArrow(tipRenderInfo, arrow, "ENE", arrowPadding, arrowSize);
            }
            break;
        }
        return arrow;
    };

    var _calculateArrow = function (tipRenderInfo, arrow, arrowDirection, arrowPadding, arrowSize) {
        switch (arrowDirection) {
        case "SSE":
            arrow.startPt = {
                x: tipRenderInfo.right + arrowPadding,
                y: tipRenderInfo.top + tipRenderInfo.height / 2
            };
            arrow.endPt = {
                x: tipRenderInfo.right + arrowSize,
                y: arrow.startPt.y + (arrowSize - arrowPadding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case "SSW":
            arrow.startPt = {
                x: tipRenderInfo.left - arrowPadding,
                y: tipRenderInfo.top + tipRenderInfo.height / 2
            };
            arrow.endPt = {
                x: tipRenderInfo.left - arrowSize,
                y: arrow.startPt.y + (arrowSize - arrowPadding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case "NNE":
            arrow.startPt = {
                x: tipRenderInfo.right + arrowPadding,
                y: tipRenderInfo.top + tipRenderInfo.height / 2
            };
            arrow.endPt = {
                x: tipRenderInfo.right + arrowSize,
                y: arrow.startPt.y - (arrowSize - arrowPadding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case "NNW":
            arrow.startPt = {
                x: tipRenderInfo.left - arrowPadding,
                y: tipRenderInfo.top + tipRenderInfo.height / 2
            };
            arrow.endPt = {
                x: tipRenderInfo.left - arrowSize,
                y: arrow.startPt.y - (arrowSize - arrowPadding)
            };
            arrow.controlPt = {
                x: arrow.endPt.x,
                y: arrow.startPt.y
            };
            break;

        case "WSW":
            arrow.startPt = {
                x: tipRenderInfo.left + arrowSize / 2,
                y: tipRenderInfo.bottom + arrowPadding
            };
            arrow.endPt = {
                x: tipRenderInfo.left - (arrowSize / 2) + arrowPadding,
                y: tipRenderInfo.bottom + arrowSize
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case "WNW":
            arrow.startPt = {
                x: tipRenderInfo.left + arrowSize / 2,
                y: tipRenderInfo.top - arrowPadding
            };
            arrow.endPt = {
                x: tipRenderInfo.left - arrowSize / 2 + arrowPadding,
                y: tipRenderInfo.top - arrowSize
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case "ESE":
            arrow.startPt = {
                x: tipRenderInfo.right - arrowSize / 2,
                y: tipRenderInfo.bottom + arrowPadding
            };
            arrow.endPt = {
                x: tipRenderInfo.right + arrowSize / 2 - arrowPadding,
                y: tipRenderInfo.bottom + arrowSize
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;

        case "ENE":
            arrow.startPt = {
                x: tipRenderInfo.right - arrowSize / 2,
                y: tipRenderInfo.top - arrowPadding
            };
            arrow.endPt = {
                x: tipRenderInfo.right + arrowSize / 2 - arrowPadding,
                y: tipRenderInfo.top - arrowSize
            };
            arrow.controlPt = {
                x: arrow.startPt.x,
                y: arrow.endPt.y
            };
            break;
        }
        arrow.direction = arrowDirection;
    };

    var _toggleArrow = function (tipRenderInfo, arrow, options) {
        var arrowPadding = (options && options.padding) ? options.padding : DEFAULT_ARROW_PADDING;
        var arrowSize = (options && options.size) ? options.size : DEFAULT_ARROW_SIZE;

        var newDirection = arrow.direction;
        switch (arrow.direction) {
        case "SSE":
            newDirection = "SSW";
            _translateRect(tipRenderInfo, arrowSize, 0);
            break;

        case "SSW":
            newDirection = "SSE";
            _translateRect(tipRenderInfo, -arrowSize, 0);
            break;

        case "NNE":
            newDirection = "NNW";
            _translateRect(tipRenderInfo, arrowSize, 0);
            break;

        case "NNW":
            newDirection = "NNE";
            _translateRect(tipRenderInfo, -arrowSize, 0);
            break;

        case "WSW":
            newDirection = "WNW";
            _translateRect(tipRenderInfo, 0, arrowSize);
            break;

        case "WNW":
            newDirection = "WSW";
            _translateRect(tipRenderInfo, 0, -arrowSize);
            break;

        case "ESE":
            newDirection = "ENE";
            _translateRect(tipRenderInfo, 0, arrowSize);
            break;

        case "ENE":
            newDirection = "ESE";
            _translateRect(tipRenderInfo, 0, -arrowSize);
            break;
        }
        _calculateArrow(tipRenderInfo, arrow, newDirection, arrowPadding, arrowSize);
    };

    TutorialOverlay.prototype._detectCollisions = function (rect1, otherRects) {
        //stupid n^2 algorithm to detect collisions.
        //  If performance is a concern, use a quadtree or even sort the list of otherRects
        //  on one axis.
        var collision = null;
        for (var i = 0;
            (i < otherRects.length) && !collision; i++) {
            if (_rectsIntersect(otherRects[i], rect1)) {
                collision = otherRects[i];
            }
        }
        return collision;
    };

    var timeout;
    TutorialOverlay.prototype._windowResized = function () {
        //Debounce the resize event with a timeout.
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(this._render, 50);
    };

    /*
     * If the arrow does not point to the rect defined by tipRenderInfo,
     *   then return false;
     */
    var _isValidArrow = function (targetRect, arrow) {
        var valid = false;
        var endPt = arrow.endPt;
        switch (arrow.direction) {
        case "SSE":
        case "SSW":
            //Arrow points south
            valid = (endPt.x >= targetRect.left) && (endPt.x <= targetRect.right) && (endPt.y <= targetRect.top);
            break;

        case "NNE":
        case "NNW":
            //Arrow points north
            valid = (endPt.x >= targetRect.left) && (endPt.x <= targetRect.right) && (endPt.y >= targetRect.bottom);
            break;

        case "WSW":
        case "WNW":
            //Arrow points west
            valid = (endPt.y >= targetRect.bottom) && (endPt.y <= targetRect.top) && (endPt.x <= targetRect.left);
            break;

        case "ESE":
        case "ENE":
            //Arrow points east
            valid = (endPt.y >= targetRect.bottom) && (endPt.y <= targetRect.top) && (endPt.x >= targetRect.right);
            break;
        }
        return valid;
    };

    var _translateArrow = function (arrow, dx, dy) {
        arrow.startPt.x += dx;
        arrow.startPt.y += dy;
        arrow.endPt.x += dx;
        arrow.endPt.y += dy;
        arrow.controlPt.x += dx;
        arrow.controlPt.y += dy;
    };

    var _estimateTipSizes = function (tipRect, overlaySize, arrowOptions) {
        var expectedTipSizes = {};
        expectedTipSizes["north"] = $.extend({}, tipRect);
        expectedTipSizes["north"].direction = "north";
        var arrow = _addArrowToTip(expectedTipSizes["north"], overlaySize, arrowOptions);
        _addPointToRect(arrow.endPt.x, arrow.endPt.y, expectedTipSizes["north"]);
        expectedTipSizes["south"] = expectedTipSizes["north"]; //north/south should be same size
        expectedTipSizes["west"] = $.extend({}, tipRect);
        expectedTipSizes["west"].direction = "west";
        arrow = _addArrowToTip(expectedTipSizes["west"], overlaySize, arrowOptions);
        _addPointToRect(arrow.endPt.x, arrow.endPt.y, expectedTipSizes["west"]);
        expectedTipSizes["east"] = expectedTipSizes["west"]; //east/west should be same size

        return expectedTipSizes;
    };

    var _rectsIntersect = function (rect1, rect2) {
        return !(rect2.left > rect1.right ||
            rect2.right < rect1.left ||
            rect2.top > rect1.bottom ||
            rect2.bottom < rect1.top);
    };

    var _getOverlaySize = function () {
        var $document = $(document);

        return {
            width: $document.width(),
            height: $document.height()
        };
    };

    var _translateRect = function (rect, dx, dy) {
        rect.left += dx;
        rect.top += dy;
        rect.right = rect.left + rect.width;
        rect.bottom = rect.top + rect.height;
    };

    var _growRect = function (rect, dw, dh) {
        if ((typeof (dh) === "undefined") || isNaN(dh)) {
            dh = dw;
        }
        rect.width += dw;
        rect.height += dh;
        _translateRect(rect, -dw / 2, -dh / 2);
    };

    var _addPointToRect = function (x, y, rect) {
        if (x < rect.left) {
            rect.left = x;
            rect.width = rect.right - rect.left;
        } else if (x > rect.right) {
            rect.right = x;
            rect.width = rect.right - rect.left;
        }
        if (y < rect.top) {
            rect.top = y;
            rect.height = rect.bottom - rect.top;
        } else if (y > rect.bottom) {
            rect.bottom = y;
            rect.height = rect.bottom - rect.top;
        }
    };

    //Takes a settings object and calculates derived settings.
    //Settings go in order:

    // 1. default value
    // 2. settings passed
    var ensureSettings = function (explicitSettings) {
        var settings = $.extend({}, $.tutorialOverlay.defaults);

        // Read settings specified on the target node's custom HTML attributes
        if (explicitSettings.overlay) {
            var $target = $(explicitSettings.overlay);
            var targetSettings = $.tutorialOverlay.getSettings($target);
            $.extend(settings, targetSettings);
        }

        // The explicitly specified settings take precedence
        $.extend(settings, explicitSettings);
        return settings;
    };

    // Public sub-namespace for tutorial overlays.
    $.tutorialOverlay = $.tutorialOverlay || {};

    // Creates a new overlay from the specified settings.
    $.tutorialOverlay.create = function (settings) {
        settings = ensureSettings(settings);

        var overlay;

        // Validate that there isn't an existing overlay open using the same content
        if (settings.overlay) {
            var existingOverlay = $(settings.overlay).tutorialOverlayInstance();

            if (existingOverlay &&
                existingOverlay.isShowing()) {
                throw new Error("An attempt was made to create a tutorial overlay with a node which is already assigned to another open overlay.");
            }
        }
        if (settings.overlay) {
            var $overlay = $(settings.overlay);
            if ($overlay.length === 0) {
                throw new Error("Tutorial overlay not found.");
            }

            settings.overlay = $overlay;

            overlay = new TutorialOverlay(settings);

            //if (!settings.destroyOnClose) {
            $overlay.tutorialOverlayInstance(overlay);
            //}
        }
        if (!overlay) {
            throw new Error("No content node specified.");
        }

        return overlay;
    };

    var JQUERY_DATA_KEY = "tutorialOverlay";

    $.fn.tutorialOverlayInstance = function (overlay) {
        return !overlay ? this.data(JQUERY_DATA_KEY) : this.data(JQUERY_DATA_KEY, overlay);
    };

    // Idiomatic jQuery interface for tutorial overlays.
    $.fn.tutorialOverlay = function (settings) {
        var overlay;

        // If the first argument is a string, it is a method name to call on the overlay
        // associated with the DOM element.
        if (typeof settings == "string") {
            var action = settings;
            overlay = this.tutorialOverlayInstance();
            if (overlay && overlay[action]) {
                overlay[action].apply(overlay, Array.prototype.slice(arguments, 1));
            }
        }
        // Otherwise, create a new overlay.
        else {
            settings = settings || {};
            settings.overlay = this[0];

            overlay = $.tutorialOverlay.create(settings);

            overlay.show();
        }

        return this;
    };

})(jQuery);