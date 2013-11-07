/// <reference path="../dependencies/jquery.transit.js" />
/// <reference path="jquery.queryString.js" />
/// <reference path="jquery.postMessage.js" />
/// <reference path="jquery.customEvent.js" />
/// <reference path="jquery.clientRect.js" />
/// <reference path="jquery.hostIframe.js" />
/// <reference path="jquery.proxyAll.js" />
/// <reference path="jquery.disableEvent.js" />
/// <reference path="jquery.partialLoad.js" />
/// <reference path="jquery.pointerEvents.js" />

(function($)
{
    $.modalDialog = $.modalDialog || {};

    var _ua = $.modalDialog._ua = (function() 
    {
        var ua = navigator.userAgent;
        
        // Internet Explorer 7 specific checks
        if (ua.indexOf("MSIE 7.0") > 0) 
        {
            return {ie: true, ie7: true, version: 7, compat: ua.indexOf("compatible") > 0};
        }

        // Internet Explorer 8 specific checks
        if (ua.indexOf("MSIE 8.0") > 0) 
        {
            return {ie: true, ie8: true, version: 8, compat: ua.indexOf("compatible") > 0};
        }

        return {};
    })();

    var _isSmallScreenOverride;

    $.modalDialog.setSmallScreen = function(isSmallScreen)
    {
        _isSmallScreenOverride = isSmallScreen;
    };

    // Returns true if we're on a small screen device like a smartphone.
    // Dialogs behave slightly different on small screens, by convention.
    $.modalDialog.isSmallScreen = function()
    {
        if (typeof(_isSmallScreenOverride) != "undefined")
        {
            return _isSmallScreenOverride;
        }

        // Detect Internet Explorer 7/8, force them to desktop mode
        if (_ua.ie7 || _ua.ie8) 
        {
            return false;
        }

        var width = $(window).width();
        return (typeof window.orientation == "number" ? Math.min(width, $(window).height()) : width) <= 480;
    };

})(jQuery);
// Support reading settings from a node dialog's element

// Minimal polyfill for Object.keys
// <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys>
if (!Object.keys) 
{
    Object.keys = function(obj) 
    {
        var keys = [];
        for (var key in obj) 
        {
            if (obj.hasOwnProperty(key)) 
            {
                keys[keys.length] = key;
            }
        }
        return keys;
    };
}

(function($)
{
    var ATTR_PREFIX = "data-dialog-";

    var parseNone = function(s)
    {
        return s || null;
    };

    var parseBool = function(s)
    {
        if (s)
        {
            s = s.toString().toLowerCase();
            switch (s)
            {
                case "true":
                case "yes":
                case "1":
                    return true;
                default:
                    break;
            }
        }

        return false;
    };

    var parseFunction = function(body)
    {
        // Evil is necessary to turn inline HTML handlers into functions
        /* jshint evil: true */

        if (!body) 
        {
            return null;
        }

        return new Function("event", body);
    };
    
    // The properties to copy from HTML data-dialog-* attributes
    // to the dialog settings object
    var _props = 
    {
        "title": parseNone,         
        "onopen": parseFunction,
        "onbeforeopen": parseFunction,         
        "onclose": parseFunction,        
        "onbeforeclose": parseFunction,        
        "maxWidth": parseInt,   
        "initialHeight": parseInt,    
        "ajax": parseBool,  
        "onajaxerror": parseFunction,
        "destroyOnClose": parseBool,     
        "skin": parseNone,
        "enableHistory": parseBool,
        "zIndex": parseInt
    };

    $.modalDialog = $.modalDialog || {};

    // Copies the HTML data-dialog-* attributes to the settings object
    $.modalDialog.getSettings = function($el)
    {
        var settings = {};

        $.each(Object.keys(_props), function(i, key) 
        {
            // $.fn.attr is case insensitive
            var value = $el.attr(ATTR_PREFIX + key);
            if (typeof value != "undefined")
            {
                var parser = _props[key];
                settings[key] = parser(value);
            }
        });

        return settings;
    };

})(jQuery);
// TODO what to do with preventEventBubbling?

(function ($)
{
    if ($.modalDialog && $.modalDialog._isContent)
    {
        throw new Error("Attempt to load jquery.modalDialogContent.js in the same window as jquery.modalDialog.js.");
    }

    var MARGIN = 10; // @see MARGIN in jquery.modalDialog.less
    var STARTING_TOP = "-700px";

    // A stack of dialogs in display order
    var _dialogStack = [];

    // A map of dialogs by full ID
    var _fullIdMap = {};

    // Default values
    $.modalDialog.defaults = {
        zIndex: 10000, // Allow callers to participate in zIndex arms races
        title: "", // The title to display in the title bar of the dialog
        maxWidth: 600, // Sets the maximum width of the dialog. Note that on small mobile devices, the actual width may be smaller, so you should design the dialog content accordingly
        initialHeight: 100, // Only IFrameDialog uses this. Consider this internal for now.
        skin: "primary", // The name of the skin to use for the dialog
        ajax: false, // Determines how the url setting is interpreted. If true, the URL is the source for an AJAX dialog. If false, it will be the URL of an IFrame dialog
        url: null, // The URL for the content of an IFrame or AJAX dialog
        content: null, // A CSS selector or jQuery object for a content node to use for a node dialog
        destroyOnClose: false, // If true, the dialog DOM will be destroyed and all events removed when the dialog closes
        containerElement: "body", // A CSS selector or jQuery object for the element that should be the parent for the dialog DOM (useful for working with jQuery mobile)
        preventEventBubbling: true, // If true, click and touch events are prevented from bubbling up to the document
        enableHistory: true, // If the history module is enabled, this can be used to disable history if set false
        onopen: null,
        onclose: null,
        onbeforeopen: null,
        onbeforeclose: null,
        onajaxerror: null
    };

    // If the jquery.transit library is loaded, use CSS3 transitions instead of jQuery.animate()
    var _animateMethod = $.fn.transition ? "transition" : "animate";
    var _easing = $.fn.transition ? "out" : "swing";

    var _ua = $.modalDialog._ua;

    $.modalDialog.iframeLoadTimeout = 0;
    $.modalDialog.animationDuration = 600;

    // Class which creates a jQuery mobile dialog
    var ModalDialog = function(settings)
    {
        this.settings = settings;
        this.parent = $(this.settings.containerElement || "body");

        // Creates event objects on the dialog and copies handlers from settings
        $.each(["open", "beforeopen", "close", "beforeclose", "ajaxerror"], $.proxy(this._setupCustomEvent, this));

        // Bind methods called as handlers so "this" works
        $.proxyAll(this, "_drag", "_startDrag", "_stopDrag", "_close", "_keydownHandler");
    };

    ModalDialog.prototype.dialogType = "node";

    // Creates a custom event on this object with the specified event name
    ModalDialog.prototype._setupCustomEvent = function(i, eventName)
    {
        var onEvent = "on" + eventName;
        var evt = $.CustomEvent.create(this, eventName);

        var handler = this.settings[onEvent];
        if (handler)
        {
            evt.add(handler);
        }

        return evt;
    };

    ModalDialog.prototype._initDeferred = function(action, deferred)
    {
        this._deferreds = this._deferreds || {};
        deferred = deferred || new $.Deferred();
        this._deferreds[action] = deferred;
        return deferred;
    };

    ModalDialog.prototype._completeDeferred = function(action, resolution, args)
    {
        var deferred = this._deferreds[action];
        if (deferred)
        {
            deferred[resolution + "With"](this, args);
            //this._deferreds[action] = null;

            return deferred;
        }

        throw new Error("No deferred initialized for action '" + action + "'");
    };

    ModalDialog.prototype._resolveDeferred = function(action, args)
    {
        return this._completeDeferred(action, "resolve", args);
    };

    ModalDialog.prototype._rejectDeferred = function(action, args)
    {
        return this._completeDeferred(action, "reject", args);
    };

    ModalDialog.prototype._clearDeferred = function(action)
    {
        this._deferreds[action] = null;
    };

    ModalDialog.prototype._getDeferred = function(action)
    {
        return this._deferreds[action];
    };

    ModalDialog.prototype._isDeferredComplete = function(action)
    {
        var deferred = this._getDeferred(action);
        return !deferred || deferred.state() != "pending";
    };

    ModalDialog.prototype.isOpen = function()
    {
        return !!this._open;
    };

    // Opens the dialog
    ModalDialog.prototype.open = function()
    {
        var deferred = this._initDeferred("open", deferred);

        // Ensure the dialog doesn't open once its already opened.. 
        // Otherwise, you could end up pushing it on to the stack more than once.
        if (this._open)
        {
            return this._rejectDeferred("open");
        }

        // Description
        this.level = _dialogStack.length;

        // Fire onbeforeopen on this instance
        var evt = this.onbeforeopen.fire();
        if (evt.isDefaultPrevented())
        {
            return this._rejectDeferred("open");
        }

        // Fire onbeforeopen globally
        evt = $.modalDialog.onbeforeopen.fire(null, this);
        if (evt.isDefaultPrevented())
        {
            return this._rejectDeferred("open");
        }

        // Keep track of the dialog stacking order
        _dialogStack.push(this);

        if (this.level > 0)
        {
            this.settings.parentId = _dialogStack[this.level-1].settings._fullId;
        }

        this._open = true;

        this._build();

        // add or remove the 'smallscreen' class (which can also be checked using CSS media queries)
        this.$container[$.modalDialog.isSmallScreen() ? "addClass" : "removeClass" ]("smallscreen");

        // Stop any animations on the container
        this.$container.stop(true, true);

        this.$el.show();

        this._showLoadingIndicator();

        $(document).on("keydown", this._keydownHandler);

        this._finishOpenAction = function()
        {
            if (deferred.state() != "rejected")
            {
                this.$bg.addClass($.modalDialog.veilClass);

                // Set the width first so that heights can be calculated based
                // on the layout for that width.
                var widthData = this._getDefaultWidthData();
                this.$container.css({ width: widthData.width });

                var initialPos = this._getDefaultPosition();
                var initialTop = initialPos.top;
                initialPos.top = STARTING_TOP; // we're going to animate this to slide down
                this.$container.css(initialPos);

                var animationCallback = $.proxy(function()
                {
                    try
                    {
                        this.$el.addClass("dialog-visible");

                        if ($.modalDialog.isSmallScreen())
                        {
                            // TODO: I question this change. Should it be decoupled from the dialog framework?
                            // It could be put into mobile fixes.
                            // Is this even mobile specific?
                            // Original comment:
                            // Force dialogs that are on small screens to trigger a window resize event when closed, just in case we have resized since the dialog opened.

                            this.triggerWindowResize = false;
                            this._orientationchange = $.proxy(function(event) 
                                {
                                    this.triggerWindowResize = true;
                                    return this.pos(event);
                                }, 
                                this);

                            $(window).on("orientationchange resize", this._orientationchange);
                        }

                        this.onopen.fire();

                        $.modalDialog.onopen.fire(null, this);

                        this._resolveDeferred("open");
                    }
                    catch (ex)
                    {
                        this._rejectDeferred("open", ex);
                    }

                    this._clearDeferred("open");

                }, this);

                // Animate with a CSS transition if possible,
                // otherwise, fallback on a jquery animation
                this.$container[_animateMethod]({ top: initialTop }, $.modalDialog.animationDuration, _easing)
                    .promise()
                    .then(animationCallback, animationCallback);
            }
            else
            {
                this._clearDeferred("open");
            }

            this._hideLoadingIndicator();
        };

        this._finishOpen();

        return deferred.promise();
    };

    ModalDialog.prototype._finishOpen = function()
    {
        if (this._finishOpenAction)
        {
            try
            {
                this._finishOpenAction();
            }
            catch (ex)
            {
                this._rejectDeferred("open", ex);
                this._clearDeferred("open");
            }

            this._finishOpenAction = null;
        }
    };

    // If a user hits the ESC key, close the dialog or cancel it's opening.
    ModalDialog.prototype._keydownHandler = function(e)
    {
        if (e.keyCode == 27)
        {
            if ($.modalDialog.getCurrent() === this)
            {
                this.cancel();
            }
        }
    };

    ModalDialog.prototype.cancel = function()
    {
        // Don't move to the end state of the animation:
        // stop it right where it is.
        if (this.$container)
        {
            this.$container.stop(true, false);
        }
        
        if (this.isOpen())
        {
            this.close();
        }
    };

    ModalDialog.prototype._showLoadingIndicator = function()
    {
        if (!this.$loadingIndicator)
        {
            this.$loadingIndicator = $("<div class='dialog-loading-indicator'><span></span></div>")
                .appendTo(this.$bg);
                //.css("z-index", parseInt(this.$bg.css("z-index"), 10) + 1);
        }
    };

    ModalDialog.prototype._hideLoadingIndicator = function()
    {
        this.$loadingIndicator.remove();
        this.$loadingIndicator = null;
    };

    ModalDialog.prototype._popDialogStack = function()
    {
        if ($.modalDialog.getCurrent() === this)
        {
            _dialogStack.pop();
        }
    };

    // Closes the dialog. 
    // isDialogCloseButton Indicates the cancel button in the dialog's header was clicked.
    ModalDialog.prototype.close = function(isDialogCloseButton)
    {
        var deferred = this._initDeferred("close", deferred);

        if ($.modalDialog.getCurrent() !== this)
        {
            throw new Error("Can't close a dialog that isn't currently displayed on top.");
        }

        var eventSettings = { isDialogCloseButton: !!isDialogCloseButton };

        // Expose an event allowing consumers to cancel the close event
        if (this.onbeforeclose.fire(eventSettings).isDefaultPrevented())
        {
            return this._rejectDeferred("close");
        }

        // Expose a global event
        if ($.modalDialog.onbeforeclose.fire(eventSettings, this).isDefaultPrevented())
        {
            return this._rejectDeferred("close");
        }

        this._popDialogStack();

        $(document).off("keydown", this._keydownHandler);

        this.$el.removeClass("dialog-visible");
        this.$container[_animateMethod](
                {top: STARTING_TOP},
                $.modalDialog.animationDuration,
                _easing
            )
            .promise()
            .then(
                $.proxy(function()
                {
                    try
                    {
                        this._finishClose(eventSettings);
                    }
                    catch (ex)
                    {
                        this._rejectDeferred("close", ex);
                        this._clearDeferred("close");
                    }
                }, this), 
                $.proxy(function(ex)
                {
                    this._rejectDeferred("close", ex);
                    this._clearDeferred("close");
                }, this));

        // unbind global event listeners
        if (this._orientationchange)
        {
            $(window).off("orientationchange resize", this._orientationchange);
        }

        return deferred.promise();
    };

    ModalDialog.prototype._close = function(e)
    {
        e.preventDefault();
        this.close(true);
    };

    ModalDialog.prototype._reset = function()
    {
        this._open = false;

        this.$container.stop(true, true);
        this.$container.css({ top: STARTING_TOP });
        this.$bg.removeClass($.modalDialog.veilClass);
        this.$el.hide();
    };

    ModalDialog.prototype._resetFailed = function()
    {
        this._reset();
        this._popDialogStack();
    };

    ModalDialog.prototype._finishClose = function(e)
    {
        this._reset();

        if (this.settings.destroyOnClose)
        {
            this._destroy();
            this._destroyed = true;
            delete _fullIdMap[this.settings._fullId];
        }

        if ($.modalDialog.isSmallScreen() && this.triggerWindowResize)
        {
            $(window).trigger("resize");
        }

        // Fire events on a timeout so that the event loop
        // has a chance to process DOM changes. 
        // Without this, close handlers can't re-open the same iframe dialog:
        // the iframe isn't recognized as a new element.
        setTimeout(
            $.proxy(function()
            {
                this.onclose.fire(e);

                $.modalDialog.onclose.fire(e, this);

                this._resolveDeferred("close");
            }, this), 
            0);
    };

    ModalDialog.prototype._destroy = function()
    {
        // Put the content node back on the body.
        // It could be used again.
        this.$content.detach().appendTo("body");
        this.$el.remove();
    };

    ModalDialog.prototype._updateZIndexes = function()
    {
        var zIndex = this.settings.zIndex;
        var parent = this.getParent();
        if (parent)
        {
            zIndex = Math.max(parent.settings.zIndex + 10, zIndex);
        }

        this.$bg.css("z-index", zIndex);
        zIndex += 2;
        this.$container.css("z-index", zIndex);
    };

    // Builds the DOM for the dialog chrome
    ModalDialog.prototype._build = function()
    {
        /*jshint quotmark:false*/

        if (this._destroyed)
        {
            throw new Error("This dialog has been destroyed");
        }

        if (!this.$el)
        {
            this.$bg = $('<div class="dialog-background"></div>');

            this.$container = $(
                '<div class="dialog-container" id="' + this.settings._fullId + 'Container">' +
                '  <div class="dialog-header">' +
                '    <a href="#" class="dialog-close-button"><span class="dialog-close-button-icon"></span></a>' +
                '    <h1>' + this.settings.title + '</h1>' +
                '  </div>'+
                '  <div class="dialog-content-container">' +
                '  </div>' +
                '</div>'
            );

            this.$el = $([this.$bg[0], this.$container[0]]).addClass("dialog-skin-" + this.settings.skin);

            // HACK: Support jQuery mobile. In jQuery mobile, the root element needs to be specific.
            // TODO: Move this to a jQuery mobile fixes specific module
            this.parent.append(this.$bg, this.$container);

            if (!this.parent.is("body") && !this.parent.hasClass("ui-page-active")) {
                this.$bg.css("position", "absolute");

                if (this.parent.css("position") == "static") {
                    this.parent.css("position", "relative");
                }
            }

            this.$contentContainer = this.$el.find(".dialog-content-container");
            this.$header = this.$el.find(".dialog-header");
            this.$closeButton = this.$el.find(".dialog-close-button").on("click", this._close);

            this._buildContent();

            this.$content.find('*[data-action="close"]').on("click", this._close);

            this.$contentContainer.append(this.$content);

            // only enable dragging if the dialog is over the entire window
            // and we are not in Internet Explorer 7, because it handles positioning oddly.
            if ((this.parent.is("body") || this.parent.hasClass("ui-page-active")) && !_ua.ie7) {
                this._makeDraggable();
            }
        }
        else
        {
            this._alreadyBuilt();
        }

        this._updateZIndexes();
    };

    // Subclasses should override to do something when a cached DOM is used
    ModalDialog.prototype._alreadyBuilt = function()
    {
        // noop
    };

    ModalDialog.prototype._getChromeHeight = function()
    {
        if (!this._chromeHeight)
        {
            this._chromeHeight = this.$container.height() - this.$content.height();
        }

        return this._chromeHeight;
    };

    ModalDialog.prototype._getDefaultWidthData = function()
    {
        var $win = $(window);
        var windowWidth = this.parent.is("body") ? (window.innerWidth || $win.width()) : this.parent.width();

        return {
            windowWidth: windowWidth,
            width: Math.min(windowWidth - (MARGIN * 2), this.settings.maxWidth)
        };
    };

    ModalDialog.prototype._getDefaultPosition = function(contentHeight)
    {
        var widthData = this._getDefaultWidthData();
        var scrollTop = $(document).scrollTop();
        
        var pos = 
        {
            width: widthData.width,
            top: scrollTop + MARGIN
        };

        pos.left = (widthData.windowWidth - pos.width) / 2;

        var isSmallScreen = $.modalDialog.isSmallScreen();

        if (_ua.ie7 || isSmallScreen) // TODO why IE7?
        {
            pos.top = MARGIN;
        }

        // For small mobile devices, always position at the top.
        // No need to consider contentHeight.
        // For larger devices, center vertically.

        if (!isSmallScreen) 
        {
            contentHeight = contentHeight || this.$content.height();

            // Get the new container height with the proposed content height
            var containerHeight = this._getChromeHeight() + contentHeight;

            var parentHeight = this.parent.is("body") ? $(window).height() : this.parent.height();
            var idealTop = ((parentHeight / 2) - (containerHeight / 2)) + scrollTop;

            pos.top = Math.max(idealTop, pos.top);
        }

        return pos;
    };

    ModalDialog.prototype._makeDraggable = function()
    {
        // Small devices shouldn't have the dialog be draggable.
        // Where you gonna drag to?

        if ($.modalDialog.isSmallScreen())
        {
            return;
        }

        this.$header.addClass("draggable").on("pointerdown", this._startDrag);
    };

    ModalDialog.prototype._startDrag = function(e)
    {
        var $target = $(e.target);

        //Don't drag if the close button is being clicked
        if ($target.is(this.$closeButton) || $target.is(this.$closeButton.children()))
        {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        this._initialMousePos = getMousePos(e);
        this._initialDialogPos = this.$container.offset();

        this.$bg.on("pointermove", this._drag);
        this.$container.on("pointermove", this._drag);

        // make sure the mouseup also works on the background
        this.$bg.on("pointerup", this._stopDrag);

        //chrome node is the last element that can handle events- it has cancel bubble set
        this.$container.on("pointerup", this._stopDrag);

        if (this.$frame)
        {
            try
            {
                this.$frame.iframeDocument().find("body")
                    .on("pointermove", this._drag)
                    .on("pointerup", this._stopDrag);
            }
            catch (ex)
            {
                // This can fail if the frame is in another domain
            }
        }

        this._parentRect = this.$el.clientRect();

        this._isDragging = true;
    };

    ModalDialog.prototype._drag = function(e)
    {
        e.preventDefault();
        e.stopPropagation();

        var mousePos = getMousePos(e);

        var deltaTop = mousePos.top - this._initialMousePos.top;
        var deltaLeft = mousePos.left - this._initialMousePos.left;

        var newPos = {
            top: this._initialDialogPos.top + deltaTop,
            left: this._initialDialogPos.left + deltaLeft
        };

        this.$container.css(newPos);
    };

    ModalDialog.prototype._stopDrag = function(e)
    {
        this._initialMousePos = null;
        this._initialDialogPos = null;

        e.stopPropagation();
        e.preventDefault();

        // Remove the drag events
        this.$bg.off("pointermove", this._drag);
        this.$container.off("pointermove", this._drag);

        this.$bg.off("pointerup", this._stopDrag);
        this.$container.off("pointerup", this._stopDrag);

        if (this.$frame)
        {
            try
            {
                this.$frame.iframeDocument().find("body")
                    .off("pointermove", this._drag)
                    .off("pointerup", this._stopDrag);
            }
            catch (ex) { }
        }

        this._isDragging = false;
    };

    // Gets the current mouse position from the event object.
    // returns an object with top and left
    var getMousePos = function(e)
    {
        var mousePos = {
            left: e.clientX,
            top: e.clientY
        };

        // Translate event positions from a nested iframe
        if (e.target.ownerDocument != window.document)
        {
            var $iframe = $(e.target.ownerDocument).hostIframe();
            if ($iframe.length > 0)
            {
                var rect = $iframe.clientRect();
                mousePos.top += rect.top;
                mousePos.left += rect.left;
            }
        }

        return mousePos;
    };

    // Builds the DOM for the content node.
    // Should be overridden by subclasses.
    ModalDialog.prototype._buildContent = function()
    {
        this.$content = $(this.settings.content);
        this.$content.detach();
    };

    // Gets a reference to the current window.
    // This will be overriden by an iframe dialog.
    ModalDialog.prototype.getWindow = function()
    {
        return window;
    };

    // Gets a reference to the dialog that opened this dialog.
    // This is null if the dialog was opened by the main window.
    ModalDialog.prototype.getParent = function()
    {
        if (this.settings.parentId)
        {
            return getDialog(this.settings.parentId);
        }

        return null;
    };

    // Sets the height of the content in pixels.
    ModalDialog.prototype.center = function()
    {
        var pos = this._getDefaultPosition();
        this.$container[_animateMethod]({ top: pos.top }, 400);
    };

    // Reposition the dialog to the correct position.
    ModalDialog.prototype.pos = function(animate)
    {
        // stop any currently running animations
        this.$container.stop(true, true);

        var pos = this._getDefaultPosition();

        if (animate === true)
        {
            var top = pos.top;
            delete pos.top;
            this.$container.css(pos)[_animateMethod]({ top: top }, 400);
        }
        else
        {
            this.$container.css(pos);
        }
    };

    // Sets the title of the dialog in the header.
    ModalDialog.prototype.setTitle = function(title)
    {
        this.$container.find(".dialog-header h1").text(title);
    };

    // Gets the title of the dialog in the header.
    ModalDialog.prototype.getTitle = function()
    {
        return this.$container.find(".dialog-header h1").text();
    };

    // Extends ModalDialog such that the content is an iframe.
    var IFrameDialog = function()
    {
        ModalDialog.apply(this, arguments);

        if (this.settings.parentId)
        {
            this._parentWindow = window.frames[this.settings.parentId];
        }
    };

    $.extend(IFrameDialog.prototype, ModalDialog.prototype);

    IFrameDialog.prototype.dialogType = "iframe";

    IFrameDialog.prototype._setupCustomEvent = function()
    {
        var evt = ModalDialog.prototype._setupCustomEvent.apply(this, arguments);
        evt.add(_crossWindowEventHandler);
    };

    // Broadcasts events to all active dialogs so any window that has a proxy for the dialog can be notified.
    var _crossWindowEventHandler = function(e)
    {
        // "this" is the dialog

        for (var i=0; i<_dialogStack.length; i++)
        {
            if (_dialogStack[i]._postCommand)
            {
                _dialogStack[i]._postCommand("event" + e.type, $.extend({ _eventDialogId: this.settings._fullId}, e.data));
            }
        }
    };

    // Override the _buildContent method to construct an iframe
    IFrameDialog.prototype._finishClose = function(e)
    {
        ModalDialog.prototype._finishClose.call(this, e);

        this.$frame.remove();
    };

    IFrameDialog.prototype._destroy = function()
    {
        this.$el.remove();
    };

    // Override the _buildContent method to construct an iframe
    IFrameDialog.prototype._buildContent = function()
    {
        /* jshint quotmark:false */

        this._iframeLoadTimer = null;

        if (this.$frame && this.$frame.length > 0)
        {
            this.$frame.remove();
        }

        this.$frame = $('<iframe src="' + this.settings.url + 
            '" name="' + this.settings._fullId + 
            '" seamless allowtransparency="true" width="100%" style="height:' + 
            this.settings.initialHeight + 'px;" class="dialog-frame" scrolling="no" frameborder="0" framespacing="0"></iframe>');

        if ($.modalDialog.iframeLoadTimeout > 0)
        {
            // When the iframe loads, even if its a failed status (i.e. 404), the load event will fire.
            // We expect that the dialog will call notifyReady(). If it doesn't, this timeout will
            // eventually fire, causing the open() promise to be rejected, and the dialog state to be cleaned up.
            this.$frame.on(
                "load", 
                $.proxy(function() 
                { 
                    // The "open" promise has already been resolved: don't continue setting a timeout.
                    if (this._isDeferredComplete("open"))
                    {
                        return;
                    }

                    // The iframe has $.modalDialog.iframeLoadTimeout milliseconds to call notifyReady() after the load event is called.
                    // Otherwise, the "open" promise will be rejected.
                    this._iframeLoadTimer = setTimeout(
                        $.proxy(function() 
                        { 
                            if (this._isDeferredComplete("open"))
                            {
                                return;
                            }

                            this.$frame.remove();
                            this._resetFailed();

                            this._rejectDeferred("open", [{ message: "iframe load timeout for url: " + this.settings.url }]);

                        }, this),
                        $.modalDialog.iframeLoadTimeout
                        );
                }, 
                this));
        }

        this.$content = this.$frame;
    };

    IFrameDialog.prototype._alreadyBuilt = function()
    {
        this._buildContent();

        // TODO Need to somehow notify the dialog content that it should fire notifyReady
        this.$contentContainer.append(this.$content);
    };

    IFrameDialog.prototype.getWindow = function()
    {
        return this.$frame.iframeWindow()[0];
    };

    // Sends a message to the iframe content window. 
    // Used for orchestrating cross-window communication with dialog proxies.
    // * {string} command: The name of the command to send to the content window
    // * {object} data: A simple data object to serialize (as a querystring) and send with the command
    IFrameDialog.prototype._postCommand = function(command, data)
    {
        var messageData = { dialogCmd: command };
        if (data)
        {
            $.extend(messageData, data);
        }

        var message = $.param(messageData);

        this.postMessage(message);
    };

    // Sends a message to the iframe content window. 
    // Used for orchestrating cross-window communication with dialog proxies.
    // * {string} command: The name of the command to send to the content window
    // * {object} data: A simple data object to serialize (as a querystring) and send with the command
    IFrameDialog.prototype.postMessage = function(message)
    {
        var win = this.getWindow();

        var hostname = this.settings.frameHostname;
        if (!hostname)
        {
            // Get the domain of the target window. If the URL is relative, its the same as the current page.
            hostname = this.settings.url.indexOf("http") === 0 ? this.settings.url : document.location.href;
        }

        if ($.postMessage)
        {
            $.postMessage(message, hostname, win);
        }
        else
        {
            win.postMessage(message, "*");
        }
    };

    IFrameDialog.prototype.setHeight = function(contentHeight, center, skipAnimation)
    {
        var applyChange = skipAnimation ? 
            function($content, css) { $content.css(css); } :
            function($content, css) { $content.animate(css, { duration: 400 }); };

        applyChange(this.$content, { height: contentHeight });

        if (center)
        {
            var pos = this._getDefaultPosition(contentHeight);
            applyChange(this.$content, { top: pos.top });
        }

        this.settings.initialHeight = contentHeight;
    };

    // Sets the height of the iframe to the detected height of the iframe content document.
    IFrameDialog.prototype.setHeightFromContent = function(center, skipAnimation)
    {
        this._postCommand("setHeightFromContent", { center: !!center, skipAnimation: !!skipAnimation});
    };

    // Sets the title of the dialog in the header from the HTML title tag of the iframe content document.
    IFrameDialog.prototype.setTitleFromContent = function()
    {
        this._postCommand("setTitleFromContent");
    };

    IFrameDialog.prototype.notifyReady = function(hostname)
    {
        // There may be a timer waiting for the iframe to load- cancel it.
        if (this._iframeLoadTimer)
        {
            clearTimeout(this._iframeLoadTimer);
            this._iframeLoadTimer = null;
        }

        this.settings.frameHostname = hostname;

        ModalDialog.prototype._finishOpen.apply(this);
    };

    IFrameDialog.prototype._finishOpen = function()
    {
    };

    // AjaxDialog: Extends ModalDialog 
    // Loads content via ajax
    var AjaxDialog = function()
    {
        ModalDialog.apply(this, arguments);
    };

    $.extend(AjaxDialog.prototype, ModalDialog.prototype);

    AjaxDialog.prototype.dialogType = "ajax";

    AjaxDialog.prototype.open = function()
    {
        var deferred = ModalDialog.prototype.open.apply(this, arguments);

        if (!this._ajaxComplete)
        {
            // $.fn.partialLoad will ajax in content intelligently,
            // adding scripts, but not if they're already loaded.
            this.$content.partialLoad(
                this.settings.url,
                null,
                $.proxy(
                    function(responseText, status, xhr)
                    {
                        this._ajaxComplete = true;

                        xhr.fail(
                            $.proxy(function()
                            {
                                this._resetFailed();

                                var errEvent = { 
                                    xhr: xhr, 
                                    status: status, 
                                    responseText: responseText
                                };

                                this.onajaxerror.fire(errEvent);

                                this._rejectDeferred("open", [errEvent]);

                            }, this));

                        // Extract title from content if not explicitly specified
                        var $title = this.$content.find("title");
                        if (!this.settings.title)
                        {
                            if ($title.length >= 0)
                            {
                                this.setTitle($title.text());
                            }
                        }
                        $title.remove();

                        ModalDialog.prototype._finishOpen.call(this);
                    }, 
                    this)
                );
        }
        else
        {
            // The content is already loaded
            ModalDialog.prototype._finishOpen.call(this);
        }

        return deferred.promise();
    };

    AjaxDialog.prototype._finishOpen = function()
    {
        // no-op. Needds to wait for content to be ajaxed in asynchronously.
        // Base implementation will be called manually.
    };

    AjaxDialog.prototype._buildContent = function()
    {
        // Create a container and ajax content into it.
        this.$content = $("<div class='dialog-content'></div>");
    };

    AjaxDialog.prototype._destroy = function()
    {
        this.$el.remove();
    };

    var _dialogIdCounter = -1;
    var DIALOG_NAME_PREFIX = "dialog";

    // Determines if the specified string is a CSS selector or a URL.
    var isSelector = function(s)
    {
        var firstChar = s.charAt(0);
        if (firstChar == "#")
        {
            // This is a #anchor
            // Its a selector
            return true;
        }

        if (s.indexOf("/") >= 0)
        {
            // Selectors never contain /
            // This is a URL
            return false;
        }

        if (firstChar == ".")
        {
            var secondChar = s.charAt(1);
            if (secondChar == "." || secondChar == "/")
            {
                // Starts with .. or ./
                // This is a URL, not a selector
                return false;
            }

            // It's a CSS class:
            // .foo
            return true;
        }

        // We can't determine. Presume this is a URL.
        // i.e. "something" or "something.something" can be a either URL or a selector
        return false;
    };

    //Takes a settings object and calculates derived settings.
    //Settings go in order:

    // 1. default value
    // 2. setting provided on content element
    // 3. settings passed
    var ensureSettings = function(explicitSettings)
    {
        var settings = $.extend({}, $.modalDialog.defaults);

        // An iframe dialog may have sent a reference to dialog content,
        // but it didn't know if it was a URL or a selector for a DOM node.
        // Determine which it is.
        if (explicitSettings.contentOrUrl)
        {
            if (isSelector(explicitSettings.contentOrUrl))
            {
                explicitSettings.content = $(explicitSettings.contentOrUrl);
            }
            else
            {
                explicitSettings.url = explicitSettings.contentOrUrl;
            }

            delete explicitSettings.contentOrUrl;
        }

        // Read settings specified on the target node's custom HTML attributes
        if (explicitSettings.content)
        {
            var $target = $(explicitSettings.content);
            var targetSettings = $.modalDialog.getSettings($target);
            $.extend(settings, targetSettings);
        }

        // The explicitly specified settings take precedence
        $.extend(settings, explicitSettings);

        var id;

        // A fullId was specified, passed from an existing dialog's content window via a message. 
        // Calculate the parentId from the fullId.
        if (settings._fullId)
        {
            var idParts = settings._fullId.split("_");
            id = idParts.pop();
            if (idParts.length > 0)
            {
                settings.parentId = idParts.join("_");
            }
        }
        else
        {
            // Ensure a unique ID for the dialog
            id = DIALOG_NAME_PREFIX + (settings.id || ++_dialogIdCounter);

            // If a parentId was specified, this is a new dialog being created from 
            // a child dialog. The child will become the "parent dialog" of the new dialog.
            var parentId = settings.parentId ? settings.parentId + "_" : "";

            settings._fullId = parentId + id;
        }

        return settings;
    };

    // Gets the dialog by the fullId.

    // * {string} fullId The full ID of the dialog (including all parent ids)
    var getDialog = function(fullId)
    {
        return _fullIdMap[fullId];
    };

    // Public sub-namespace for modal dialogs.
    $.modalDialog = $.modalDialog || {};

    // Used to prevent the content window script from loading over this one
    $.modalDialog._isHost = true;

    // On small screens we make the background opaque to hide the content because
    // we will be hiding all content within the DOM and scrolling them to top.
    // When removing the host window content from the DOM, make the veil opaque to hide it.
    $.modalDialog.veilClass = "dialog-veil";

    // Creates a new dialog from the specified settings.
    $.modalDialog.create = function(settings)
    {
        settings = ensureSettings(settings);

        var dialog = getDialog(settings._fullId);

        // Validate that there isn't an existing dialog open using the same content
        if (!dialog && settings.content)
        {
            var existingDialog = $(settings.content).modalDialogInstance();

            if (existingDialog && 
                settings._fullId && 
                existingDialog.settings._fullId !== settings._fullId && 
                existingDialog.isOpen())
            {
                throw new Error("An attempt was made to create a dialog with a content node which is already assigned to another open dialog.");
            }
        }

        if (!dialog)
        {
            if (settings.url)
            {
                if (settings.content)
                {
                    throw new Error("Both url and content cannot be specified.");
                }
                else if (settings.ajax)
                {
                    dialog = new AjaxDialog(settings);
                }
                else
                {
                    dialog = new IFrameDialog(settings);
                }
            }
            else if (settings.content)
            {
                if ($(settings.content).length === 0)
                {
                    throw new Error("ModalDialog content not found");
                }

                dialog = new ModalDialog(settings);

                if (!settings.destroyOnClose)
                {
                    $(settings.content).modalDialogInstance(dialog);
                }
            }
            else
            {
                throw new Error("No url or content node specified");
            }

            _fullIdMap[settings._fullId] = dialog;
        }

        return dialog;
    };

    // Gets the currently active dialog (topmost visually).
    $.modalDialog.getCurrent = function()
    {
        return _dialogStack.length > 0 ? _dialogStack[_dialogStack.length-1] : null;
    };

    // Gets an existing dialog if it's settings match the specified setting's content node or URL
    $.modalDialog.getExisting = function(settings)
    {
        // Supresses warnings about using !! to coerce a falsy value to boolean
        /* jshint -W018 */

        var $content = $(settings.content);
        var isMatch;

        // Match a node dialog
        if ($content && $content.length)
        {
            isMatch = function(existingSettings)
            {
                return existingSettings.content && 
                    $(existingSettings.content)[0] === $content[0];
            };
        }
        // match an iframe or ajax dialog
        else if (settings.url)
        {
            isMatch = function(existingSettings)
            {
                return existingSettings.url && 
                    existingSettings.url === settings.url && 
                    !!existingSettings.ajax === !!settings.ajax;
            };
        }

        if (isMatch)
        {
            for (var key in _fullIdMap)
            {
                var dialog = _fullIdMap[key];
                if (isMatch(dialog.settings))
                {
                    return dialog;
                }
            }
        }

        return null;
    };

    // Global events (not associated with an instance)
    $.CustomEvent.create($.modalDialog, "beforeopen");
    $.CustomEvent.create($.modalDialog, "open");
    $.CustomEvent.create($.modalDialog, "beforeclose");
    $.CustomEvent.create($.modalDialog, "close");

    var JQUERY_DATA_KEY = "modalDialog";

    $.fn.modalDialogInstance = function(dialog)
    {
        return !dialog ? this.data(JQUERY_DATA_KEY) : this.data(JQUERY_DATA_KEY, dialog);
    };

    // Idiomatic jQuery interface for node dialogs.
    $.fn.modalDialog = function(settings)
    {
        var dialog;

        // If the first argument is a string, it is a method name to call on the dialog
        // associated with the DOM element.
        if (typeof settings == "string")
        {
            var action = settings;
            dialog = this.modalDialogInstance();
            if (dialog && dialog[action])
            {
                dialog[action].apply(dialog, Array.prototype.slice(arguments, 1));
            }
        }
        // Otherwise, create a new dialog.
        else
        {
            settings = settings || {};
            settings.content = this[0];

            dialog = $.modalDialog.create(settings);

            dialog.open();
        }

        return this;
    };

    // A map of actions that can be passed as the "dialogCmd" argument in posted messages from IFrameDialog dialog proxies.
    var messageActions = 
    {
        setHeight: function(dialog, qs)
        {
            dialog.setHeight(parseInt(qs.height, 10), qs.center === "true", qs.skipAnimation === "true");
        },

        setTitle: function(dialog, qs)
        {
            dialog.setTitle(qs.title);
        },

        open: function(dialog)
        {
            dialog.open();
        },

        close: function(dialog)
        {
            dialog.close();
        },

        create: function()
        {
            // do nothing- the dialog was created already
        },

        center: function(dialog)
        {
            dialog.center();
        },

        notifyReady: function(dialog, qs)
        {
            dialog.notifyReady(qs.hostname);
        }
    };

    var messageHandler = function(e)
    {
        var qs;

        try
        {
            qs = $.deparam(e.originalEvent ? e.originalEvent.data : e.data);
        }
        catch (ex)
        {
            // ignore- it wasn't a message for the dialog framework
        }

        // messages in the dialog framework contain "dialogCmd"
        if (qs && qs.dialogCmd)
        {
            var action = messageActions[qs.dialogCmd];
            if (action)
            {
                var dialog;

                if (qs._fullId)
                {
                    // If a fullId is passed, it can be either for a new dialog or an existing dialog.
                    // $.modalDialog.create() handles both cases.
                    dialog = $.modalDialog.create(qs);
                }
                else
                {
                    dialog = $.modalDialog.getCurrent();
                }

                action(dialog, qs);

                return true;
            }
        }

        return false;
    };

    // Note: It is a bit odd that even though we have the jquery.postMessage() plugin,
    // we're still checking its availability and calling the native implementation here.
    // The reason is that for most browsers (besides old IE) the plugin is unnecessary, 
    // and it may not be desirable to load it at all.

    if ($.receiveMessage)
    {
        $.receiveMessage(messageHandler, "*");
    }
    else
    {
        $(window).on("message", messageHandler);
    }

    // Global hook to simplify non-cross domain communication
    window._dialogReceiveMessageManual = function(message, origin)
    {
        if (!messageHandler({ data: message, origin: origin}))
        {
            var evt = new $.Event("message");
            evt.data = message;
            evt.origin = origin;
            $(window).trigger(evt, [message, origin]);
        }
    };

    // jQuery mobile support
    $(document).ready(function()
    {
        if (!$.mobile)
        {
            return;
        }

        // Alternate defaults when jQuery mobile is loaded. Work around JQM's quirks.
        $.modalDialog.defaults =  $.extend(
            $.modalDialog.defaults,
            {
                // JQM widgets must be in the active data-role="page" element to work
                // containerElement: ".ui-page.ui-page-active",

                // Event bubbling breaks many JQM widgets
                preventEventBubbling: false
            });
    });

})(jQuery);

// iOS
// iOS has a bug where text fields in an iFrame misbehave if there are touch events assigned to the 
// host window. This fix disables them while iFrame dialogs are open.

// Android
// Older versions of Android stock browser, particularly ones whose manufacturers customized the browser
// with proprietary text field overlays, have trouble with complex positioning and transforms.
// This becomes exacerbated by the complexity of the modal dialog DOM, especially when an IFrame 
// is involved.
// The result is that the proprietary text field overlays are positioned incorrectly (best case),
// or that they start producing nonsensical focus events, which cause the browser to scroll wildly.
// http://stackoverflow.com/questions/8860914/on-android-browser-the-whole-page-jumps-up-and-down-when-typing-inside-a-textbo

// Newer android browsers (4+) support the CSS property: -webkit-user-modify: read-write-plaintext-only;
// This will prevent the proprietary text field overlay from showing (though also HTML5 custom ones, such as email keyboards).
// http://stackoverflow.com/questions/9423101/disable-android-browsers-input-overlays
// https://code.google.com/p/android/issues/detail?id=30964

// To work around this problem in older Android (2.3), we have to hide elements that have any CSS transforms.
// The cleanest way is to remove ALL content in the DOM in the main panel. This will make the screen behind the dialog turn
// completely gray, which isn't a big deal- many dialog frameworks do this anyway.
// To do this, add the attribute to the element:
// data-dialog-main-panel="true"

// Otherwise, you can hide specific problematic elements by adding this attribute:
// data-dialog-hide-onopen="true"

(function ($)
{
    var SELECTOR_MAIN_PANEL = "[data-dialog-main-panel='true']";
    var SELECTOR_BAD_ELEMENT = "[data-dialog-hide-onopen='true']";

    var preventWindowTouchEvents = function(dialog, fix)
    {
        // The bug only affects iFrame dialogs
        if (dialog.dialogType != "iframe")
        {
            return;
        }

        $([window, document]).enableEvent("touchmove touchstart touchend", !fix);
    };

    var getWindowHeight = function()
    {
        return window.innerHeight || $(window).height();
    };

    var initializeShimming = function()
    {
        // First, see if the main panel is specified.
        // If so, it's the best choice of elements to hide.
        var $badEls = $(SELECTOR_MAIN_PANEL);
        if ($badEls.length === 0)
        {
            // Otherwise, look for individually marked bad elements to hide.
            $badEls = $(SELECTOR_BAD_ELEMENT);
        }

        // Cache original values to restore when the dialog closes
        var _scrollTop = 0;
        var _height = 0;

        $.modalDialog.onbeforeopen.add(function()
        {
            if (this.level === 0)
            {
                // Cache scroll height and body height so we can restore them when the dialog is closed
                _scrollTop = $(document).scrollTop();
                _height = document.body.style.height;

                // Cache the parent for each element we need to remove from the DOM.
                // This is important to fix the various WebKit text overlay bugs (described above in the header).
                // Hiding them wont do it.
                $badEls.each(function(i, el)
                {
                    $(el).data("dialog-parent", el.parentNode);
                })
                .detach();

                // HACK: setting the body to be larger than the screen height prevents the address bar from showing up in iOS
                document.body.style.height = (getWindowHeight() + 50) + "px";

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onopen.add(function()
        {
            if (this.level === 0)
            {
                // Ensure the body/background is bigger than the dialog,
                // otherwise we see the background "end" above the bottom
                // of the dialog.
                var height = Math.max(this.$container.height(), getWindowHeight()) + 20;

                document.body.style.height = height+ "px";
                $(".dialog-background").css({ height: height });

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onclose.add(function()
        {
            if (this.level === 0)
            {
                // Restore body height, elements, and scroll position
                document.body.style.height = _height;

                $badEls.each(function(i, el)
                {
                    $($(el).data("dialog-parent")).append(el);
                });

                window.scrollTo(0, _scrollTop);
            }
        });
    };

    $(function()
    {
        if (!$.modalDialog.isSmallScreen())
        {
            return;
        }

        // When removing the host window content from the DOM, make the veil opaque to hide it.
        $.modalDialog.veilClass = "dialog-veil-opaque";

        // This will run in a content window. They need the events disabled immediately.
        if ($.modalDialog && $.modalDialog._isContent)
        {
            var dialog = $.modalDialog.getCurrent();
            if (dialog)
            {
                $(window).on("load", function() { preventWindowTouchEvents(dialog, true); });
            }
        }
        else
        {
            // This is for the host window.
            $.modalDialog.onopen.add(function() { preventWindowTouchEvents(this, true); });
            $.modalDialog.onbeforeclose.add(function() { preventWindowTouchEvents(this, false); });

            initializeShimming();
        }
    });

})(jQuery);

/*
Uses declarative syntax to define a dialog. Syntax:

<a 
    href="{selector or url"
    data-rel="modalDialog"
    data-dialog-title="{title}"
    data-dialog-onopen="{onopen handler}"
    data-dialog-onbeforeopen="{onbeforeopen handler}"
    data-dialog-onclose="{onclose handler}"
    data-dialog-onnbeforeclose="{onbeforeclose handler}"
    data-dialog-maxWidth="{maxWidth}"
    data-dialog-skin="{skin}"
    data-dialog-ajax="{true or false}"
    data-dialog-destroyonclose="{true or false}"
    data-dialog-zIndex="{default zIndex}"
    >link</a>

For node dialogs, these same properties can also be put on the dialog node as well.

TODO: Move some of the declarative settings into the core, because it is useful regardless of making
the trigger tag unobtrusive

TODO Make the dialog veil hide earlier when closing dialogs. It takes too long.
*/

(function($) 
{
    var DIALOG_DATA_KEY = "modalDialogUnobtrusive";

    // Click handler for all links which open dialogs
    var dialogLinkHandler = function(e)
    {
        e.preventDefault();
        
        var $link = $(e.currentTarget);

        var dialog = $link.data(DIALOG_DATA_KEY);

        if (!dialog)
        {
            var href = $link.attr("href");

            if (!href)
            {
                throw new Error("no href specified with data-rel='modalDialog'");
            }

            // Create a dialog settings object
            var settings = 
            {
                contentOrUrl: href
            };

            // Duplicate values on the link will win over values on the dialog node
            var linkSettings = $.modalDialog.getSettings($link);
            $.extend(settings, linkSettings);

            // Give unobtrusive scripts a chance to modify the settings
            var evt = new $.Event("dialogsettingscreate");
            evt.dialogSettings = settings;

            $link.trigger(evt);

            if (evt.isDefaultPrevented())
            {
                return;
            }

            dialog = $.modalDialog.create(settings);
            
            // Give unobtrusive scripts a chance to modify the dialog
            evt = new $.Event("dialogcreate");
            evt.dialogSettings = settings;
            evt.dialog = dialog;

            $link.trigger(evt);

            if (evt.isDefaultPrevented())
            {
                return;
            }

            // Cache the dialog object so it won't be initialized again
            $link.data(DIALOG_DATA_KEY, dialog);
        }

        dialog.open();
    };

    // Assign handlers to all dialog links
    $(document).on("click", "[data-rel='modalDialog']", dialogLinkHandler);

    // Helpful utility: A class that will make a button close dialogs by default
    $(document).on("click", ".close-dialog", function(e)
    {
        e.preventDefault();
        $.modalDialog.getCurrent().close();
    });

})(jQuery);



/* globals History */
// TODO: Need to support stacking dialogs:
// i.e. ?dialogs=#foo,ajax:/foo.html,iframe:/foo.html
// TODO require history.js

(function($) 
{
    var DEFAULT_DIALOG_PARAM_NAME = "sdialogid";
    var _dialogParamName;

    // Enables the history plugin, and returns a promise which
    // resolves when either the dialog specified in the URL is opened,
    // or if there is no dialog specified, immediately
    $.modalDialog.enableHistory = function(dialogParamName)
    {
        // Ensure enableHistory isn't called twice
        if (_historyEnabled)
        {
            return;
        }

        _historyEnabled = true;

        _dialogParamName = dialogParamName || DEFAULT_DIALOG_PARAM_NAME;

        var deferred = new $.Deferred();

        updateFromUrl()
            .then(
                function()
                {
                    try
                    {
                        $.modalDialog.onopen.add(openHandler);
                        $.modalDialog.onclose.add(closeHandler);

                        History.pushState(null, null, document.location.href);

                        History.Adapter.bind(window, "statechange", popstateHandler);

                        deferred.resolve();
                    }
                    catch (ex)
                    {
                        deferred.reject(ex);
                    }
                },
                function(ex)
                {
                    deferred.reject(ex);
                });

        return deferred;
    };

    // Handle history.js in hash mode for browser that don't support pushState
    var currentQueryStringOrHash = function()
    {
        if (window.location.search)
        {
            return $.currentQueryString();
        }
        else if (History.emulated.pushState && window.location.hash)
        {
            var qPos = window.location.hash.indexOf("?");
            if (qPos >= 0)
            {
                return $.deparam(window.location.hash.substr(qPos));
            }
        }

        return {};
    };

    // If history is disabled for any dialog in the stack, it should be disabled
    // for 
    var isHistoryEnabled = function(dialog)
    {
        var parent = dialog;

        do
        {
            if (parent && !parent.settings.enableHistory)
            {
                return false;
            }

            parent = parent.getParent();

        } while (parent);

        return _historyEnabled;
    };

    var _pageIsAtInitialState = true;
    var _stateAlreadyProcessed = false;
    var _disableHandlers = false;
    var _historyEnabled = false;

    var getDialogParams = function(dialog)
    {
        var dialogParams = 
        {
            dialogType: "node",
            dialogId: null
        };

        // Get the ID of the selected element (for node dialogs)
        if (dialog.settings.content)
        {
            var id = $(dialog.settings.content).prop("id");
            if (!id)
            {
                throw new Error("The specified content node has no ID, and cannot be serialized to a URL parameter.");
            }

            dialogParams.dialogId = "#" + id;
        }

        // If its not a node dialog, use the URL as the ID
        if (!dialogParams.dialogId && dialog.settings.url)
        {
            dialogParams.dialogType = dialog.settings.ajax ? "ajax" : "iframe";
            dialogParams.dialogId = dialog.settings.url;
        }

        return dialogParams;
    };

    var getDialogSettingsFromParams = function(dialogParams)
    {
        var settings = null;

        if (dialogParams.dialogType == "iframe")
        {
            settings = { url: dialogParams.dialogId };
        }
        else if (dialogParams.dialogType == "ajax")
        {
            settings = 
            { 
                ajax: true,
                url: dialogParams.dialogId
            };
        }
        else
        {
            var $content;
            try
            {
                $content = $(dialogParams.dialogId);
            }
            catch(ex)
            {}

            if ($content && $content.length > 0)
            {
                settings = $.modalDialog.getSettings($content);
                settings.content = $content;
            }
        }

        return settings;
    };

    var doParamsMatchDialog = function(dialogParams, dialog)
    {
        var d1 = getDialogParams(dialog);

        return d1.dialogType == dialogParams.dialogType &&
            d1.dialogId == dialogParams.dialogId;
    };

    var encodeDialogId = function(s)
    {
        return s.replace("#", "-hash-");
    };

    var decodeDialogId = function(s)
    {
        return s.replace("-hash-", "#");
    };

    var parseDialogParams = function(data)
    {
        if (!data)
        {
            return [];
        }

        var items = data.split(" ");

        return $.map(items, function(item)
        {
            var delimPos = item.indexOf(",");

            if (delimPos < 0)
            {
                throw new Error("Invalid dialog parameters: " + item);
            }

            return {
                dialogType: item.substr(0, delimPos),
                dialogId: decodeDialogId(item.substr(delimPos + 1))
            };
        });
    };

    var encodeDialogParams = function(dialogParamsList)
    {
        return $.map(dialogParamsList, function(item)
            {
                return item.dialogType + "," + encodeDialogId(item.dialogId);
            })
            .join(" ");
    };

    // Handler for dialogs opening
    var openHandler = function()
    {
        // Hook to ensure the history handler doesn't run infinitely
        // when the dialog was opened by the history plugin itself
        if (_disableHandlers)
        {
            return;
        }

        if (!isHistoryEnabled(this))
        {
            return;
        }

        // Build a querystring to encode the open state of the dialog

        var dialogParams = getDialogParams(this);

        // If there's an existing open dialog, encode the parameters for this dialog after it
        var qs = currentQueryStringOrHash();
        var dialogParamsList = parseDialogParams(qs[_dialogParamName]);

        // Verify that the level of the dialog matches the number of items in the dialogParamsList
        if ((this.level+1) <= dialogParamsList.length)
        {
            throw new Error("The number of dialogParams in the URL doesn't match the number of open dialogs. Not updating history.");
        }

        dialogParamsList.push(dialogParams);
        qs[_dialogParamName] = encodeDialogParams(dialogParamsList);

        var url = $.appendQueryString(document.location.pathname, qs);

        // Hook to notify the popstate handler that this URL change was triggered internally,
        // and the dialog is already open, so it shouldn't do any more work.
        _stateAlreadyProcessed = true;

        // Update the URL
        History.pushState(null, null, url);

        // Mark the page as not in its initial state so the close handler will know if
        // it should add a history entry when closing dialogs
        _pageIsAtInitialState = false;
    };

    // Handler which fires when dialogs are closed
    var closeHandler = function()
    {
        if (_disableHandlers)
        {
            return;
        }

        if (this.settings.enableHistory === false)
        {
            return;
        }

        // If the page is in its initial state (just loaded), then closing a dialog should
        // create a new history entry so the back button will open the dialog again.
        if (_pageIsAtInitialState)
        {
            var qs = currentQueryStringOrHash();
            var dialogParamsList = parseDialogParams(qs[_dialogParamName]);
            var poppedParams = dialogParamsList.pop();

            if (!doParamsMatchDialog(poppedParams, this))
            {
                throw new Error("Closed dialog does not match URL parameters: " + poppedParams.dialogType + "," + poppedParams.dialogId + ". History not updated.");
            }

            // TODO: verify that the dialog params popped off match the current dialog
            // clean up if not

            if (dialogParamsList.length === 0)
            {
                delete qs[_dialogParamName];
            }
            else
            {
                qs[_dialogParamName] = encodeDialogParams(dialogParamsList);
            }

            var url = $.appendQueryString(document.location.pathname, qs);

            History.pushState(null, null, url);
        }
        else
        {
            // If the page isn't in its initial state, then closing a dialog should go back
            // one entry in history.

            // Since we're in a dialog close handler, we don't want to re-trigger a dialog close
            // when the popstate event fires. This prevents an infinite loop.
            _stateAlreadyProcessed = true;

            History.back();
        }

        _pageIsAtInitialState = false;
    };

    // Looks for changes in the URL and opens or closes dialogs accordingly
    var popstateHandler = function()
    {
        // If the history plugin triggered the URL change itself,
        // then the UI has been updated already, and we shouldn't update anything.
        if (_stateAlreadyProcessed)
        {
            _stateAlreadyProcessed = false;
            return;
        }

        updateFromUrl();
    };

    // Listen to URL changes and open/close dialogs accordingly
    var updateFromUrl = function()
    {
        var deferred = new $.Deferred();

        // An array of parsed dialog parameters from the URL
        var dialogParamsList = parseDialogParams(currentQueryStringOrHash()[_dialogParamName]);

        // Figure out the topmost dialog so it can be checked against the number of dialogs specified in the URL
        var topmostDialog = $.modalDialog.getCurrent();
        var topmostStackPos = topmostDialog ? topmostDialog.level + 1 : 0;

        if (dialogParamsList.length === topmostStackPos)
        {
            deferred.resolve();
        }

        // If there are more dialogParams in the URL than dialogs displayed,
        // open them in order
        var openDialogsUntilUrlMatches = function()
        {
            if (dialogParamsList.length > topmostStackPos)
            {
                var dialogParams = dialogParamsList[topmostStackPos];

                var settings = getDialogSettingsFromParams(dialogParams);

                // validate settings are correct
                if (!settings)
                {
                    _disableHandlers = false;

                    deferred.reject("Unable to create dialog settings from dialogId in URL: " + dialogParams.dialogType + "," + dialogParams.dialogId);
                    return;
                }

                // Try to reuse an existing, matching dialog if possible
                var dialog = $.modalDialog.getExisting(settings);

                // If it doesn't exist, create a new one
                if (!dialog)
                {
                    dialog = $.modalDialog.create(settings);
                }

                // Disable dialog open/close handlers set by this history plugin,
                // because we're currently reading the URL and updating the dialogs.
                // If the handlers were enabled, we'd get infinite looping.
                _disableHandlers = true;

                dialog.open()
                    .then(function()
                    {
                        // Recurse until all dialogs embedded in the URL are open
                        topmostStackPos++;
                        try
                        {
                            openDialogsUntilUrlMatches();
                        }
                        catch (ex)
                        {
                            deferred.reject(ex);
                        }
                    });
            }
            else
            {
                setTimeout(function()
                    {
                        deferred.resolve();
                        _disableHandlers = false;
                    },
                    0);
            }
        };

        if (dialogParamsList.length > topmostStackPos)
        {
            openDialogsUntilUrlMatches();
        }

        // If there are fewer dialogParams in the URL than in dialogs displayed,
        // close them until they match
        var closeDialogsUntilUrlMatches = function()
        {
            if (dialogParamsList.length < topmostStackPos)
            {
                var currentDialog = $.modalDialog.getCurrent();
                if (currentDialog)
                {
                    if (!currentDialog.settings.enableHistory)
                    {
                        deferred.resolve();
                        _disableHandlers = false;
                        return;
                    }

                    // Disable dialog open/close handlers set by this history plugin,
                    // because we're currently reading the URL and updating the dialogs.
                    // If the handlers were enabled, we'd get infinite looping.
                    _disableHandlers = true;

                    currentDialog.close()
                        .then(function()
                        {
                            topmostStackPos--;

                            try
                            {
                                // Recurse until all dialogs not in the URL are closed 
                                closeDialogsUntilUrlMatches();
                            }
                            catch (ex)
                            {
                                deferred.reject(ex);
                            }
                        });
                }
                else
                {
                    _disableHandlers = false;
                    deferred.reject("There was a mismatch between the URL and the current open dialog stack");
                }
            }
            else
            {
                setTimeout(function()
                {
                    deferred.resolve();
                    _disableHandlers = false;
                });
            }
        };

        if (dialogParamsList.length < topmostStackPos)
        {
            closeDialogsUntilUrlMatches();
        }

        return deferred;
    };

})(jQuery);
