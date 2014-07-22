/// <reference path="jquery.hoverDelay.js" />
/// <reference path="jquery.proxyAll.js" />
/// <reference path="pointy.js" />
/// <reference path="pointy.gestures.js" />
// TODO: Support modifying state in the future by storing an object using $.data(), implement $(selector).dropDownMenu("option", value);
// TODO: Accessibility: Keyboard navigation (tab navigation already works)- close submenus on pressing enter (maybe)

(function ($) {
    var _skins = {};

    // Register skins by name for rendering the menu.
    $.registerDropDownMenuSkin = function (name, skin) {
        _skins[name] = skin;
    };

    // Hover highlighting
    // Adds/removes the "hover" class. Allows callers to 
    // define their own rollover states.
    // Note: We cant use CSS hover pseudo-classes because the rules
    // for Windows/MacOS style menus don't follow the same rules.
    function highlightMenuItem($item, enabled) {
        var classToAdd = enabled ? 'hover' : 'nohover';
        var classToRemove = enabled ? 'nohover' : 'hover';

        if (!$item.hasClass(classToAdd)) {
            $item.addClass(classToAdd).removeClass(classToRemove);
        }
    }

    // TODO: It would be nice to have a jQuery.findUntil(selector)
    // This is a simple substitute. Recurse until the an element is found
    // with the specified class, and then stop searching in that node.
    function findUntilInternal(elem, fnIsMatch, results) {
        if (elem.nodeType !== 1) {
            return;
        }

        if (fnIsMatch.call(elem, elem, results) === false) {
            return;
        }

        for (var i = 0, len = elem.childNodes.length; i < len; i++) {
            findUntilInternal(elem.childNodes[i], fnIsMatch, results);
        }
    }

    //jQuery wrapper
    function findUntil($elem, fnIsMatch) {
        var results = [];

        $elem.each(function () {
            findUntilInternal(this, fnIsMatch, results);
        });

        return $(results);
    }

    var _defaults = {
        // When true, the top level menu opens on mouseover (instead of on click, which is the default).
        showOnHover: true,

        // When true, and showOnHover is enabled, clicking an A tag within a menu item that contains a submenu will be allowed to navigate
        // NOTE: This option is ignored when showOnHover is false.
        linksWithSubmenusEnabled: false,

        // Event which fires when a menu item is selected.
        selected: null,

        // Event which fires before a menu panel is show. Can be used to prevent the panel from showing.
        beforeShowPanel: null,

        // Event which fires before a menu panel is hidden. Can be used to prevent the panel from hiding.
        beforeHidePanel: null,

        // Event which fires after a panel is shown.
        showPanelComplete: null,

        // Event which fires after a panel is hidden.
        hidePanelComplete: null,

        // Event which fires on show allowing you to override the animation
        animationShow: null,

        // Event which fires on hide allowing you to override the animation
        animationHide: null,

        // Event which allows overriding the positioning of a panel when it is shown. 
        // This is defined by the skin by default, but can be overridden for any instance of the menu.
        position: null,

        // The predefined skin to use for rendering this instance
        skin: 'basic'
    };

    var Panel = function MenuPanel(menu, panel, item) {
        $.proxyAll(this, 'onPress', 'onClick', 'showOnPointerOver', 'hideOnPointerOut', 'showComplete', 'hideComplete');
        var me = this;

        this.menu = menu;
        this.options = this.menu.options;
        this.$panel = $(panel);
        this.$item = item ? $(item) : this.$panel.closest('.menu-item');
        this.$parentPanel = this.$item.closest('.menu-panel');
        this.isTopLevel = this.$parentPanel.length === 0;

        this.parent = null;
        this.children = [];

        // Indicates the Panel is open (expanded)
        this.isOpen = false;

        // Indicates that the panel is in the middle of showing/hiding
        this.transitioning = false;

        // Store a reference to this instance from the DOM element
        if (this.$panel) {
            this.$panel.data('PanelInstance', this);
        }

        // signal to prevent the next click, set during a touch event
        // to prevent the click, because you cannot cancel the
        // native "click" event reliably outside of the "click" event
        // itself
        this.shouldPreventNextClick = false;

        this.$item
            // Assign a special class to distinguish menu items with a submenu from those without one.
            .addClass('menu-item-with-submenu')
            // Bind the special "press" event, when an item is tapped we determine what to do.
            .on({
                'press': this.onPress,
                'click': this.onClick
            });

        // setup pointer hover events only when the option is enabled
        if (this.options.showOnHover) {
            // Set up event handlers to control submenus appearing on hover
            this.$item.hoverDelay(this.showOnPointerOver, this.hideOnPointerOut, {
                delayOver: 200,
                delayOut: 500
            });
        }

        // Top menu items have different rules for rollovers (mimics Windows/MacOS menus)
        if (this.isTopLevel) {
            this.$item.on('pointerout', function (e) {
                if (!me.isOpen) {
                    // Prevent mouseouts when rolling over tags within the same menu item.
                    if (e.relatedTarget) {
                        if ($(this).has(e.relatedTarget).length > 0 && !$(this).is(e.relatedTarget)) {
                            return;
                        }
                    }

                    highlightMenuItem(me.$item, false);
                }
            });
        }

        // Note: It is legitimate to have a Panel object without a submenu.
        if (this.$panel) {
            // Event handler for clicking on panels.
            // Handles firing the "selected" event.
            this.$panel.on('click', function (e) {
                // Find the parent menu item of the clicked element.
                var $clickedMenuItem = $(e.target).closest('.menu-item', me.$panel);

                // If the menu item has a submenu, then it shouldn't
                // fire selected- it just opens the submenu.
                if ($clickedMenuItem && !$clickedMenuItem.hasClass('menu-item-with-submenu')) {
                    var ev = me.getEvent('selected', e);
                    ev.$selectedItem = $clickedMenuItem;
                    ev.selectedItem = $clickedMenuItem[0];

                    if (me.options.selected) {
                        me.options.selected.call(me, ev, this);
                    }

                    // Give the event handler a chance to cancel the event.
                    if (ev.isDefaultPrevented()) {
                        e.stopPropagation();
                        return;
                    }

                    // If this is a click on a leaf node, and the window is navigating, don't hide the menu.
                    if (!e.isDefaultPrevented()) {
                        return;
                    }

                    // The clicked element was a menu item with no sub-menu: hide.
                    me.menu.hideAllPanels(e);
                }

                e.stopPropagation();
            });

            // Ensure anchor tags within a menu item with a submenu get disabled
            // This flag setting allows the menu to make sub menu items
            // only open/close the submenu, and prevent navigation with clicks
            // Note: That on touch events, these sub menu links always cause
            // the sub menu to toggle.
            if (!this.options.linksWithSubmenusEnabled) {
                this.getLinksWithSubmenus().on('click', function (event) {
                    // prevent the navigation behavior
                    event.preventDefault();

                    // stop propagation to prevent this click from going to
                    // document and elements beneath this menu item
                    event.stopPropagation();
                });
            }
        }
    };

    Panel.prototype.getLinksWithSubmenus = function PanelGetLinksWithSubmenus() {
        return findUntil(this.$item, function (elem, results) {
            // Stop searching once we get to the nested panel.
            // We're only interested in A tags owned by this specific
            // menu item.
            if ($(elem).hasClass('menu-panel')) {
                return false;
            }

            // Add links found to the results
            if (elem.tagName == 'A') {
                results.push(elem);
            }

            return true;
        });
    };

    // Resolves the .parent property and adds this Panel
    // to the parent's children property.
    Panel.prototype.resolveParent = function PanelResolveParent() {
        this.parent = this.$parentPanel.data('PanelInstance') || this.menu.rootMenu;
        this.parent.children.push(this);
    };

    // Create an event for passing to event handlers
    Panel.prototype.getEvent = function PanelGetEvent(type, e) {
        return $.Event(type || 'DropDownMenuPanelEvent', {
            $panel: this.$panel,
            panel: this,
            $parentPanel: this.$parentPanel,
            parentPanel: this.$parentPanel[0],
            $item: this.$item,
            item: this.$item[0],
            level: this.getLevel(),
            innerEvent: e
        });
    };

    // Gets the level of the Panel in the heirarchy. 0 is the root menu item.
    Panel.prototype.getLevel = function PanelGetLevel() {
        if (!this._level) {
            this._level = -1; // Account for _rootMenu: first level menu should be level 0
            var current = this.parent;
            while (current) {
                current = current.parent;
                this._level++;
            }
        }

        return this._level;
    };

    // Gets an array of the siblings of this Panel (Panels with the same parent)
    Panel.prototype.getSiblings = function PanelGetSiblings() {
        var me = this;

        if (!this._siblings) {
            var _siblings = [];

            if (this.parent) {
                $.each(this.parent.children, function (i, child) {
                    if (child !== me) {
                        _siblings.push(child);
                    }
                });
            }

            this._siblings = _siblings;
        }

        return this._siblings;
    };

    // Determines if the current menu should show on hover (in addition to click)
    Panel.prototype.shouldShowSubmenuOnHover = function () {
        if (!this.isTopLevel) {
            return true;
        }

        // If this is the top menu, only react to a mouseover event
        // if we're in "hover mode" (there has already been a click),
        // or if we're in the "always on" hover mode.
        return this.menu.clickHoverActivated || this.options.showOnHover;
    };

    Panel.prototype.showOnPointerOver = function (event) {
        // In Windows/MacOS, top level menus highlight instantly, with no delay
        if (this.isTopLevel) {
            highlightMenuItem(this.$item, true);
        }

        if (!this.shouldShowSubmenuOnHover()) {
            return;
        }

        this.show(event);
    };

    Panel.prototype.hideOnPointerOut = function (event) {
        if (this.isTopLevel && !this.options.showOnHover) {
            return;
        }

        if (!this.shouldShowSubmenuOnHover()) {
            return;
        }

        this.hide(event);
    };

    // Shows the panel
    Panel.prototype.show = function PanelShow(e) {
        if (this.transitioning || this.isOpen) {
            return;
        }

        if (this.$panel) {
            var customEvent = this.getEvent('beforeShowPanel', e);

            if (this.options.beforeShowPanel) {
                this.options.beforeShowPanel.call(this, customEvent);
            }

            // Give the handler a chance to cancel the event
            if (customEvent.isDefaultPrevented()) {
                return;
            }
        }

        // Ensure that all siblings are hidden
        $.each(this.getSiblings(), function (i, sibling) {
            sibling.hide(e);
        });

        hideOtherMenus(this.menu, e);

        // Ensure the current menu item is highlighted
        highlightMenuItem(this.$item, true);

        if (!this.$panel) {
            return;
        }

        this.transitioning = true;

        // Fire the position event provided by the skin or options
        // to calculate positioning for the menu
        if (this.options.position) {
            this.options.position.call(this, this.getEvent('position', e));
        }

        // if we have a hook to override the animation we use
        if (this.options.animationShow) {
            this.options.animationShow.call(this, this.getEvent('animationShow', e), this.showComplete);
        } else {
            this.$panel.show();
            this.showComplete();
        }
    };

    Panel.prototype.showComplete = function PanelShowComplete(event) {
        this.isOpen = true;
        this.transitioning = false;

        if (this.options.showPanelComplete) {
            this.options.showPanelComplete.call(this, this.getEvent(event));
        }
    };

    Panel.prototype.hide = function PanelHide(e) {
        if (!this.isOpen || this.transitioning) {
            return;
        }

        if (this.$panel) {
            var ev = this.getEvent(e);

            if (this.options.beforeHidePanel) {
                this.options.beforeHidePanel.call(this, ev);
            }

            // Give the handler a chance to cancel the event
            if (ev.isDefaultPrevented()) {
                return;
            }
        }

        highlightMenuItem(this.$item, false);

        if (!this.$panel) {
            return;
        }

        this.transitioning = true;

        $.each(this.children, function (i, childPanel) {
            childPanel.hide(e);
        });

        if (this.options.animationHide) {
            this.options.animationHide.call(this, this.getEvent(e), this.hideComplete);
        } else {
            this.$panel.hide();
            this.hideComplete();
        }
    };

    Panel.prototype.hideComplete = function PanelHideComplete(event) {
        this.isOpen = false;
        this.transitioning = false;

        if (this.options.hidePanelComplete) {
            this.options.hidePanelComplete.call(this, this.getEvent(event));
        }
    };

    // preventClickSometimes
    // Sometimes, we need to prevent the native click event
    // it's sad, but this is the best implementation I've created
    Panel.prototype.onClick = function PanelOnClick(event) {
        // we stop propagation to prevent this click from
        // going to the document handler to close all menus
        // this also prevents the clicks from going through
        // to items below the menu
        event.stopPropagation();

        if (this.shouldPreventNextClick) {
            // compare the time difference, we only listen to this
            // prevention if it's within 200ms of the original
            // event to prevent errors
            var timeDiff = +(new Date()) - this.shouldPreventNextClick;

            // reset the trigger
            this.shouldPreventNextClick = false;

            // if the time difference is less than 1000ms (1s)
            if (timeDiff < 1000) {
                // prevent default to prevent navigation (possibly)
                event.preventDefault();
            }
        }
    };

    Panel.prototype.onPress = function (e) {
        // we always want to stop the propagation to parent elements,
        // this can cause the inner leaf items to close sub menus,
        // or close the menus if it reaches the root document or
        // just cause double-trigger if the target was the <a> when the
        // handler is on the <li>
        e.stopPropagation();

        // if this is a mouse click, we do not want to interrupt normal navigation
        // if there is no panel it should act like a regular link, always.
        if (!this.$panel || e.pointerType == 'mouse') {
            return;
        }

        // determine if this event has bubbled
        if (this.$panel.length > 0) {
            var $closestPanel = $(e.target).closest('.menu-panel');
            if ($closestPanel.length > 0 && $closestPanel[0] === this.$panel[0]) {
                this.shouldPreventNextClick = false;

                // This event bubbled from a child panel's link (a leaf menu item).
                // It doesn't have a Panel object of its own, so it should act like a regular link.
                return;
            }
        }

        // For touch events that aren't from leaf menu items,
        // cancel the default event so touching the menu doesn't cause navigation.
        this.shouldPreventNextClick = +(new Date());
        e.preventDefault();

        if (this.transitioning) {
            return;
        }

        if (this.isTopLevel) {
            this.menu.clickHoverActivated = true;
        }

        this[this.isOpen ? 'hide' : 'show'](e);

        if (this.isTopLevel) {
            this.menu.ignoreDocumentClick = +(new Date());
        }
    };

    // force this panel to hide itself
    Panel.prototype.forceHide = function (event) {
        this.menu.clickHoverActivated = false;
        this.hide(event);
    };

    /**
     * Creates a menu "group" from a jQuery collection of top-level
     * menu items. This will be called once for each element in the
     * top level jQuery object's collection.
     *
     * Menus are actually the "root" panel, and contain an array of sub panels.
     * Each Panel contains the actual menu items (links).
     */
    var Menu = function ($topLevelItems, options) {
        var me = this;

        this.options = options;

        // Assign a CSS class to help distinguish between top-level
        // and sub menus.
        this.$topLevelItems = $topLevelItems.addClass('menu-item-top');

        // array of all Panel instances within this menu
        this.panels = [];

        // The menu panel heirarchy root element
        this.rootMenu = {
            parent: null,
            children: []
        };

        // When a top menu button is clicked, the menu
        // begins to react to hover events (mimics Windows/MacOS menus).
        this.clickHoverActivated = false;

        // Used to signal the document click handler that 
        // the click came from the menu, so it should be ignored.
        this.ignoreDocumentClick = false;

        // Create a Panel instance for each menu panel, store in an array
        this.$topLevelItems.find('.menu-panel').each(function (i, panelElement) {
            me.panels.push(new Panel(me, panelElement));
        });

        // Top level items without a submenu need a Panel instance as well, to interact with other top level items.
        this.$topLevelItems.not('.menu-item-with-submenu').each(function (i, panelElement) {
            me.panels.push(new Panel(me, null, panelElement));
        });

        // Build a tree representing the parent/child relationships in the menu
        $.each(this.panels, function (i, panel) {
            panel.resolveParent();
        });

        // Set up rollovers on the menu items.
        // Note: This does not include the top level items with submenus, which have different
        // rules for rollovers. jQuery.find() only includes decendants, no the current set,
        // which is the top level menu items.
        //
        // we use hoverDelay because it internally filters out touch-based pointer events
        this.$topLevelItems.find('.menu-item').hoverDelay(
            function () {
                highlightMenuItem($(this), true);
            },
            function () {
                highlightMenuItem($(this), false);
            }
        )
        .each(function () {
            highlightMenuItem($(this), false);
        });

        // Bind a handler to close the menu if it is clicked off.
        $(document).on('click', $.proxy(this.onDocumentClick, this));
    };

    // Hides all menus and submenus
    Menu.prototype.hideAllPanels = function (event) {
        this.ignoreDocumentClick = +(new Date());

        $.each(this.rootMenu.children, function (i, child) {
            child.forceHide(event);
        });
    };

    // On any document click outside of a menu, we close all
    // other menus on the page. This is the click handler
    // attached to the document click event to do so.
    Menu.prototype.onDocumentClick = function documentClickHandler(e) {
        // Check a flag which indicates the click is from the menu itself
        if (this.ignoreDocumentClick) {
            // store the time difference, we only listen to this
            // prevention if it's within 200ms of the original
            // event to prevent errors
            var timeDiff = +(new Date()) - this.ignoreDocumentClick;

            this.ignoreDocumentClick = false;

            if (timeDiff < 200) {
                return;
            }
        }

        this.hideAllPanels(e);
    };

    // Dropdown menu plugin. The jQuery element collection should include
    // top-level container elements which in turn contain items with class "menu-item".
    // Each item in the jQuery collection becomes a menu "group".
    $.fn.dropDownMenu = function (options) {
        if (this.length === 0) {
            return this;
        }

        // Map skin from the registered skin collection
        var _skin = _skins[options.skin];
        if (!_skin) {
            throw new Error('Invalid dropDownMenu skin: ' + options.skin);
        }

        // Merge explicit options with skin and defaults
        var _options = $.extend({}, _defaults, _skin || {}, options);

        // Resolve conflicting options
        if (!_options.showOnHover) {
            _options.linksWithSubmenusEnabled = false;
        }

        // Loop through each menu container and create a menu 'group'.
        this.each(function () {
            // Find all the top-level menu items within the container.
            var $topLevelItems = findUntil($(this), function (elem, results) {
                if ($(elem).hasClass('menu-item')) {
                    results.push(elem);
                    return false;
                }

                return true;
            });

            // Invoke the create menu function with a jQuery object
            // containing all the top level menu items.
            _menus.push(new Menu($topLevelItems, _options));
        });

        // Allow the jQuery chain to remain unbroken.
        return this;
    };

    var _menus = [];

    // Hide all other menus
    function hideOtherMenus(ignoreMenu, e) {
        $.each(_menus, function (i, menu) {
            if (!ignoreMenu || ignoreMenu !== menu) {
                menu.hideAllPanels(e);
            }
        });
    }
})(jQuery);