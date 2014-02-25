/**
 * @fileOverview Tutorial Overlay
 * @author Tex Clayton
 * @version 1.3
 */

 /* globals G_vmlCanvasManager */

(function ($) {
    // var OVERLAY_CLASS = ".tutorial-overlay";
    var VEIL_CLASS = ".tutorial-overlay-veil";
    var CANVAS_CLASS = ".tutorial-overlay-canvas";
    var TIP_CLASS = ".tutorial-overlay-tip";
    var CONTENT_CLASS = ".tutorial-overlay-content";
    var CLOSE_OVERLAY_CLASS = ".close-overlay";

    // var DATA_AUTOLOAD_ATTR = "data-overlay-autoload";
    // var DATA_ZINDEX_ATTR = "data-overlay-zindex";
    // var DATA_HIDE_ON_CLICK_ATTR = "overlay-hideonclick";

    // Public sub-namespace for tutorial overlays.
    $.tutorialOverlay = $.tutorialOverlay || {};

    /**
     * Default values for Tutorial Overlay settings.
     * @constant
     **/
    $.tutorialOverlay.defaults = {
        zIndex: 10000, // Allow callers to participate in zIndex arms races
        //destroyOnClose: false, // If true, the overlay DOM will be destroyed and all events removed when the overlay closes
        hideOnClick: true,
        autoLoad: false
    };

    /**
     * Takes a settings object and calculates derived settings.
     * Settings go in order:
     *
     * 1. default value
     * 2. settings passed
     *
     * @private
     * @param {object} explicitSettings the settings specified by the consumer
     * @returns {object} the calculated Tutorial Overlay settings
     **/
    //TODO: Move all .getSettings related code into a new class.
    var _ensureSettings = function (explicitSettings) {
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

    /**
     * Creates a new Tutorial Overlay from the specified settings.
     * @param {object} settings the settings to use when creating the Tutorial Overlay
     * @returns {TutorialOverlay} a new Tutorial Overlay
     **/
    $.tutorialOverlay.create = function (settings) {
        settings = _ensureSettings(settings);

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


    /**
     * The data key to use to store the Tutorial Overlay instance.
     * @private
     * @constant
     **/
    var JQUERY_DATA_KEY = "tutorialOverlay";

    /**
     * Get/Set the Tutorial Overlay instance for the specified element.
     * If no parameter is specified, then it will not change the data.
     * @param {TutorialOverlay} [overlay] the Tutorial Overlay to be associated with this element
     * @returns {TutorialOverlay} the Tutorial Overlay associated with this element, or null if none
     **/
    $.fn.tutorialOverlayInstance = function (overlay) {
        return !overlay ? this.data(JQUERY_DATA_KEY) : this.data(JQUERY_DATA_KEY, overlay);
    };

    /**
     * Idiomatic jQuery interface for tutorial overlays.
     * When passed a string, the specified method will be invoked on the associated Tutorial Overlay.
     * Otherwise, it will create a new Tutorial Overlay.
     * @param {object} [settings] the settings to use when creating the Tutorial Overlay
     * @returns the jQuery object this function was invoked on
     **/
    $.fn.tutorialOverlay = function (settings) {
        var result = this; //return this jQuery object by default, to enable chaining
        var overlay;

        // If the first argument is a string, it is a method name to call on the overlay
        // associated with the DOM element.
        if (typeof settings == "string") {
            var action = settings;
            overlay = this.tutorialOverlayInstance();
            if (overlay && overlay[action]) {
                var actionResult = overlay[action].apply(overlay, Array.prototype.slice.apply(arguments).slice(1));
                if (typeof (actionResult) !== "undefined") {
                    result = actionResult;
                }
            }
        }
        // Otherwise, create a new overlay.
        else {
            settings = settings || {};
            settings.overlay = this[0];

            overlay = $.tutorialOverlay.create(settings);

            overlay.show();
        }

        return result;
    };

    /**
     * A Tutorial Overlay
     * @constructor
     * @param {object} settings the settings used to initialize this Tutorial Overlay.
     **/
    function TutorialOverlay(settings) {
        /**
         * Flag to indicate whether or not to hide the overlay when the user clicks on it.
         * @private
         **/
        var _hideOnClick = $.tutorialOverlay.defaults.hideOnClick;

        // returns true iff the overlay is currently showing
        this.isShowing = function () {
            return this._$overlay && this._$overlay.is(":visible");
        };

        /**
         * Show the overlay.
         **/
        this.show = function () {
            if (!this.isShowing()) {
                this._ensureVeil();
                this._ensureCanvas();

                this.render();
                $(window).on("resize", $.proxy(_windowResized, this));
                _attachCloseClassHandler(this._$overlay);
                this._$overlay.show();
            }
        };

        /**
         * Hide the overlay.
         * Will remove the overlay element if destroyOnClose is true.
         **/
        this.hide = function () {
            this._$overlay.hide();
            $(window).off("resize", _windowResized);
            _detachCloseClassHander(this._$overlay);
            if (this.settings.destroyOnClose) {
                this.destroy();
            }
        };

        /**
         * Remove the overlay element from the DOM and unbind all event handlers.
         **/
        this.destroy = function () {
            this._$overlay.empty();
            this._$overlay.remove();
        };

        /**
         * Set the hide-on-click behavior.
         * @param {boolean} hideOnClick If true, the Overlay will hide when the user clicks on it.
         **/
        this.setHideOnClick = function (hideOnClick) {
            _hideOnClick = hideOnClick;

            this._$overlay.off("click", _clickHandler);

            if (_hideOnClick) {
                this._$overlay.on("click", $.proxy(_clickHandler, this));
            }
        };

        /**
         * Add a new Tip to the Tutorial Overlay.
         * @param {object} newTip The options to use when creating the new Tip.  Should contain the following properties:
         *    content
         *    target
         *    relative position (optional)
         *    color (optional)
         *    offset (optional)
         */
        this.addTip = function (newTip) {
            var options = $.extend({}, newTip);
            if (options.position && !options.direction) {
                options.direction = options.position;
                delete options.position;
            }
            this._tips.push($.tutorialOverlay.createTip(options));
        };

        /**
         * Set the content to be displayed in the center of the overlay.
         * @param {string|object} newCenterContent The jQuery object or selector to use as the center content in the Tutorial Overlay.
         **/
        this.setCenterContent = function (newCenterContent) {
            this._$centerContent = $(newCenterContent);
        };

        /**
         * Layout and render the Tutorial Overlay and all of its contents.
         **/
        this.render = function () {
            var me = this;

            var context = this._$canvas[0].getContext("2d");
            //Ensure canvas fills the entire window

            var $window = $(window);
            var windowSize = {
                width: $window.width(),
                height: $window.height()
            };
            context.canvas.width = context.canvas.clientWidth || windowSize.width;
            context.canvas.height = context.canvas.clientHeight || windowSize.height;

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
                var $tip = this.getTipEl();
                //tip may have been hidden at other screen widths - make sure it is available now to get a valid calculated size
                $tip.css({
                    visibility: "hidden",
                    display: ""
                });
                if (!$.contains(me._$overlay[0], $tip[0])) {
                    me._$overlay.append($tip);
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
                tipBounds[this.tipBoundsIndex] = this.getTipBounds();
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
            //Center content
            if (this._$centerContent) {
                //Add the centerContent bounding box to the list of occupiedRects
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
            var tipRect;
            $.each(this._tips, function () {
                tipRect = tipBounds[this.tipBoundsIndex];
                this.render(
                    tipRect ? $.extend({}, tipRect) : tipRect,
                    context, {
                        width: windowSize.width,
                        height: windowSize.height
                    },
                    occupiedRects
                );
            });

            // 5) Show the overlay
            this._$overlay.show();
        };

        /**
         * Ensure that a 'veil' element exists in the overlay.  This is necessary to support older IE where transparency isn't supported.
         * The 'veil' will be translucent and capture click events.  All other elements in the overlay should be rendered on top of it.
         * @private
         **/
        this._ensureVeil = function () {
            if (!this._$veil) {
                var $veil = this._$overlay.find(VEIL_CLASS);
                if (!$veil.length) {
                    //create and add a veil div
                    $veil = $("<div class='" + VEIL_CLASS.substring(1) + "''></div>");
                    this._$overlay.prepend($veil);

                    //if (_hideOnClick) {
                    //    $veil.on("click", $.proxy(_clickHandler, this));
                    //}
                }
                this._$veil = $veil;
            }
        };

        /**
         * Ensure that a 'canvas' element exists in the overlay.  The tip arrows will be drawn on this canvas.
         * @private
         **/
        this._ensureCanvas = function () {
            if (!this._$canvas) {
                var $canvas = this._$overlay.find("canvas" + CANVAS_CLASS);
                if (!$canvas.length) {
                    var overlaySize = _getOverlaySize();
                    $canvas = $("<canvas width='" + (overlaySize.width || 1024) + "' height='" + (overlaySize.height || 1024) + "' class='" + CANVAS_CLASS.substring(1) + "'></canvas>");
                    this._$overlay.append($canvas);
                    if (typeof (G_vmlCanvasManager) != "undefined") {
                        G_vmlCanvasManager.initElement($canvas[0]);
                    }
                    //if (_hideOnClick) {
                    //    $canvas.on("click", $.proxy(_clickHandler, this));
                    //}
                }
                this._$canvas = $canvas;
            }
        };

        /**
         * Initialize the list of Tips from the DOM.
         * @private
         **/
        this._initializeTips = function () {
            if (this._$overlay) {
                //find tips in DOM
                var tips = this._tips;
                this._$overlay.find(TIP_CLASS).each(function () {
                    tips.push($(this).tutorialOverlayTip());
                });
            }
        };

        /**
         * Handle clicks on the Tutorial Overlay.  Hide the overlay if hideOnClose is true.
         * @private
         **/
        var _clickHandler = function (e) {
            //Ignore clicks in the centerContent element and its descendants.
            //  TODO: there has to be a better way to do this.
            if (_hideOnClick && !(this._$centerContent && $.contains(this._$centerContent[0], e.target))) {
                this.hide();
            }
        };

        /**
         * Handle window resize events.  Force the Overlay to be re-laid out and rendered.
         * @private
         **/
        var timeout;
        var _windowResized = function () {
            //Debounce the resize event with a timeout.
            if (timeout) {
                clearTimeout(timeout);
            }
            timeout = setTimeout(this.render, 50);
        };

        /**
         * Attach a click handler to all elements in the Overlay with the close-overlay class.  This handler will hide the overlay.
         * @private
         **/
        var _attachCloseClassHandler = function ($overlay) {
            _detachCloseClassHander($overlay); //prevent duplicates
            $overlay.on("click", CLOSE_OVERLAY_CLASS, function (e) {
                e.preventDefault();

                // Defer to the next tick of the event loop. It makes it more useful
                // to apply this class without having to worry if the close handler will
                // run before any other handlers.
                setTimeout(function () {
                    $overlay.tutorialOverlayInstance().hide();
                }, 0);
            });
        };

        /**
         * Detach the click handler from all elements in the Overlay with the close-overlay class.
         * @private
         **/
        var _detachCloseClassHander = function ($overlay) {
            $overlay.off("click", CLOSE_OVERLAY_CLASS);
        };

        /**
         * Get the width and height of the overlay.
         * @private
         **/
        var _getOverlaySize = function () {
            var $document = $(document);

            return {
                width: $document.width(),
                height: $document.height()
            };
        };

        /// TutorialOverlay constructor ///

        $.proxyAll(this, "show", "hide", "destroy", "isShowing", "setHideOnClick", "addTip", "setCenterContent", "render");

        if (!settings) {
            settings = {};
        }
        this.settings = settings;

        this._tips = [];

        this._$overlay = settings.overlay;
        this._$overlay.css("z-index", settings.zIndex);

        var centerContent = this._$overlay.find(CONTENT_CLASS);
        if (centerContent.length) {
            this.setCenterContent(centerContent);
        }

        this._initializeTips();

        this.setHideOnClick(((settings.hideOnClick !== undefined) && !settings.hideOnClick) ? settings.hideOnClick : $.tutorialOverlay.defaults.hideOnClick);
    }
})(jQuery);