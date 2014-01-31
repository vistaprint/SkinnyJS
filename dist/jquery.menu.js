/// <reference path="jquery.hoverDelay.js" />
/// <reference path="jquery.pointerEvents.js" />
/// <reference path="jquery.pointerGestures.js" />
// TODO: Support modifying state in the future by storing an object using $.data(), implement $(selector).dropDownMenu("option", value);
// TODO: Accessibility: Keyboard navigation (tab navigation already works)- close submenus on pressing enter (maybe)

(function ($) {
    var _skins = {};

    // Register skins by name for rendering the menu.
    $.registerDropDownMenuSkin = function (name, skin) {
        _skins[name] = skin;
    };

    // Hover highlighting
    function highlightMenuItem($item, enabled) {
        var classToAdd = enabled ? "hover" : "nohover";
        var classToRemove = enabled ? "nohover" : "hover";

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
        skin: "basic"
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
            throw new Error("Invalid dropDownMenu skin: " + options.skin);
        }

        // Merge explicit options with skin and defaults
        var _options = $.extend({}, _defaults, _skin || {}, options);

        // Resolve conflicting options
        if (!_options.showOnHover) {
            _options.linksWithSubmenusEnabled = false;
        }

        // Creates a menu "group" from a jQuery collection of top-level
        // menu items. This will be called once for each element in the
        // top level jQuery object's collection.
        function createMenuFromTopMenuItems($topLevelItems) {
            // Assign a CSS class to help distinguish between top-level
            // and sub menus.
            $topLevelItems.addClass("menu-item-top");

            var _panels = [];

            // The menu panel heirarchy root element
            var _rootMenu = {
                parent: null,
                children: []
            };

            // When a top menu button is clicked, the menu
            // begins to react to hover events (mimics Windows/MacOS menus).
            var _clickHoverActivated = false;

            // Used to signal the document click handler that 
            // the click came from the menu, so it should be ignored.
            var _ignoreDocumentClick = false;

            var Panel = function Panel($panel, $item) {
                var me = this;

                this.$panel = $panel;
                this.$item = $item || $panel.closest(".menu-item");
                this.$parentPanel = this.$item.closest(".menu-panel");
                this.isTopLevel = this.$parentPanel.length === 0;

                this.parent = null;
                this.children = [];

                // Indicates the Panel is open (expanded)
                this.isOpen = false;

                // Indicates that the panel is in the middle of showing/hiding
                this.transitioning = false;

                // Store a reference to this instance from the DOM element
                if (this.$panel) {
                    this.$panel.data("PanelInstance", this);
                }

                // Bind event handlers to DOM elements
                function init() {
                    // Assign a special class to distinguish menu items with a submenu from those without one.
                    me.$item.addClass("menu-item-with-submenu");

                    // Bind the special "press" event, when an item is tapped we determine what to do.
                    me.$item.on({
                        "press": toggleClick,
                        "click": preventClickSometimes
                    });

                    // setup pointer hover events only when the option is enabled
                    if (_options.showOnHover) {
                        // Set up event handlers to control submenus appearing on hover
                        me.$item.hoverDelay(showOnPointerOver, hideOnPointerOut, {
                            delayOver: me.isTopLevel && !_options.showOnHover ? 0 : 200,
                            delayOut: 500
                        });
                    }

                    // Top menu items have different rules for rollovers (mimics Windows/MacOS menus)
                    if (me.isTopLevel) {
                        me.$item.on("pointerout", function (e) {
                            if (!me.isOpen) {
                                // Prevent mouseouts when rolling over tags within the same menu item.
                                if (e.relatedTarget) {
                                    if ($(this).has(e.relatedTarget).length > 0 && !$(this).is(e.relatedTarget)) {
                                        return;
                                    }
                                }

                                highlight(false);
                            }
                        });
                    }

                    // Note: It is legitimate to have a Panel object without a submenu.
                    if (me.$panel) {
                        // Event handler for clicking on panels.
                        // Handles firing the "selected" event.
                        me.$panel.click(function (e) {
                            // Find the parent menu item of the clicked element.
                            var $clickedMenuItem = $(e.target).closest(".menu-item", me.$panel);

                            if ($clickedMenuItem) {
                                // If the menu item has a submenu, then it shouldn't
                                // fire selected- it just opens the submenu.
                                if (!$clickedMenuItem.hasClass("menu-item-with-submenu")) {
                                    var ev = getEvent(e);
                                    ev.$selectedItem = $clickedMenuItem;
                                    ev.selectedItem = $clickedMenuItem[0];

                                    if (_options.selected) {
                                        _options.selected.call(this, ev);
                                    }

                                    // Give the event handler a chance to cancel the event.
                                    if (ev.cancel) {
                                        e.stopPropagation();
                                        return;
                                    }

                                    // If this is a click on a leaf node, and the window is navigating, don't hide the menu.
                                    if (!e.isDefaultPrevented()) {
                                        return;
                                    }

                                    // The clicked element was a menu item with no sub-menu: hide.
                                    hideAllClick(e);
                                }
                            }

                            e.stopPropagation();
                        });

                        // Ensure a tags within a menu item with a submenu get disabled
                        // This flag setting allows the menu to make sub menu items
                        // only open/close the submenu, and prevent navigation with clicks
                        // Note: That on touch events, these sub menu links always cause
                        // the sub menu to toggle.
                        if (!_options.linksWithSubmenusEnabled) {
                            getLinksWithSubmenus().on("click", function (event) {
                                // prevent the navigation behavior
                                event.preventDefault();

                                // stop propagation to prevent this click from going to
                                // document and elements beneath this menu item
                                event.stopPropagation();
                            });
                        }
                    }
                }

                function getLinksWithSubmenus() {
                    return findUntil(me.$item, function (elem, results) {
                        // Stop searching once we get to the nested panel.
                        // We're only interested in A tags owned by this specific
                        // menu item.
                        if ($(elem).hasClass("menu-panel")) {
                            return false;
                        }

                        // Add links found to the results
                        if (elem.tagName == "A") {
                            results.push(elem);
                        }

                        return true;
                    });
                }

                // Resolves the .parent property and adds this Panel
                // to the parent's children property.
                this.resolveParent = function resolveParent() {
                    me.parent = me.$parentPanel.data("PanelInstance") || _rootMenu;
                    me.parent.children.push(me);
                };

                var _level = null;

                // Gets the level of the Panel in the heirarchy. 0 is the root menu item.
                this.getLevel = function getLevel() {
                    if (_level === null) {
                        _level = -1; // Account for _rootMenu: first level menu should be level 0
                        var current = me.parent;
                        while (current) {
                            current = current.parent;
                            _level++;
                        }
                    }

                    return _level;
                };

                var _siblings;

                // Gets an array of the siblings of this Panel (Panels with the same parent)
                this.getSiblings = function getSiblings() {
                    if (!_siblings) {
                        _siblings = [];
                        if (me.parent) {
                            $.each(me.parent.children, function () {
                                if (this !== me) {
                                    _siblings.push(this);
                                }
                            });
                        }
                    }

                    return _siblings;
                };

                // TODO use a jQuery event
                // Creates a new "fake" event for passing to event handlers
                function getEvent(e) {
                    return {
                        $panel: me.$panel,
                        panel: me,
                        $parentPanel: me.$parentPanel,
                        parentPanel: me.$parentPanel[0],
                        $item: me.$item,
                        item: me.$item[0],
                        level: me.getLevel(),
                        innerEvent: e,
                        preventDefault: function () {
                            this.cancel = true;
                        }
                    };
                }

                // Adds/removes the "hover" class. Allows callers to 
                // define their own rollover states.
                // Note: We cant use CSS hover pseudo-classes because the rules
                // for Windows/MacOS style menus don't follow the same rules.
                function highlight(enabled) {
                    highlightMenuItem(me.$item, enabled);
                }

                // Determines if the current menu should show on hover (in addition to click)
                function shouldShowSubmenuOnHover() {
                    if (!me.isTopLevel) {
                        return true;
                    }

                    // If this is the top menu, only react to a mouseover event
                    // if we're in "hover mode" (there has already been a click),
                    // or if we're in the "always on" hover mode.
                    return _clickHoverActivated || _options.showOnHover;
                }

                function showOnPointerOver(e) {
                    // In Windows/MacOS, top level menus highlight instantly, with no delay
                    if (me.isTopLevel) {
                        highlight(true);
                    }

                    if (!shouldShowSubmenuOnHover()) {
                        return;
                    }

                    me.show(e);
                }

                function hideOnPointerOut(e) {
                    if (me.isTopLevel && !_options.showOnHover) {
                        return;
                    }

                    if (!shouldShowSubmenuOnHover()) {
                        return;
                    }

                    me.hide(e);
                }

                // Shows the panel
                this.show = function show(e) {
                    if (me.transitioning || me.isOpen) {
                        return;
                    }

                    var ev;

                    if (me.$panel) {
                        ev = getEvent(e);

                        if (_options.beforeShowPanel) {
                            _options.beforeShowPanel.call(me, ev);
                        }

                        // Give the handler a chance to cancel the event
                        if (ev.cancel) {
                            return;
                        }
                    }

                    // Ensure that all siblings are hidden
                    $.each(me.getSiblings(), function () {
                        this.hide(e);
                    });

                    hideOtherMenus(e);

                    // Ensure the current menu item is highlighted
                    highlight(true);

                    if (!me.$panel) {
                        return;
                    }

                    me.transitioning = true;

                    // Hook for positioning strategies
                    ev = getEvent(e);

                    // Fire the position event provided by the skin or options
                    // to calculate positioning for the menu
                    if (_options.position) {
                        _options.position(ev);
                    }

                    // if we have a hook to override the animation we use
                    if (_options.animationShow) {
                        _options.animationShow.call(me, ev, showComplete);
                    } else {
                        $panel.show();
                        showComplete();
                    }
                };

                function showComplete(e) {
                    me.isOpen = true;
                    me.transitioning = false;

                    if (_options.showPanelComplete) {
                        _options.showPanelComplete.call(me, getEvent(e));
                    }
                }

                this.hide = function hide(e) {
                    if (!me.isOpen || me.transitioning) {
                        return;
                    }

                    if (me.$panel) {
                        var ev = getEvent(e);

                        if (_options.beforeHidePanel) {
                            _options.beforeHidePanel.call(me, ev);
                        }

                        // Give the handler a chance to cancel the event
                        if (ev.cancel) {
                            return;
                        }
                    }

                    highlight(false);

                    if (!me.$panel) {
                        return;
                    }

                    me.transitioning = true;

                    $.each(me.children, function () {
                        this.hide(e);
                    });

                    if (_options.animationHide) {
                        _options.animationHide.call(me, getEvent(e), hideComplete);
                    } else {
                        $panel.hide();
                        hideComplete();
                    }
                };

                function hideComplete(e) {
                    me.isOpen = false;
                    me.transitioning = false;

                    if (_options.hidePanelComplete) {
                        _options.hidePanelComplete.call(me, getEvent(e));
                    }
                }

                // signal to prevent the next click, set during a touch event
                // to prevent the click, because you cannot cancel the
                // native "click" event reliably outside of the "click" event
                // itself
                var _shouldPreventNextClick = false;

                // Sometimes, we need to prevent the native click event
                // it's sad, but this is the best implementation I've created
                function preventClickSometimes(e) {
                    // we stop propagation to prevent this click from
                    // going to the document handler to close all menus
                    // this also prevents the clicks from going through
                    // to items below the menu
                    e.stopPropagation();

                    if (_shouldPreventNextClick) {
                        // compare the time difference, we only listen to this
                        // prevention if it's within 200ms of the original
                        // event to prevent errors
                        var timeDiff = +(new Date()) - _shouldPreventNextClick;

                        // reset the trigger
                        _shouldPreventNextClick = false;

                        // if the time difference is less than 1000ms (1s)
                        if (timeDiff < 1000) {
                            // prevent default to prevent navigation (possibly)
                            e.preventDefault();
                        }
                    }
                }

                function toggleClick(e) {
                    // we always want to stop the propagation to parent elements,
                    // this can cause the inner leaf items to close sub menus,
                    // or close the menus if it reaches the root document or
                    // just cause double-trigger if the target was the <a> when the
                    // handler is on the <li>
                    e.stopPropagation();

                    // if this is a mouse click, we do not want to interrupt normal navigation
                    // if there is no panel it should act like a regular link, always.
                    if (!me.$panel || e.pointerType == "mouse") {
                        return;
                    }

                    // determine if this event has bubbled
                    if (me.$panel.length > 0) {
                        var $closestPanel = $(e.target).closest(".menu-panel");
                        if ($closestPanel.length > 0 && $closestPanel[0] === me.$panel[0]) {
                            _shouldPreventNextClick = false;

                            // This event bubbled from a child panel's link (a leaf menu item).
                            // It doesn't have a Panel object of its own, so it should act like a regular link.
                            return;
                        }
                    }

                    // For touch events that aren't from leaf menu items,
                    // cancel the default event so touching the menu doesn't cause navigation.
                    _shouldPreventNextClick = +(new Date());
                    e.preventDefault();

                    if (me.transitioning) {
                        return;
                    }

                    me[me.isOpen ? "hideClick" : "showClick"](e);

                    if (me.isTopLevel) {
                        _ignoreDocumentClick = +(new Date());
                    }
                }

                this.showClick = function (e) {
                    if (me.isTopLevel) {
                        _clickHoverActivated = true;
                    }

                    me.show(e);
                };

                this.hideClick = function (e) {
                    if (me.isTopLevel) {
                        _clickHoverActivated = false;
                    }

                    me.hide(e);
                };

                this.hideForce = function (e) {
                    _clickHoverActivated = false;
                    me.hide(e);
                };

                init.apply(this);
            };

            // Hides all menus and submenus
            function hideAllClick(e) {
                _ignoreDocumentClick = +(new Date());

                $.each(_rootMenu.children, function () {
                    this.hideForce(e);
                });
            }

            // Handler for a document click to close all menus
            function documentClickHandler(e) {
                // Check a flag which indicates the click is from the menu itself
                if (_ignoreDocumentClick) {
                    // store the time difference, we only listen to this
                    // prevention if it's within 200ms of the original
                    // event to prevent errors
                    var timeDiff = +(new Date()) - _ignoreDocumentClick;

                    _ignoreDocumentClick = false;

                    if (timeDiff < 200) {
                        return;
                    }
                }

                hideAllClick(e);
            }

            _allCloseHandlers.push(hideAllClick);

            function hideOtherMenus(e) {
                for (var i = 0; i < _allCloseHandlers.length; i++) {
                    if (_allCloseHandlers[i] !== hideAllClick) {
                        _allCloseHandlers[i](e);
                    }
                }
            }

            // Create a Panel instance for each menu panel, store in an array
            $topLevelItems.find(".menu-panel").each(function () {
                _panels.push(new Panel($(this)));
            });

            // Top level items without a submenu need a Panel instance as well, to interact with other top level items.
            $topLevelItems.not(".menu-item-with-submenu").each(function () {
                _panels.push(new Panel(null, $(this)));
            });

            // Build a tree representing the parent/child relationships in the menu
            $.each(_panels, function () {
                this.resolveParent();
            });

            // Set up rollovers on the menu items.
            // Note: This does not include the top level items with submenus, which have different
            // rules for rollovers. jQuery.find() only includes decendants, no the current set,
            // which is the top level menu items.
            //
            // we use hoverDelay because it internally filters out touch-based pointer events
            $topLevelItems.find(".menu-item").hoverDelay(
                function () {
                    highlightMenuItem($(this), true);
                },
                function () {
                    highlightMenuItem($(this), false);
                })
                .each(function () {
                    highlightMenuItem($(this), false);
                });

            // Bind a handler to close the menu if it is clicked off.
            $(document).on("click", documentClickHandler);
        }

        // Loop through each menu container and create a menu "group".
        this.each(function () {
            // Find all the top-level menu items within the container.
            var $topLevelItems = findUntil($(this), function (elem, results) {
                if ($(elem).hasClass("menu-item")) {
                    results.push(elem);
                    return false;
                }

                return true;
            });

            // Invoke the create menu function with a jQuery object
            // containing all the top level menu items.
            createMenuFromTopMenuItems($topLevelItems);
        });

        // Allow the jQuery chain to remain unbroken.
        return this;
    };

    var _allCloseHandlers = [];

})(jQuery);
