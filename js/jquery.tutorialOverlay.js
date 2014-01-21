(function($) {
    var OVERLAY_CLASS = ".tutorial-overlay";
    var VEIL_CLASS = ".tutorial-overlay-veil";
    var TIP_CLASS = ".tutorial-overlay-tip";
    var CONTENT_CLASS = ".tutorial-overlay-content";
    var CLOSE_OVERLAY_CLASS = ".close-overlay";

    var DATA_AUTOLOAD_ATTR = "data-overlay-autoload";
    var DATA_ZINDEX_ATTR = "data-overlay-zindex";
    var DATA_HIDE_ON_CLICK_ATTR = "overlay-hideonclick";
    var DATA_TIP_TARGET_ATTR = "overlay-tip-target";
    var DATA_TIP_POSITION_ATTR = "overlay-tip-position";

    var DEFAULT_TIP_OFFSET = 10;
    var DEFAULT_TIP_COLOR = "#FFFFFF";
    var DEFAULT_TIP_POSITION = "north";

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

        $.proxyAll(this, "show", "hide", "destroy", "isShowing", "setHideOnClick", "addTip", "setCenterContent", "_render", "_clickHandler");

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
        this._$overlay.on("click", CLOSE_OVERLAY_CLASS, function(e) {
            e.preventDefault();

            // Defer to the next tick of the event loop. It makes it more useful
            // to apply this class without having to worry if the close handler will
            // run before any other handlers.
            setTimeout(function() {
                me.hide();
            }, 0);
        });
    }

    // returns true iff the overlay is currently showing
    TutorialOverlay.prototype.isShowing = function() {
        return this._$overlay && this._$overlay.is(":visible");
    };

    // shows the overlay
    TutorialOverlay.prototype.show = function() {
        if (!this.isShowing()) {
            this._ensureVeil();
            this._ensureCanvas();

            var $win = $(window);
            this._$overlay.width($win.width());
            this._$overlay.height($win.height());
            this._render();
            this._$overlay.show();
        }
    };

    // hides the overlay
    TutorialOverlay.prototype.hide = function() {
        this._$overlay.hide();
        if (this.settings.destroyOnClose) {
            this.destroy();
            this._destroyed = true;
        }
    };

    TutorialOverlay.prototype.destroy = function() {
        this._$overlay.empty();
        this._$overlay.remove();
    };

    // set the hide-on-click behavior
    TutorialOverlay.prototype.setHideOnClick = function(hideOnClick) {
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
    TutorialOverlay.prototype.addTip = function(newTip) {
        this._tips.push({
            target: newTip.target,
            content: newTip.content,
            relativePos: newTip.position,
            color: newTip.color,
            offset: newTip.offset,
        });
    };

    // set the content to be displayed in the center of the overlay
    TutorialOverlay.prototype.setCenterContent = function(newCenterContent) {
        //TODO: repaint
        this._centerContent = newCenterContent;
    };

    /*
     * Ensure that a 'veil' element exists in the overlay.  This is necessary to support older IE where transparency isn't supported.
     * The 'veil' will be translucent and capture click events.  All other elements in the overlay should be rendered on top of it.
     */
    TutorialOverlay.prototype._ensureVeil = function() {
        if (!this._$veil) {
            var $veil = this._$overlay.find(VEIL_CLASS);
            if (!$veil.length) {
                //create and add a veil div
                $veil = $("<div class=" + VEIL_CLASS.substring(1) + "></div>");
                this._$overlay.prepend($veil);

                //if (this.hideOnClick) {
                //    $veil.on("click", this._clickHandler);
                //}
            }
        }
        this._$veil = $veil;
    };

    TutorialOverlay.prototype._ensureCanvas = function() {
        if (!this._$canvas) {
            var $canvas = this._$overlay.find("canvas.veil-canvas");
            if (!$canvas.length) {
                $canvas = $("<canvas width='1024' height='1024' class='veil-canvas'></canvas>");
                this._$overlay.append($canvas);
                if (typeof(G_vmlCanvasManager) != "undefined") {
                    G_vmlCanvasManager.initElement($canvas[0]);
                }
                //if (this.hideOnClick) {
                //    $canvas.on("click", this._clickHandler);
                //}
            }
        }
        this._$canvas = $canvas;
    };

    TutorialOverlay.prototype._initializeTips = function() {
        if (this._$overlay) {
            //find tips in DOM
            var domTips = this._$overlay.find(TIP_CLASS);
            var tips = this._tips;
            $.each(domTips, function() {
                var $tipEl = $(this);
                tips.push({
                    target: $tipEl.data(DATA_TIP_TARGET_ATTR),
                    relativePos: $tipEl.data(DATA_TIP_POSITION_ATTR),
                    content: this,
                    color: $tipEl.data("overlay-tip-color"),
                    offset: $tipEl.data("overlay-tip-offset"),
                });
            });
        }
    };

    TutorialOverlay.prototype._render = function() {
        var me = this;

        var context = this._$canvas[0].getContext("2d");
        //Ensure canvas fills the entire window
        var $win = $(window);
        context.canvas.width = $win.width();
        context.canvas.height = $win.height();

        //TODO: If tip targets need to be highlighted via cutting of the veil:
        //      1) use fillRect to paint the translucent veil on the canvas INSTEAD OF CSS background-color on the overlay component
        //      2) cut holes in the veil by filling the bounding box of the target in the canvas with 'destination-out' compositing.
        //Fill the entire canvas with a translucent veil.
        //context.fillStyle = "rgba(0, 0, 0, 0.6)";
        //context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        //Center content
        //Draw content

        //For each tip:
        //  position tip relative to target
        //  add tip content at absolute position
        $.each(this._tips, function() {
            //calculate the position of the tip

            var $tipTarget = $(this.target);
            if (!this.$tip) {
                this.$tip = $(this.content);
            }
            var $tipContent = this.$tip;
            if (!$tipTarget.length) {
                //Don't show the tip if we can't find the target.
                $tipContent.hide();
                return;
            }

            var targetRect = $tipTarget.clientRect();

            var positionStr = this.relativePos;
            if (!positionStr) {
                positionStr = DEFAULT_TIP_POSITION;
            }
            var pos = me._decodePosition(positionStr);
            var offset = this.offset;
            if (!offset) {
                offset = DEFAULT_TIP_OFFSET;
            }

            var startPt = {},
                endPt = {},
                controlPt = {},
                tipLocation = {};

            //TODO: Fix the positioning code
            if (pos.above) {
                //north
                startPt.y = targetRect.top - offset;
                endPt.y = targetRect.top;
                tipLocation.y = startPt.y - $tipContent.height();
            } else if (pos.verticalCenter) {
                //center
                startPt.y = targetRect.top + (targetRect.height / 2);
                endPt.y = startPt.y;
                tipLocation.y = targetRect.top;
            } else {
                //south
                startPt.y = targetRect.bottom + offset;
                endPt.y = targetRect.bottom;
                tipLocation.y = startPt.y;
            }
            if (pos.right) {
                //east
                startPt.x = targetRect.right + offset;
                endPt.x = targetRect.right;
                tipLocation.x = startPt.x;
            } else if (pos.horizontalCenter) {
                //center
                startPt.x = targetRect.left + (targetRect.width / 2);
                endPt.x = startPt.x;
                tipLocation.x = targetRect.left;
            } else {
                //west
                startPt.x = targetRect.left - offset;
                endPt.x = targetRect.left;
                tipLocation.x = startPt.x - $tipContent.width();
            }
            controlPt.x = (startPt.x + endPt.x) / 2;
            controlPt.y = (startPt.y + endPt.y) / 2;

            //draw the tip
            context.beginPath();
            context.moveTo(startPt.x, startPt.y);
            context.quadraticCurveTo(controlPt.x, controlPt.y, endPt.x, endPt.y);
            var color = this.color;
            if (!color) {
                color = DEFAULT_TIP_COLOR;
            }
            context.strokeType = color;
            context.stroke();

            $tipContent.css({
                position: "absolute",
                top: tipLocation.y + "px",
                left: tipLocation.x + "px"
            }).show();
            if (!$.contains(me._$overlay[0], $tipContent[0])) {
                me._$overlay.append($tipContent);
            }
        });
    };

    TutorialOverlay.prototype._clickHandler = function(e) {
        //Ignore clicks in the centerContent element and its descendants.
        //  TODO: there has to be a better way to do this.
        if (!(this._centerContent && $.contains(this._centerContent[0], e.target))) {
            this.hide();
        }
    };

    TutorialOverlay.prototype._decodePosition = function(positionStr) {
        var posObj = {
            verticalCenter: true,
            horizontalCenter: true
        };
        var pos = positionStr.match(/north|east|south|west/gi);
        if (pos) {
            pos = pos.slice(Math.max(pos.length - 2, 0));
            $.each(pos, function() {
                switch (this.toString()) {
                    case "north":
                    case "top":
                        posObj.above = true;
                        posObj.verticalCenter = false;
                        break;

                    case "south":
                    case "bottom":
                        posObj.above = false;
                        posObj.verticalCenter = false;
                        break;

                    case "east":
                    case "right":
                        posObj.right = true;
                        posObj.horizontalCenter = false;
                        break;

                    case "west":
                    case "left":
                        posObj.right = false;
                        posObj.horizontalCenter = false;
                        break;
                }
            });
        }
        return posObj;
    };

    //Takes a settings object and calculates derived settings.
    //Settings go in order:

    // 1. default value
    // 2. settings passed
    var ensureSettings = function(explicitSettings) {
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

    // Public sub-namespace for modal dialogs.
    $.tutorialOverlay = $.tutorialOverlay || {};

    // Creates a new dialog from the specified settings.
    $.tutorialOverlay.create = function(settings) {
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

    $.fn.tutorialOverlayInstance = function(overlay) {
        return !overlay ? this.data(JQUERY_DATA_KEY) : this.data(JQUERY_DATA_KEY, overlay);
    };

    // Idiomatic jQuery interface for tutorial overlays.
    $.fn.tutorialOverlay = function(settings) {
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