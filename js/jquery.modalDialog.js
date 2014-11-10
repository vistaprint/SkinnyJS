(function ($) {
    if ($.modalDialog && $.modalDialog._isContent) {
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
        preventEventBubbling: false, // If true, click and touch events are prevented from bubbling up to the document
        enableHistory: true, // If the history module is enabled, this can be used to disable history if set false
        onopen: null,
        onclose: null,
        onbeforeopen: null,
        onbeforeclose: null,
        onajaxerror: null
    };

    var _ua = $.modalDialog._ua;

    $.modalDialog.iframeLoadTimeout = 0;
    $.modalDialog.animationDuration = 500;

    // Class which creates a jQuery mobile dialog
    var ModalDialog = function (settings) {
        this.settings = settings;
        this.parent = $(this.settings.containerElement || "body");

        // Creates event objects on the dialog and copies handlers from settings
        $.each(["open", "beforeopen", "close", "beforeclose", "ajaxerror"], $.proxy(this._setupCustomEvent, this));

        // Bind methods called as handlers so "this" works
        $.proxyAll(this, "_drag", "_startDrag", "_stopDrag", "_close", "_keydownHandler");
    };

    ModalDialog.prototype.dialogType = "node";

    // Creates a custom event on this object with the specified event name
    ModalDialog.prototype._setupCustomEvent = function (i, eventName) {
        var onEvent = "on" + eventName;
        var evt = $.CustomEvent.create(this, eventName);

        var handler = this.settings[onEvent];
        if (handler) {
            evt.add(handler);
        }

        return evt;
    };

    ModalDialog.prototype._initDeferred = function (action, deferred) {
        this._deferreds = this._deferreds || {};
        deferred = deferred || new $.Deferred();
        this._deferreds[action] = deferred;
        return deferred;
    };

    ModalDialog.prototype._completeDeferred = function (action, resolution, args) {
        var deferred = this._deferreds[action];
        if (deferred) {
            deferred[resolution + "With"](this, args);
            //this._deferreds[action] = null;

            return deferred;
        }

        throw new Error("No deferred initialized for action '" + action + "'");
    };

    ModalDialog.prototype._resolveDeferred = function (action, args) {
        return this._completeDeferred(action, "resolve", args);
    };

    ModalDialog.prototype._rejectDeferred = function (action, args) {
        return this._completeDeferred(action, "reject", args);
    };

    ModalDialog.prototype._clearDeferred = function (action) {
        this._deferreds[action] = null;
    };

    ModalDialog.prototype._getDeferred = function (action) {
        return this._deferreds[action];
    };

    ModalDialog.prototype._isDeferredComplete = function (action) {
        var deferred = this._getDeferred(action);
        return !deferred || deferred.state() != "pending";
    };

    ModalDialog.prototype.isOpen = function () {
        return !!this._open;
    };

    // Opens the dialog
    ModalDialog.prototype.open = function (disableAnimation) {
        var deferred = this._initDeferred("open", deferred);

        // Ensure the dialog doesn't open once its already opened.. 
        // Otherwise, you could end up pushing it on to the stack more than once.
        if (this._open) {
            return this._rejectDeferred("open");
        }

        // Description
        this.level = _dialogStack.length;

        // Fire onbeforeopen on this instance
        var evt = this.onbeforeopen.fire();
        if (evt.isDefaultPrevented()) {
            return this._rejectDeferred("open");
        }

        // Fire onbeforeopen globally
        evt = $.modalDialog.onbeforeopen.fire(null, this);
        if (evt.isDefaultPrevented()) {
            return this._rejectDeferred("open");
        }

        // Keep track of the dialog stacking order
        _dialogStack.push(this);

        if (this.level > 0) {
            this.settings.parentId = _dialogStack[this.level - 1].settings._fullId;
        }

        this._open = true;

        this._build();

        // add or remove the 'smallscreen' class (which can also be checked using CSS media queries)
        this.$container[$.modalDialog.isSmallScreen() ? "addClass" : "removeClass"]("smallscreen");

        // Stop any animations on the container
        this.$container.stop(true, true);

        // show the background veil
        this.$el.show();

        this._showLoadingIndicator();

        $(document).on("keydown", this._keydownHandler);

        this._finishOpenAction = function () {
            if (deferred.state() != "rejected") {
                this.$bg.addClass($.modalDialog.veilClass);

                // Set the width first so that heights can be calculated based
                // on the layout for that width.
                var widthData = this._getDefaultWidthData();
                this.$container.css({
                    width: widthData.width
                });

                // set opacity to 0 so that we can fade it in
                this.$container.css("opacity", 0);

                var initialPos = this._getDefaultPosition();
                var initialTop = initialPos.top;                
                this.$container.css(initialPos);

                var animationCallback = $.proxy(function () {
                    try {
                        this.$el.addClass("dialog-visible");

                        if ($.modalDialog.isSmallScreen()) {
                            // TODO: I question this change. Should it be decoupled from the dialog framework?
                            // It could be put into mobile fixes.
                            // Is this even mobile specific?
                            // Original comment:
                            // Force dialogs that are on small screens to trigger a window resize event when closed, just in case we have resized since the dialog opened.

                            this.triggerWindowResize = false;
                            this._orientationchange = $.proxy(function (event) {
                                    this.triggerWindowResize = true;
                                    return this.pos(event);
                                },
                                this);

                            $(window).on("orientationchange resize", this._orientationchange);
                        }

                        this.onopen.fire();

                        $.modalDialog.onopen.fire(null, this);

                        this._resolveDeferred("open");
                    } catch (ex) {
                        this._rejectDeferred("open", ex);
                    }

                    this._clearDeferred("open");

                }, this);

                if (disableAnimation) {
                    // If animation is disabled, just move the dialog into position synchronously, 
                    // and then do the callback on the next event loop tick.
                    this.$container.css({ top: initialTop });
                    setTimeout(animationCallback, 0);
                } else {
                    // Otherwise, animate open
                    this.$container.animate({ opacity: 1 }, $.modalDialog.animationDuration, "swing")
                       .promise()
                       .then(animationCallback, animationCallback);

                }

            } else {
                this._clearDeferred("open");
            }

            this._hideLoadingIndicator();
        };

        this._finishOpen();

        return deferred.promise();
    };

    ModalDialog.prototype._finishOpen = function () {
        if (this._finishOpenAction) {
            try {
                this._finishOpenAction();
            } catch (ex) {
                this._rejectDeferred("open", ex);
                this._clearDeferred("open");
            }

            this._finishOpenAction = null;
        }
    };

    // If a user hits the ESC key, close the dialog or cancel it's opening.
    ModalDialog.prototype._keydownHandler = function (e) {
        if (e.keyCode == 27) {
            if ($.modalDialog.getCurrent() === this) {
                this.cancel();
            }
        }
    };

    ModalDialog.prototype.cancel = function () {
        // Don't move to the end state of the animation:
        // stop it right where it is.
        if (this.$container) {
            this.$container.stop(true, false);
        }

        if (this.isOpen()) {
            this.close();
        }
    };

    ModalDialog.prototype._showLoadingIndicator = function () {
        if (!this.$loadingIndicator) {
            this.$loadingIndicator = $("<div class='dialog-loading-indicator'><span></span></div>")
                .appendTo(this.$bg);
            //.css("z-index", parseInt(this.$bg.css("z-index"), 10) + 1);
        }
    };

    ModalDialog.prototype._hideLoadingIndicator = function () {
        this.$loadingIndicator.remove();
        this.$loadingIndicator = null;
    };

    ModalDialog.prototype._popDialogStack = function () {
        if ($.modalDialog.getCurrent() === this) {
            _dialogStack.pop();
        }
    };

    // Closes the dialog. 
    // isDialogCloseButton Indicates the cancel button in the dialog's header was clicked.
    ModalDialog.prototype.close = function (isDialogCloseButton) {
        var deferred = this._initDeferred("close", deferred);

        if ($.modalDialog.getCurrent() !== this) {
            throw new Error("Can't close a dialog that isn't currently displayed on top.");
        }

        var eventSettings = {
            isDialogCloseButton: !! isDialogCloseButton
        };

        // Expose an event allowing consumers to cancel the close event
        if (this.onbeforeclose.fire(eventSettings).isDefaultPrevented()) {
            return this._rejectDeferred("close");
        }

        // Expose a global event
        if ($.modalDialog.onbeforeclose.fire(eventSettings, this).isDefaultPrevented()) {
            return this._rejectDeferred("close");
        }

        this._popDialogStack();

        $(document).off("keydown", this._keydownHandler);

        // hide the veil
        this.$el.removeClass("dialog-visible");
        
        this.$container.animate({
                opacity: 0
            },
            $.modalDialog.animationDuration,
            "swing"
        )
            .promise()
            .then(
                $.proxy(function () {
                    try {
                        this._finishClose(eventSettings);
                    } catch (ex) {
                        this._rejectDeferred("close", ex);
                        this._clearDeferred("close");
                    }
                }, this),
                $.proxy(function (ex) {
                    this._rejectDeferred("close", ex);
                    this._clearDeferred("close");
                }, this));

        // unbind global event listeners
        if (this._orientationchange) {
            $(window).off("orientationchange resize", this._orientationchange);
        }

        return deferred.promise();
    };

    ModalDialog.prototype._close = function (e) {
        e.preventDefault();
        this.close(true);
    };

    ModalDialog.prototype._reset = function () {
        this._open = false;

        this.$container.stop(true, true);
        this.$container.css({
            top: STARTING_TOP
        });
        this.$bg.removeClass($.modalDialog.veilClass);
        this.$el.hide();
    };

    ModalDialog.prototype._resetFailed = function () {
        this._reset();
        this._popDialogStack();
    };

    ModalDialog.prototype._finishClose = function (e) {
        this._reset();

        if (this.settings.destroyOnClose) {
            this._destroy();
        }

        if ($.modalDialog.isSmallScreen() && this.triggerWindowResize) {
            $(window).trigger("resize");
        }

        // Fire events on a timeout so that the event loop
        // has a chance to process DOM changes. 
        // Without this, close handlers can't re-open the same iframe dialog:
        // the iframe isn't recognized as a new element.
        setTimeout(
            $.proxy(function () {
                this.onclose.fire(e);

                $.modalDialog.onclose.fire(e, this);

                this._resolveDeferred("close");
            }, this),
            0);
    };

    ModalDialog.prototype._destroy = function () {
        if (this._destroyed) {
            return;
        }

        // Put the content node back on the body.
        // It could be used again.
        this.$content.detach().appendTo("body");
        this.$el.remove();

        delete _fullIdMap[this.settings._fullId];
        this._destroyed = true;
    };

    ModalDialog.prototype._updateZIndexes = function () {
        var zIndex = this.settings.zIndex;
        var parent = this.getParent();
        if (parent) {
            zIndex = Math.max(parent.settings.zIndex + 10, zIndex);
        }

        this.$bg.css("z-index", zIndex);
        zIndex += 2;
        this.$container.css("z-index", zIndex);
    };

    ModalDialog.prototype._preventClickBubbling = function ($el) {
        var me = this;

        $el.on("click mousedown mouseup touchstart touchend", function (e) {
                if (me.settings.preventEventBubbling) {
                    e.stopPropagation();
                }
            });
    };

    // Builds the DOM for the dialog chrome
    ModalDialog.prototype._build = function () {
        /*jshint quotmark:false*/

        if (this._destroyed) {
            throw new Error("This dialog has been destroyed");
        }

        if (!this.$el) {
            this.$bg = $('<div class="dialog-background"></div>');

            this.$container = $(
                '<div class="dialog-container" id="' + this.settings._fullId + 'Container">' +
                '  <div class="dialog-header">' +
                '    <a href="#" class="dialog-close-button"><span class="dialog-close-button-icon"></span></a>' +
                '    <h1>' + (this.settings.title || "") + '</h1>' +
                '  </div>' +
                '  <div class="dialog-content-container">' +
                '  </div>' +
                '</div>'
            );

            this._preventClickBubbling(this.$bg);
            this._preventClickBubbling(this.$container);

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

            this.$contentContainer.on("click", '*[data-action="close"]', this._close);

            this.$contentContainer.append(this.$content);

            // only enable dragging if the dialog is over the entire window
            // and we are not in Internet Explorer 7, because it handles positioning oddly.
            if ((this.parent.is("body") || this.parent.hasClass("ui-page-active")) && !_ua.ie7) {
                this._makeDraggable();
            }
        } else {
            this._alreadyBuilt();
        }

        this._updateZIndexes();
    };

    // Subclasses should override to do something when a cached DOM is used
    ModalDialog.prototype._alreadyBuilt = function () {

        // Two node dialogs can share the same content node (this isn't true of AJAX or IFRAME dialogs).
        // Ensure the content node is still owned by this dialog
        if (this.$content.parent()[0] !== this.$contentContainer[0]) {
            this._buildContent();
            this.$contentContainer.append(this.$content);
        }
    };

    ModalDialog.prototype._getChromeHeight = function () {
        if (!this._chromeHeight) {
            this._chromeHeight = this.$container.height() - this.$content.height();
        }

        return this._chromeHeight;
    };

    ModalDialog.prototype._getDefaultWidthData = function () {
        var $win = $(window);
        var windowWidth = this.parent.is("body") ? (window.innerWidth || $win.width()) : this.parent.width();

        return {
            windowWidth: windowWidth,
            width: Math.min(windowWidth - (MARGIN * 2), this.settings.maxWidth)
        };
    };

    ModalDialog.prototype._getDefaultPosition = function (contentHeight) {
        var widthData = this._getDefaultWidthData();
        var scrollTop = $(document).scrollTop();

        var pos = {
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

        if (!isSmallScreen) {
            contentHeight = contentHeight || this.$content.height();

            // Get the new container height with the proposed content height
            var containerHeight = this._getChromeHeight() + contentHeight;

            var parentHeight = this.parent.is("body") ? $(window).height() : this.parent.height();
            var idealTop = ((parentHeight / 2) - (containerHeight / 2)) + scrollTop;

            pos.top = Math.max(idealTop, pos.top);
        }

        return pos;
    };

    ModalDialog.prototype._makeDraggable = function () {
        // Small devices shouldn't have the dialog be draggable.
        // Where you gonna drag to?

        if ($.modalDialog.isSmallScreen()) {
            return;
        }

        this.$header.addClass("draggable").on("pointerdown", this._startDrag);
    };

    ModalDialog.prototype._startDrag = function (e) {
        var $target = $(e.target);

        //Don't drag if the close button is being clicked
        if ($target.is(this.$closeButton) || $target.is(this.$closeButton.children())) {
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        this._initialMousePos = getMousePos(e);
        this._initialDialogPos = this.$container.offset();

        $(document).on("pointermove", this._drag);

        // For pointerup events, we can't use the document, because the option
        // "preventEventBubbling" will prevent "click-like" events from bubbling to the 
        // document. Use $bg in addition to the header in case the dialog hasn't caught
        // up with the mouse when the pointerup event occurs.
        this.$header.on("pointerup", this._stopDrag);
        this.$bg.on("pointerup", this._stopDrag);

        // when there is an iframe and your cursor goes over
        // the iframe content it stops firing on the parent window
        if (this.$frame) {
            this._overlay = $("<div class='dialog-content-overlay'>").appendTo(this.$contentContainer);
        }

        this._isDragging = true;
    };

    ModalDialog.prototype._drag = function (e) {
        if (!this._isDragging) {
            $(document).off("pointermove", this._drag);
            return;
        }

        var mousePos = getMousePos(e);

        var deltaTop = mousePos.top - this._initialMousePos.top;
        var deltaLeft = mousePos.left - this._initialMousePos.left;

        var newPos = {
            top: this._initialDialogPos.top + deltaTop,
            left: this._initialDialogPos.left + deltaLeft
        };

        this.$container.css(newPos);
    };

    ModalDialog.prototype._stopDrag = function () {
        delete this._initialMousePos;
        delete this._initialDialogPos;

        $(document).off("pointermove", this._drag);
        this.$header.off("pointerup", this._stopDrag);
        this.$bg.off("pointerup", this._stopDrag);

        if (this._overlay) {
            this._overlay.remove();
            delete this._overlay;
        }

        this._isDragging = false;
    };

    // Gets the current mouse position from the event object.
    // returns an object with top and left
    var getMousePos = function (e) {
        var mousePos = {
            left: e.pageX,
            top: e.pageY
        };

        // Translate event positions from a nested iframe
        if (e.target.ownerDocument != window.document) {
            var $iframe = $(e.target.ownerDocument).hostIframe();
            if ($iframe.length > 0) {
                var rect = $iframe.clientRect();
                mousePos.top += rect.top;
                mousePos.left += rect.left;
            }
        }

        return mousePos;
    };

    // Builds the DOM for the content node.
    // Should be overridden by subclasses.
    ModalDialog.prototype._buildContent = function () {
        this.$content = $(this.settings.content);
        this.$content.detach();
    };

    // Gets a reference to the current window.
    // This will be overriden by an iframe dialog.
    ModalDialog.prototype.getWindow = function () {
        return window;
    };

    // Gets a reference to the dialog that opened this dialog.
    // This is null if the dialog was opened by the main window.
    ModalDialog.prototype.getParent = function () {
        if (this.settings.parentId) {
            return getDialog(this.settings.parentId);
        }

        return null;
    };

    // Sets the height of the content in pixels.
    ModalDialog.prototype.center = function () {
        var pos = this._getDefaultPosition();
        this.$container.animate({
            top: pos.top
        }, 400);
    };

    // Reposition the dialog to the correct position.
    ModalDialog.prototype.pos = function (animate) {
        // stop any currently running animations
        this.$container.stop(true, true);

        var pos = this._getDefaultPosition();

        if (animate === true) {
            var top = pos.top;
            delete pos.top;
            this.$container.css(pos).animate({
                top: top
            }, 400);
        } else {
            this.$container.css(pos);
        }
    };

    // Sets the title of the dialog in the header.
    ModalDialog.prototype.setTitle = function (title) {
        this.$container.find(".dialog-header h1").text(title || "");
    };

    // Gets the title of the dialog in the header.
    ModalDialog.prototype.getTitle = function () {
        return this.$container.find(".dialog-header h1").text();
    };

    // Extends ModalDialog such that the content is an iframe.
    var IFrameDialog = function () {
        ModalDialog.apply(this, arguments);

        if (this.settings.parentId) {
            this._parentWindow = window.frames[this.settings.parentId];
        }
    };

    $.extend(IFrameDialog.prototype, ModalDialog.prototype);

    IFrameDialog.prototype.dialogType = "iframe";

    IFrameDialog.prototype._setupCustomEvent = function () {
        var evt = ModalDialog.prototype._setupCustomEvent.apply(this, arguments);
        evt.add(_crossWindowEventHandler);
    };

    // Broadcasts events to all active dialogs so any window that has a proxy for the dialog can be notified.
    var _crossWindowEventHandler = function (e) {
        // "this" is the dialog

        for (var i = 0; i < _dialogStack.length; i++) {
            if (_dialogStack[i]._postCommand) {
                _dialogStack[i]._postCommand("event" + e.type, $.extend({
                    _eventDialogId: this.settings._fullId
                }, e.data));
            }
        }
    };

    // Override the _buildContent method to construct an iframe
    IFrameDialog.prototype._finishClose = function (e) {
        ModalDialog.prototype._finishClose.call(this, e);

        this.$frame[0].src = "about:blank";
        this.$frame.remove();
    };

    IFrameDialog.prototype._destroy = function () {
        this.$el.remove();
    };

    // Override the _buildContent method to construct an iframe
    IFrameDialog.prototype._buildContent = function () {
        /* jshint quotmark:false */

        this._iframeLoadTimer = null;

        if (this.$frame && this.$frame.length > 0) {
            this.$frame.remove();
        }

        this.$frame = $('<iframe src="' + this.settings.url +
            '" name="' + this.settings._fullId +
            '" seamless allowtransparency="true" width="100%" style="height:' +
            (this.height || this.settings.initialHeight) + 'px;" class="dialog-frame" scrolling="no" frameborder="0" framespacing="0"></iframe>');

        if ($.modalDialog.iframeLoadTimeout > 0) {
            // When the iframe loads, even if its a failed status (i.e. 404), the load event will fire.
            // We expect that the dialog will call notifyReady(). If it doesn't, this timeout will
            // eventually fire, causing the open() promise to be rejected, and the dialog state to be cleaned up.
            this.$frame.on(
                "load",
                $.proxy(function () {
                        // The "open" promise has already been resolved: don't continue setting a timeout.
                        if (this._isDeferredComplete("open")) {
                            return;
                        }

                        // The iframe has $.modalDialog.iframeLoadTimeout milliseconds to call notifyReady() after the load event is called.
                        // Otherwise, the "open" promise will be rejected.
                        this._iframeLoadTimer = setTimeout(
                            $.proxy(function () {
                                if (this._isDeferredComplete("open")) {
                                    return;
                                }

                                this.$frame.remove();
                                this._resetFailed();

                                this._rejectDeferred("open", [{
                                    message: "iframe load timeout for url: " + this.settings.url
                                }]);

                            }, this),
                            $.modalDialog.iframeLoadTimeout
                        );
                    },
                    this));
        }

        this.$content = this.$frame;
    };

    IFrameDialog.prototype._alreadyBuilt = function () {
        this._buildContent();

        // TODO Need to somehow notify the dialog content that it should fire notifyReady
        this.$contentContainer.append(this.$content);
    };

    IFrameDialog.prototype.getWindow = function () {
        return this.$frame.iframeWindow()[0];
    };

    // Sends a message to the iframe content window. 
    // Used for orchestrating cross-window communication with dialog proxies.
    // * {string} command: The name of the command to send to the content window
    // * {object} data: A simple data object to serialize (as a querystring) and send with the command
    IFrameDialog.prototype._postCommand = function (command, data) {
        var messageData = {
            dialogCmd: command
        };
        if (data) {
            $.extend(messageData, data);
        }

        var message = $.param(messageData);

        this.postMessage(message);
    };

    // Sends a message to the iframe content window. 
    // Used for orchestrating cross-window communication with dialog proxies.
    // * {string} command: The name of the command to send to the content window
    // * {object} data: A simple data object to serialize (as a querystring) and send with the command
    IFrameDialog.prototype.postMessage = function (message) {
        var win = this.getWindow();

        var hostname = this.frameHostname;
        if (!hostname) {
            // Get the domain of the target window. If the URL is relative, its the same as the current page.
            hostname = this.settings.url.indexOf("http") === 0 ? this.settings.url : document.location.href;
        }

        if ($.postMessage) {
            $.postMessage(message, hostname, win);
        } else {
            win.postMessage(message, "*");
        }
    };

    IFrameDialog.prototype.setHeight = function (contentHeight, center, skipAnimation) {
        var applyChange = skipAnimation ?
                function ($content, css) { $content.css(css); } :
                function ($content, css) { $content.animate(css, { duration: 400 }); };

        applyChange(this.$content, {
            height: contentHeight
        });

        if (center) {
            var pos = this._getDefaultPosition(contentHeight);
            applyChange(this.$content, {
                top: pos.top
            });
        }

        this.height = contentHeight;
    };

    // Sets the height of the iframe to the detected height of the iframe content document.
    IFrameDialog.prototype.setHeightFromContent = function (center, skipAnimation) {
        this._postCommand("setHeightFromContent", {
            center: !! center,
            skipAnimation: !! skipAnimation
        });
    };

    // Sets the title of the dialog in the header from the HTML title tag of the iframe content document.
    IFrameDialog.prototype.setTitleFromContent = function () {
        this._postCommand("setTitleFromContent");
    };

    IFrameDialog.prototype.notifyReady = function (hostname) {
        // There may be a timer waiting for the iframe to load- cancel it.
        if (this._iframeLoadTimer) {
            clearTimeout(this._iframeLoadTimer);
            this._iframeLoadTimer = null;
        }

        this.frameHostname = hostname;

        ModalDialog.prototype._finishOpen.apply(this);
    };

    IFrameDialog.prototype._finishOpen = function () {};

    // AjaxDialog: Extends ModalDialog 
    // Loads content via ajax
    var AjaxDialog = function () {
        ModalDialog.apply(this, arguments);
    };

    $.extend(AjaxDialog.prototype, ModalDialog.prototype);

    AjaxDialog.prototype.dialogType = "ajax";

    AjaxDialog.prototype.open = function () {
        var deferred = ModalDialog.prototype.open.apply(this, arguments);

        if (!this._ajaxComplete) {
            // $.fn.partialLoad will ajax in content intelligently,
            // adding scripts, but not if they're already loaded.
            this.$content.partialLoad(
                this.settings.url,
                null,
                $.proxy(
                    function (responseText, status, xhr) {
                        this._ajaxComplete = true;

                        xhr.fail(
                            $.proxy(function () {
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
                        if (!this.settings.title) {
                            if ($title.length >= 0) {
                                this.setTitle($title.text());
                            }
                        }
                        $title.remove();

                        ModalDialog.prototype._finishOpen.call(this);
                    },
                    this)
            );
        } else {
            // The content is already loaded
            ModalDialog.prototype._finishOpen.call(this);
        }

        return deferred.promise();
    };

    AjaxDialog.prototype._finishOpen = function () {
        // no-op. Needds to wait for content to be ajaxed in asynchronously.
        // Base implementation will be called manually.
    };

    AjaxDialog.prototype._buildContent = function () {
        // Create a container and ajax content into it.
        this.$content = $("<div class='dialog-content'></div>");
    };

    AjaxDialog.prototype._destroy = function () {
        this.$el.remove();
    };

    var _dialogIdCounter = -1;
    var DIALOG_NAME_PREFIX = "dialog";

    // Determines if the specified string is a CSS selector or a URL.
    var isSelector = function (s) {
        var firstChar = s.charAt(0);
        if (firstChar == "#") {
            // This is a #anchor
            // Its a selector
            return true;
        }

        if (s.indexOf("/") >= 0) {
            // Selectors never contain /
            // This is a URL
            return false;
        }

        if (firstChar == ".") {
            var secondChar = s.charAt(1);
            if (secondChar == "." || secondChar == "/") {
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
    $.modalDialog._ensureSettings = function (explicitSettings) {
        var settings = $.extend({}, $.modalDialog.defaults);

        // An iframe dialog may have sent a reference to dialog content,
        // but it didn't know if it was a URL or a selector for a DOM node.
        // Determine which it is.
        if (explicitSettings.contentOrUrl) {
            if (isSelector(explicitSettings.contentOrUrl)) {
                explicitSettings.content = $(explicitSettings.contentOrUrl);
            } else {
                explicitSettings.url = explicitSettings.contentOrUrl;
            }

            delete explicitSettings.contentOrUrl;
        }

        // Read settings specified on the target node's custom HTML attributes
        if (explicitSettings.content) {
            var $target = $(explicitSettings.content);
            var targetSettings = $.modalDialog.getSettings($target);
            $.extend(settings, targetSettings);
        }

        // The explicitly specified settings take precedence
        $.extend(settings, explicitSettings);

        var id;

        // A fullId was specified, passed from an existing dialog's content window via a message. 
        // Calculate the parentId from the fullId.
        if (settings._fullId) {
            var idParts = settings._fullId.split("_");
            id = idParts.pop();
            if (idParts.length > 0) {
                settings.parentId = idParts.join("_");
            }
        } else {
            // Ensure a unique ID for the dialog
            id = DIALOG_NAME_PREFIX + (settings.id || ++_dialogIdCounter);

            // If a parentId was specified, this is a new dialog being created from 
            // a child dialog. The child will become the "parent dialog" of the new dialog.
            var parentId = settings.parentId ? settings.parentId + "_" : "";

            settings._fullId = parentId + id;
        }

        return settings;
    };

    $.modalDialog._areSettingsEqual = function (a, b) {
        for (var key in a) {
            if (key == "_fullId") {
                continue;
            }
            var aVal = a[key];
            var bVal = b[key];
            if (aVal !== bVal) {
                // Comparison of jQuery objects will
                // always return false because the object references are different.
                // Instead, compare the DOM nodes.
                if (aVal.jquery && bVal.jquery && aVal[0] === bVal[0]) {
                    continue;
                }
                return false;
            }
        }

        return true;
    };

    // Gets the dialog by the fullId.

    // * {string} fullId The full ID of the dialog (including all parent ids)
    var getDialog = function (fullId) {
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
    $.modalDialog.create = function (settings) {
        settings = $.modalDialog._ensureSettings(settings);

        var dialog = getDialog(settings._fullId);

        // Validate that there isn't an existing dialog open using the same content
        if (!dialog && settings.content) {
            var existingDialog = $(settings.content).modalDialogInstance();

            if (existingDialog &&
                settings._fullId &&
                existingDialog.settings._fullId !== settings._fullId &&
                existingDialog.isOpen()) {
                throw new Error("An attempt was made to create a dialog with a content node which is already assigned to another open dialog.");
            }
        }

        if (!dialog) {
            if (settings.url) {
                if (settings.content) {
                    throw new Error("Both url and content cannot be specified.");
                } else if (settings.ajax) {
                    dialog = new AjaxDialog(settings);
                } else {
                    dialog = new IFrameDialog(settings);
                }
            } else if (settings.content) {

                var $content = $(settings.content);
                if ($content.length === 0) {
                    throw new Error("ModalDialog content not found");
                }

                settings.content = $content;

                dialog = new ModalDialog(settings);

                if (!settings.destroyOnClose) {
                    $content.modalDialogInstance(dialog);
                }
            } else {
                throw new Error("No url or content node specified");
            }

            _fullIdMap[settings._fullId] = dialog;
        }

        return dialog;
    };

    // Gets the currently active dialog (topmost visually).
    $.modalDialog.getCurrent = function () {
        return _dialogStack.length > 0 ? _dialogStack[_dialogStack.length - 1] : null;
    };

    // Gets an existing dialog if it's settings match the specified setting's content node or URL
    $.modalDialog.getExisting = function (settings) {
        // Supresses warnings about using !! to coerce a falsy value to boolean
        /* jshint -W018 */

        var $content = $(settings.content);
        var isMatch;

        // Match a node dialog
        if ($content && $content.length) {
            isMatch = function (existingSettings) {
                return existingSettings.content &&
                    $(existingSettings.content)[0] === $content[0];
            };
        }
        // match an iframe or ajax dialog
        else if (settings.url) {
            isMatch = function (existingSettings) {
                return existingSettings.url &&
                    existingSettings.url === settings.url && !! existingSettings.ajax === !! settings.ajax;
            };
        }

        if (isMatch) {
            for (var key in _fullIdMap) {
                var dialog = _fullIdMap[key];
                if (isMatch(dialog.settings)) {
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

    $.fn.modalDialogInstance = function (dialog) {
        return !dialog ? this.data(JQUERY_DATA_KEY) : this.data(JQUERY_DATA_KEY, dialog);
    };

    // Idiomatic jQuery interface for node dialogs.
    $.fn.modalDialog = function (settings) {
        var dialog;

        // If the first argument is a string, it is a method name to call on the dialog
        // associated with the DOM element.
        if (typeof settings == "string") {
            var action = settings;
            dialog = this.modalDialogInstance();
            if (dialog && dialog[action]) {
                dialog[action].apply(dialog, Array.prototype.slice(arguments, 1));
            }
        }
        // Otherwise, create a new dialog.
        else {
            settings = settings || {};
            settings.content = this[0];

            dialog = $.modalDialog.create(settings);

            dialog.open();
        }

        return this;
    };

    // A map of actions that can be passed as the "dialogCmd" argument in posted messages from IFrameDialog dialog proxies.
    var messageActions = {
        setHeight: function (dialog, qs) {
            dialog.setHeight(parseInt(qs.height, 10), qs.center === "true", qs.skipAnimation === "true");
        },

        setTitle: function (dialog, qs) {

            // If settings.title is specified explicitly, it should win over
            // an iframe dialog's HTML title
            if (qs.initializing && dialog.settings.title) {
                return;
            }
            dialog.setTitle(qs.title);
        },

        open: function (dialog) {
            dialog.open();
        },

        close: function (dialog) {
            dialog.close();
        },

        create: function () {
            // do nothing- the dialog was created already
        },

        center: function (dialog) {
            dialog.center();
        },

        notifyReady: function (dialog, qs) {
            dialog.notifyReady(qs.hostname);
        }
    };

    var messageHandler = function (e) {
        var qs;

        try {
            qs = $.deparam(e.originalEvent ? e.originalEvent.data : e.data);
        } catch (ex) {
            // ignore- it wasn't a message for the dialog framework
        }

        // messages in the dialog framework contain "dialogCmd"
        if (qs && qs.dialogCmd) {
            var action = messageActions[qs.dialogCmd];
            if (action) {
                var dialog;

                if (qs._fullId) {
                    // If a fullId is passed, it can be either for a new dialog or an existing dialog.
                    // $.modalDialog.create() handles both cases.
                    dialog = $.modalDialog.create(qs);
                } else {
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

    if ($.receiveMessage) {
        $.receiveMessage(messageHandler, "*");
    } else {
        $(window).on("message", messageHandler);
    }

    // Global hook to simplify non-cross domain communication
    window._dialogReceiveMessageManual = function (message, origin) {
        if (!messageHandler({
            data: message,
            origin: origin
        })) {
            var evt = new $.Event("message");
            evt.data = message;
            evt.origin = origin;
            $(window).trigger(evt, [message, origin]);
        }
    };

    // jQuery mobile support
    $(document).ready(function () {
        if (!$.mobile) {
            return;
        }

        // Alternate defaults when jQuery mobile is loaded. Work around JQM's quirks.
        $.modalDialog.defaults = $.extend(
            $.modalDialog.defaults, {
                // JQM widgets must be in the active data-role="page" element to work
                // containerElement: ".ui-page.ui-page-active",

                // Event bubbling breaks many JQM widgets
                preventEventBubbling: false
            });
    });

})(jQuery);
