// ## jQuery.modalDialog

// ### Documentation
// Full documentation is available at <http://labaneilers.github.io/SkinnyJS/modal-dialogs.html>

// Note: jQuery Mobile and some other dialog frameworks have URL/history management via pushState/hashchange built in.
// I find this to be too inflexible, and should be implemented by callers as a separate concern.

// ### Source

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

(function ($)
{
    if ($.modalDialog && $.modalDialog._isContent)
    {
        throw new Error("Attempt to load jquery.modalDialogContent.js in the same window as jquery.modalDialog.js.");
    }

    var MARGIN = 10; // @see MARGIN in jquery.modalDialog.less
    var DURATION = 600;
    var STARTING_TOP = "-700px";

    // A stack of dialogs in display order
    var _dialogStack = [];

    // A map of dialogs by full ID
    var _fullIdMap = {};

    var zIndex = 10000;

    // Default values
    var _defaults = {
        title: "", // The title to display in the title bar of the dialog
        maxWidth: 600, // Sets the maximum width of the dialog. Note that on small mobile devices, the actual width may be smaller, so you should design the dialog content accordingly
        initialHeight: 100, // Only FramedModalDialog uses this. Consider this internal for now.
        skin: "primary", // The name of the skin to use for the dialog
        ajax: false, // Determines how the url setting is interpreted. If true, the URL is the source for an AJAX dialog. If false, it will be the URL of an IFrame dialog
        url: null, // The URL for the content of an IFrame or AJAX dialog
        content: null, // A CSS selector or jQuery object for a content node to use for a node dialog
        destroyOnClose: false, // If true, the dialog DOM will be destroyed and all events removed when the dialog closes
        containerElement: "body", // A CSS selector or jQuery object for the element that should be the parent for the dialog DOM (useful for working with jQuery mobile)
        preventEventBubbling: true, // If true, click and touch events are prevented from bubbling up to the document
        onopen: null,
        onclose: null,
        onbeforeclose: null,
        onajaxerror: null
    };

    // If the jquery.transit library is loaded, use CSS3 transitions instead of jQuery.animate()
    var _animateMethod = $.fn.transition ? "transition" : "animate";
    var _easing = $.fn.transition ? "out" : "swing";

    var _ua = $.modalDialog._ua;

    // Class which creates a jQuery mobile dialog
    var ModalDialog = function(settings)
    {
        this.settings = settings;
        this.parent = $(this.settings.containerElement || 'body');

        // Creates event objects on the dialog and copies handlers from settings
        $.each(["open", "beforeopen", "close", "beforeclose", "ajaxerror"], $.proxy(this._setupCustomEvent, this));

        // Bind methods called as handlers so "this" works
        $.proxyAll(this, "_drag", "_startDrag", "_stopDrag", "_close");
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

    // Opens the dialog
    ModalDialog.prototype.open = function()
    {
        // TODO: Re-evaluate settings, change DOM if settings have changed.

        // Ensure the dialog doesn't open once its already opened.. 
        // Otherwise, you could end up pushing it on to the stack more than once.
        if (this._open)
        {
            return;
        }

        // Description
        this.level = _dialogStack.length;

        // Fire onbeforeopen on this instance
        var evt = this.onbeforeopen.fire();
        if (evt.isDefaultPrevented())
        {
            return;
        }

        // Fire onbeforeopen globally
        evt = $.modalDialog.onbeforeopen.fire(null, this);
        if (evt.isDefaultPrevented())
        {
            return;
        }

        // Keep track of the dialog stacking order
        _dialogStack.push(this);

        this._open = true;

        this._build();

        // add or remove the 'smallscreen' class (which can also be checked using CSS media queries)
        this.$container.stop()[_ua.isSmallScreen() ? 'addClass' : 'removeClass' ]("smallscreen");

        this.$el.show();

        this._showLoadingIndicator();

        this._finishOpenAction = function()
        {
            this.$bg.addClass($.modalDialog.veilClass);

            var initialPos = this._getDefaultPosition(),
                initialTop = initialPos.top;
            initialPos.top = STARTING_TOP; // we're going to animate this to slide down
            this.$container.css(initialPos);

            // Animate with a CSS transition
            this.$container[_animateMethod](
                { top: initialTop },
                DURATION,
                _easing,
                $.proxy(function()
                {
                    this.$el.addClass("dialog-visible");

                    if (_ua.isSmallScreen())
                    {
                        // TODO: I question this change. Should it be decoupled from the dialog framework?
                        // It could be put into mobile fixes.
                        // Is this even mobile specific?
                        // Original comment:
                        // Force dialogs that are on small screens to trigger a window resize event when closed, just in case we have resized since the dialog opened.

                        this.triggerWindowResize = false;
                        this._orientationchange = $.proxy(function(event) {
                            this.triggerWindowResize = true;
                            return this.pos(event);
                        }, this);

                        $(window).on("orientationchange resize", this._orientationchange);
                    }

                    this.onopen.fire();

                    $.modalDialog.onopen.fire(null, this);
                }, this)
            );

            this._hideLoadingIndicator();
        };

        this._finishOpen();
        return this;
    };

    ModalDialog.prototype._finishOpen = function()
    {
        if (this._finishOpenAction)
        {
            this._finishOpenAction();
            this._finishOpenAction = null;
        }
    };

    ModalDialog.prototype._showLoadingIndicator = function()
    {
        if (!this.$loadingIndicator)
        {
            this.$loadingIndicator = $("<div class='dialog-loading-indicator'><span></span></div>")
                .appendTo(this.$bg)
                .css('z-index', parseInt(this.$bg.css('z-index'), 10) + 1);
        }
    };

    ModalDialog.prototype._hideLoadingIndicator = function()
    {
        this.$loadingIndicator.remove();
        this.$loadingIndicator = null;
    };

    // Closes the dialog. 
    // isDialogCloseButton Indicates the cancel button in the dialog's header was clicked.
    ModalDialog.prototype.close = function(isDialogCloseButton)
    {
        if ($.modalDialog.getCurrent() !== this)
        {
            throw new Error("Can't close a dialog that isn't currently displayed on top.");
        }

        var eventSettings = { isDialogCloseButton: !!isDialogCloseButton };

        // Expose an event allowing consumers to cancel the close event
        if (this.onbeforeclose.fire(eventSettings).isDefaultPrevented())
        {
            return;
        }

        // Expose a global event
        if ($.modalDialog.onbeforeclose.fire(eventSettings, this).isDefaultPrevented())
        {
            return;
        }

        if ($.modalDialog.getCurrent() === this)
        {
            _dialogStack.pop();
        }

        this.$el.removeClass("dialog-visible");
        this.$container[_animateMethod](
            {top: STARTING_TOP},
            DURATION,
            _easing,
            $.proxy(this._finishClose, this, eventSettings)
        );

        // unbind global event listeners
        if (this._orientationchange)
        {
            $(window).off("orientationchange resize", this._orientationchange);
        }
    };

    ModalDialog.prototype._close = function(e)
    {
        e.preventDefault();
        this.close(true);
    };

    ModalDialog.prototype._finishClose = function(e)
    {
        this._open = false;

        this.$bg.removeClass($.modalDialog.veilClass);
        this.$el.hide();

        if (this.settings.destroyOnClose)
        {
            this._destroy();
            this._destroyed = true;
            delete _fullIdMap[this.settings._fullId];
        }

        this.onclose.fire(e);

        $.modalDialog.onclose.fire(e, this);

        if (_ua.isSmallScreen() && this.triggerWindowResize)
        {
            $(window).trigger('resize');
        }
    };

    ModalDialog.prototype._destroy = function()
    {
        // Put the content node back on the body.
        // It could be used again.
        this.$content.detach().appendTo("body");
        this.$el.remove();
    };

    // Builds the DOM for the dialog chrome
    ModalDialog.prototype._build = function()
    {
        if (this._destroyed)
        {
            throw new Error("This dialog has been destroyed");
        }

        if (!this.$el)
        {
            this.$bg = $('<div class="dialog-background"></div>').css('z-index', ++zIndex);

            // increase the z-index again to consider the loading indicator
            zIndex++;

            this.$container = $(
                '<div class="dialog-container" id="' + this.settings._fullId + 'Container">' +
                '  <div class="dialog-header">' +
                '    <a href="#" class="dialog-close-button"><span class="dialog-close-button-icon"></span></a>' +
                '    <h1>' + this.settings.title + '</h1>' +
                '  </div>'+
                '  <div class="dialog-content-container">' +
                '  </div>' +
                '</div>'
            ).css('z-index', ++zIndex);

            this.$el = $([this.$bg[0], this.$container[0]]).addClass('dialog-skin-' + this.settings.skin);

            // Figure out where to put the dialog DOM. In jQuery mobile, the root element needs to be specific.
            // It's not for us to fix developer problems, if the container doesn't exist, this will break
            this.parent.append(this.$bg, this.$container);

            if (!this.parent.is('body') && !this.parent.hasClass('ui-page-active')) {
                this.$bg.css('position', 'absolute');

                if (this.parent.css('position') == 'static') {
                    this.parent.css('position', 'relative');
                }
            }

            /*          
            if (this.settings.preventEventBubbling)
            {
                this.$el.on("click mousemove mousedown mouseup touchstart touchmove touchend", function(e) { e.stopPropagation(); });
            }
            */

            this.$contentContainer = this.$el.find(".dialog-content-container");
            this.$header = this.$el.find(".dialog-header");
            this.$closeButton = this.$el.find(".dialog-close-button").on("click", this._close);

            this._buildContent();

            this.$content.find('*[data-action="close"]').on('click', this._close);

            this.$contentContainer.append(this.$content);

            // only enable dragging if the dialog is over the entire window
            // and we are not in Internet Explorer 7, because it handles positioning oddly.
            if ((this.parent.is('body') || this.parent.hasClass('ui-page-active')) && !_ua.ie7) {
                this._makeDraggable();
            }
        }
        else
        {
            this._alreadyBuilt();
        }
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

    ModalDialog.prototype._getDefaultPosition = function(contentHeight)
    {
        var $win = $(window),
            windowWidth = this.parent.is('body') ? window.innerWidth || $win.width() : this.parent.width(),
            pos = {};

        pos.width = Math.min(windowWidth - (MARGIN * 2), this.settings.maxWidth);
        pos.top = $(document).scrollTop() + MARGIN;
        pos.left = (windowWidth - pos.width) / 2;

        if (_ua.ie7) {
            pos.top = MARGIN;
        }

        if (_ua.isSmallScreen()) {
            if (this.settings.skin == 'lightbox') {
                pos.width = '100%';
                pos.left = 0;
            }
        }

        // For small mobile devices, always position at the top.
        // No need to consider contentHeight.

        // For larger devices, center vertically.
        else
        {
            contentHeight = contentHeight || this.$content.height();

            // Get the new container height with the proposed content height
            var containerHeight = this._getChromeHeight() + contentHeight;

            var parentHeight = this.parent.is('body') ? $(window).height() : this.parent.height();
            var idealTop = (parentHeight / 2) - (containerHeight / 2);

            pos.top = Math.max(idealTop, pos.top);
        }

        return pos;
    };

    ModalDialog.prototype._makeDraggable = function()
    {
        // Small devices shouldn't have the dialog be draggable.
        // Where you gonna drag to?

        if (_ua.isSmallScreen())
        {
            return;
        }

        this.$header.addClass('draggable').on("mousedown touchstart", this._startDrag);
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

        this.$container.on("mousemove touchmove", this._drag);

        // make sure the mouseup also works on the background
        this.$bg.on("mouseup touchend", this._stopDrag);

        //chrome node is the last element that can handle events- it has cancel bubble set
        this.$container.on("mouseup touchend", this._stopDrag);

        if (this.$frame)
        {
            try
            {
                this.$frame.iframeDocument().find("body")
                    .on("mousemove touchmove", this._drag)
                    .on("mouseup touchend", this._stopDrag);
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
        this.$el.off("mousemove touchmove", this._drag);
        this.$el.off("mouseup touchend", this._stopDrag);
        this.$container.off("mouseup touchend", this._stopDrag);

        if (this.$frame)
        {
            try
            {
                this.$frame.iframeDocument().find("body")
                    .off("mousemove touchmove", this._drag)
                    .off("mouseup touchend", this._stopDrag);
            }
            catch (ex) { }
        }

        this._isDragging = false;
    };

    // Gets the current mouse position from the event object.
    // returns an object with top and left
    var getMousePos = function(e)
    {
        var touches = e.originalEvent.touches;

        if (touches && touches.length >= 0)
        {
            e = touches.item(0); 
        }

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
        this.$container.stop();

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

    // Extends ModalDialog such that the content is an iframe.
    var FramedModalDialog = function(settings)
    {
        ModalDialog.apply(this, arguments);

        if (this.settings.parentId)
        {
            this._parentWindow = window.frames[this.settings.parentId];
        }
    };

    $.extend(FramedModalDialog.prototype, ModalDialog.prototype);

    FramedModalDialog.prototype.dialogType = "iframe";

    FramedModalDialog.prototype._setupCustomEvent = function(eventName)
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
            _dialogStack[i]._postMessageToContent("event" + e.type, $.extend({ _eventDialogId: this.settings._fullId}, e.data));
        }
    };

    // Override the _buildContent method to construct an iframe
    FramedModalDialog.prototype._finishClose = function(e)
    {
        ModalDialog.prototype._finishClose.call(this, e);

        this.$frame.remove();
    };

    FramedModalDialog.prototype._destroy = function()
    {
        this.$el.remove();
    };

    // Override the _buildContent method to construct an iframe
    FramedModalDialog.prototype._buildContent = function()
    {
        this.$frame = $('<iframe src="' + this.settings.url + '" name="' + this.settings._fullId + '" seamless allowtransparency="true" width="100%" style="height:' + this.settings.initialHeight + 'px;" class="dialog-frame" scrolling="no" frameborder="0" framespacing="0" />');
        this.$content = this.$frame;
    };

    FramedModalDialog.prototype._alreadyBuilt = function()
    {
        var $frame = this.$frame;

        this._buildContent();

        this.$contentContainer.append(this.$content);
    };

    FramedModalDialog.prototype.getWindow = function()
    {
        return this.$frame.iframeWindow()[0];
    };

    // Sends a message to the iframe content window. 
    // Used for orchestrating cross-window communication with dialog proxies.
    // * {string} command: The name of the command to send to the content window
    // * {object} data: A simple data object to serialize (as a querystring) and send with the command
    FramedModalDialog.prototype._postMessageToContent = function(command, data)
    {
        var messageData = { dialogCmd: command };
        if (data)
        {
            $.extend(messageData, data);
        }

        var win = this.getWindow();
        var message = $.param(messageData);

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

    FramedModalDialog.prototype.setHeight = function(contentHeight, center, skipAnimation)
    {
        var maxContainerHeight = $(window).height() - (MARGIN * 2);
        var maxContentHeight = maxContainerHeight - this._getChromeHeight();

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
    FramedModalDialog.prototype.setHeightFromContent = function(center, skipAnimation)
    {
        this._postMessageToContent("setHeightFromContent", { center: !!center, skipAnimation: !!skipAnimation});
    };

    // Sets the title of the dialog in the header from the HTML title tag of the iframe content document.
    FramedModalDialog.prototype.setTitleFromContent = function(command, data)
    {
        this._postMessageToContent("setTitleFromContent");
    };

    FramedModalDialog.prototype.notifyReady = function(hostname)
    {
        this.settings.frameHostname = hostname;

        ModalDialog.prototype._finishOpen.apply(this);
    };

    FramedModalDialog.prototype._finishOpen = function()
    {
    };

    // AjaxModalDialog: Extends ModalDialog 
    // Loads content via ajax
    var AjaxModalDialog = function(settings)
    {
        ModalDialog.apply(this, arguments);
    };

    $.extend(AjaxModalDialog.prototype, ModalDialog.prototype);

    AjaxModalDialog.prototype.dialogType = "ajax";

    AjaxModalDialog.prototype.open = function()
    {
        ModalDialog.prototype.open.apply(this, arguments);

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

                        if (xhr.isRejected())
                        {
                            this.onajaxerror.fire({ 
                                xhr: xhr, 
                                status: status, 
                                responseText: responseText
                            });
                        }

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
    };

    AjaxModalDialog.prototype._finishOpen = function()
    {
        // no-op. Needds to wait for content to be ajaxed in asynchronously.
        // Base implementation will be called manually.
    };

    AjaxModalDialog.prototype._buildContent = function()
    {
        // Create a container and ajax content into it.
        this.$content = $("<div class='dialog-content'></div>");
    };

    AjaxModalDialog.prototype._destroy = function()
    {
        this.$el.remove();
    };

    var _dialogIdCounter = -1;
    var DIALOG_NAME_PREFIX = "dialog";

    //Takes a settings object and calculates derived settings.
    //Settings go in order:

    // 1. default value
    // 2. setting provided on content element
    // 3. settings passed
    var ensureSettings = function(explicitSettings)
    {
        var settings = $.extend({}, _defaults);

        // Read settings specified on the target node's custom HTML attributes
        if (explicitSettings.content)
        {
            var $target = $(explicitSettings.content);
            var targetSettings = $.modalDialog.getSettings($target);
            $.extend(settings, targetSettings);
        }

        // The explicitly specified settings take precidence
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
    $.modalDialog.veilClass = _ua.isSmallScreen() ? 'dialog-veil-opaque' : 'dialog-veil';

    // Creates a new dialog from the specified settings.
    $.modalDialog.create = function(settings)
    {
        settings = ensureSettings(settings);

        var dialog = getDialog(settings._fullId);

        if (!dialog && settings.content)
        {
            dialog = $(settings.content).modalDialogInstance();
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
                    dialog = new AjaxModalDialog(settings);
                }
                else
                {
                    dialog = new FramedModalDialog(settings);
                }
            }
            else if (settings.content)
            {
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

    // A map of actions that can be passed as the "dialogCmd" argument in posted messages from FramedModalDialog dialog proxies.
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

        create: function(dialog, qs)
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
            //ignore- it wasn't a message for the dialog framework
        }

        if (!qs.dialogCmd)
        {
            //ignore- it wasn't a message for the dialog framework
            return;
        }

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
        }
    };

    if ($.receiveMessage)
    {
        $.receiveMessage(messageHandler, "*");
    }
    else
    {
        $(window).on("message", messageHandler);
    }

    // Global hook to simplify non-cross domain communication
    window._dialogReceiveMessageManual = function(message, senderOrigin)
    {
        messageHandler({
            data: message,
            origin: senderOrigin
        });
    };

    // jQuery mobile support
    $(document).ready(function()
    {
        if (!$.mobile)
        {
            return;
        }

        // Alternate defaults when jQuery mobile is loaded. Work around JQM's quirks.
        _defaults =  $.extend(
            _defaults,
            {
                // JQM widgets must be in the active data-role="page" element to work
                // containerElement: ".ui-page.ui-page-active",

                // Event bubbling breaks many JQM widgets
                preventEventBubbling: false
            });
    });

})(jQuery);
