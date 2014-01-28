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
        }
        this._$canvas = $canvas;
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
            this.$tip.show(); //tip may have been hidden at other screen widths - make sure it is visible now to get a valid calculated size
            if (!$.contains(me._$overlay[0], this.$tip[0])) {
                me._$overlay.append(this.$tip);
            }
        });

        // 1) Make the overlay available to the browser's layout calculations:
        this._$overlay.css({
            visibility: "hidden",
            display: "block"
        });

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
                if ((targetRect.left < 0) || (targetRect.right > overlaySize.width) || (targetRect.top < 0) || (targetRect.bottom > overlaySize.height)) {
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
            var calculatedPos = this.$tip.calcRestrainedPos({
                context: $(this.target),
                direction: this.relativePos,
                zoffsets: {
                    vertical: offset,
                    horizontal: offset,
                    viewport: offset
                }
            });
            if (!calculatedPos.pos.top) {
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
        this._$overlay.css({
            display: "none",
            visibility: "visible"
        });

        // 4) Move everything to their new positions
        //      Position the center content
        //      Position each tip

        var occupiedRects = [];
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

            occupiedRects.push({
                top: contentY,
                left: contentX,
                bottom: contentY + rect.height,
                right: contentX + rect.width,
                width: rect.width,
                height: rect.height
            });
        }

        //For each tip:
        //  position tip relative to target
        //  add tip content at absolute position
        $.each(this._tips, function () {
            if (!this.$tip) {
                this.$tip = $(this.content);
            }
            if (tipBounds[this.tipBoundsIndex]) {
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
        var $tipTarget = $(tip.target);
        var targetRect = $tipTarget.clientRect();

        var offset = tip.offset;
        if (!offset) {
            offset = DEFAULT_ARROW_SIZE;
        }

        //Calculate the arrow position
        var arrow = this._addArrowToTip(tipRect, overlaySize);

        var tipLocation = {
            x: tipRect.left,
            y: tipRect.top
        };

        //Check for collisions with the center content, other tips (and other child elements of the overlay?)
        if (occupiedRects) {
            var newTipRect = {
                left: tipLocation.x,
                top: tipLocation.y,
                width: tipRect.width,
                height: tipRect.height,
                right: tipLocation.x + tipRect.width,
                bottom: tipLocation.y + tipRect.height,
            };

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
            top: tipLocation.y + "px",
            left: tipLocation.x + "px"
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
    TutorialOverlay.prototype._addArrowToTip = function (tipRenderInfo, overlaySize, options) {
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
                    }
                } else {
                    //Right of center
                    //SSW curved arrow
                    _translateRect(tipRenderInfo, arrowSize + tipRenderInfo.width / 2, -(arrowSize - tipRenderInfo.height / 2));
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
                    }
                }
                break;

            case "south":
                if (overlayCenterX - tipRenderInfo.left > tipRenderInfo.width / 2) {
                    //Left of center
                    //NNE curved arrow
                    _translateRect(tipRenderInfo, -(arrowSize + tipRenderInfo.width / 2), (arrowSize - tipRenderInfo.height / 2));
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
                    }
                } else {
                    //Right of center
                    //NNW curved arrow
                    _translateRect(tipRenderInfo, arrowSize + tipRenderInfo.width / 2, (arrowSize - tipRenderInfo.height / 2));
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
                    }
                }
                break;

            case "east":
                if (overlayCenterY - tipRenderInfo.top > tipRenderInfo.height / 2) {
                    //Above center
                    //WSW curved arrow
                    _translateRect(tipRenderInfo, arrowSize / 2, -(arrowSize + tipRenderInfo.height / 2));
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
                    }
                } else {
                    //Below center
                    //WNW curved arrow
                    _translateRect(tipRenderInfo, arrowSize / 2, arrowSize + (tipRenderInfo.height / 2));
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
                    }
                }
                break;

            case "west":
                if (overlayCenterY - tipRenderInfo.top > tipRenderInfo.height / 2) {
                    //Above center
                    //ESE curved arrow
                    _translateRect(tipRenderInfo, -arrowSize / 2, -(arrowSize + tipRenderInfo.height / 2));
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
                    }
                } else {
                    //Below center
                    //ENE curved arrow
                    _translateRect(tipRenderInfo, -arrowSize / 2, arrowSize + tipRenderInfo.height / 2);
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
                    }
                }
                break;
        }
        return arrow;
    };

    TutorialOverlay.prototype._calculatePosition = function(tipRect, targetRect, pos, offset) {
        var startPt = {},
            endPt = {},
            tipLocation = {};

        //arrowPadding is the space between the end of the arrow and the tip/target, in pixels
        var arrowPadding = Math.max(Math.min(DEFAULT_ARROW_PADDING, offset - 2), 0); //Don't allow negative padding or padding more than the offset.

        //TODO: Handle collisions here?
        if (pos.above) {
            //north
            startPt.y = targetRect.top - offset;
            endPt.y = targetRect.top - arrowPadding;
            tipLocation.y = startPt.y - (tipRect.height + arrowPadding);
        } else if (pos.verticalCenter) {
            //center
            startPt.y = targetRect.top + (targetRect.height / 2);
            endPt.y = startPt.y;
            tipLocation.y = targetRect.top + ((targetRect.height - tipRect.height) / 2);
        } else {
            //south
            startPt.y = targetRect.bottom + offset;
            endPt.y = targetRect.bottom + arrowPadding;
            tipLocation.y = startPt.y + arrowPadding;
        }
        if (pos.right) {
            //east
            startPt.x = targetRect.right + offset;
            endPt.x = targetRect.right + arrowPadding;
            tipLocation.x = startPt.x + arrowPadding;
        } else if (pos.horizontalCenter) {
            //center
            startPt.x = targetRect.left + (targetRect.width / 2);
            endPt.x = startPt.x;
            tipLocation.x = targetRect.left + ((targetRect.width - tipRect.width) / 2);
        } else {
            //west
            startPt.x = targetRect.left - offset;
            endPt.x = targetRect.left - arrowPadding;
            tipLocation.x = startPt.x - (tipRect.width + arrowPadding);
        }

        return {
            startPt: startPt,
            endPt: endPt,
            tipLocation: tipLocation
        };
    };

    TutorialOverlay.prototype._detectCollisions = function (rect1, otherRects) {
        //stupid n^2 algorithm to detect collisions.
        //  If performance is a concern, use a quadtree or even sort the list of otherRects
        //  on one axis.
        var collision = null;
        for (var i = 0;
            (i < otherRects.length) && !collision; i++) {
            if (_rectsIntersect(otherRects[i], rect1)) {
                collision = rect1;
            }
        }
        return collision;
    };

    var _rectsIntersect = function(rect1, rect2) {
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
    }

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
            throw new Error("No content node specified.")
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