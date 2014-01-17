// Pointer Events polyfill for jQuery

(function ($, window, document, undefined) {

    var support = {
        touch: "ontouchend" in document,
        pointer: !! (navigator.pointerEnabled || navigator.msPointerEnabled)
    };

    $.extend($.support, support);

    function triggerCustomEvent(elem, eventType, originalEvent) {
        // support for IE7-IE8
        originalEvent = originalEvent || window.event;

        // Create a writable copy of the event object and normalize some properties
        var event = new jQuery.Event(originalEvent);
        event.type = eventType;

        // Copy over properties for ease of access
        var i, copy = $.event.props.concat($.event.pointerHooks.props);
        i = copy.length;
        while (i--) {
            var prop = copy[i];
            event[prop] = originalEvent[prop];
        }

        // Support: IE<9
        // Fix target property (#1925)
        if (!event.target) {
            event.target = originalEvent.srcElement || document;
        }

        // Support: Chrome 23+, Safari?
        // Target should not be a text node (#504, #13143)
        if (event.target.nodeType === 3) {
            event.target = event.target.parentNode;
        }

        // Support: IE<9
        // For mouse/key events, metaKey==false if it's undefined (#3368, #11328)
        event.metaKey = !! event.metaKey;

        // run the filter now
        event = $.event.pointerHooks.filter(event, originalEvent);

        // trigger the emulated pointer event
        // the filter can return an array (only if the original was a touchmove),
        // which means we need to trigger independent events
        if ($.isArray(event)) {
            $.each(event, function (i, ev) {
                $.event.dispatch.call(elem, ev);
            });
        } else {
            $.event.dispatch.call(elem, event);
        }

        // return the manipulated jQuery event
        return event;
    }

    function addEvent(elem, type, selector, func) {
        // when we have a selector, let jQuery do the delegation
        if (selector) {
            func._pointerEventWrapper = function (event) {
                return func.call(elem, event.originalEvent);
            };

            $(elem).on(type, selector, func._pointerEventWrapper);
        }

        // if we do not have a selector, we optimize by cutting jQuery out
        else {
            if (elem.addEventListener) {
                elem.addEventListener(type, func, false);
            } else if (elem.attachEvent) {

                // bind the function to correct "this" for IE8-
                func._pointerEventWrapper = function (e) {
                    return func.call(elem, e);
                };

                elem.attachEvent("on" + type, func._pointerEventWrapper);
            }
        }
    }

    function removeEvent(elem, type, selector, func) {
        // Make sure for IE8- we unbind the wrapper
        if (func._pointerEventWrapper) {
            func = func._pointerEventWrapper;
        }

        if (selector) {
            $(elem).off(type, selector, func);
        } else {
            $.removeEvent(elem, type, func);
        }
    }

    // get the standardized "buttons" property as per the Pointer Events spec from a mouse event
    function getStandardizedButtonsProperty(event) {
        // in the DOM LEVEL 3 spec there is a new standard for the "buttons" property
        // sadly, no browser currently supports this and only sends us the single "button" property
        if (event.buttons) {
            return event.buttons;
        }

        // standardize "which" property for use
        var which = event.which;
        if (!which && event.button !== undefined) {
            which = (event.button & 1 ? 1 : (event.button & 2 ? 3 : (event.button & 4 ? 2 : 0)));
        }

        // no button down (can happen on mousemove)
        if (which === 0) {
            return 0;
        }
        // left button
        else if (which === 1) {
            return 1;
        }
        // middle mouse
        else if (which === 2) {
            return 4;
        }
        // right mouse
        else if (which === 3) {
            return 2;
        }

        // unknown?
        return 0;
    }

    var POINTER_TYPE_UNAVAILABLE = "unavailable";
    var POINTER_TYPE_TOUCH = "touch";
    var POINTER_TYPE_PEN = "pen";
    var POINTER_TYPE_MOUSE = "mouse";

    // signal to mark if the pointer is down and which button(s) are depressed
    // used only as part of the polyfill for Touch and Mouse Events API
    var _isPointerDown = false;

    // storage of the last seen touches provided by the native touch events spec
    var _lastTouches = [];

    // ------ NOTE: THIS IS UNUSED, WE DO NOT ASSIGN BUTTON ------
    // pointer events defines the "button" property as:
    // mouse move (no buttons down)                         -1
    // left mouse, touch contact and normal pen contact     0
    // middle mouse                                         1
    // right mouse, pen with barrel button pressed          2
    // x1 (back button on mouse)                            3
    // x2 (forward button on mouse)                         4
    // pen contact with eraser button pressed               5
    // ------ NOTE: THIS IS UNUSED, WE DO NOT ASSIGN BUTTON ------

    // pointer events defines the "buttons" property as:
    // mouse move (no buttons down)                         0
    // left mouse, touch contact, and normal pen contact    1
    // middle mouse                                         4
    // right mouse, pen contact with barrel button pressed  2
    // x1 (back) mouse                                      8
    // x2 (forward) mouse                                   16
    // pen contact with eraser button pressed               32

    // add our own pointer event hook/filter
    $.event.pointerHooks = {
        props: "pointerType pointerId buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function (event, original) {
            // Calculate pageX/Y if missing and clientX/Y available
            // this is just copied from jQuery's standard pageX/pageY fix
            if (!original.touches && event.pageX == null && original.clientX != null) {
                var eventDoc = event.target.ownerDocument || document;
                var doc = eventDoc.documentElement;
                var body = eventDoc.body;

                event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }

            // Add relatedTarget, if necessary
            // also copied from jQuery's standard event fix
            if (!event.relatedTarget && original.fromElement) {
                event.relatedTarget = original.fromElement === event.target ? original.toElement : original.fromElement;
            }

            // Add pointerType
            if (!event.pointerType || typeof event.pointerType == "number") {
                if (event.pointerType == 2) {
                    event.pointerType = POINTER_TYPE_TOUCH;
                } else if (event.pointerType == 3) {
                    event.pointerType = POINTER_TYPE_PEN;
                } else if (event.pointerType == 4) {
                    event.pointerType = POINTER_TYPE_MOUSE;
                } else if (/^touch/i.test(original.type)) {
                    event.pointerType = POINTER_TYPE_TOUCH;
                    event.buttons = original.type === "touchend" ? 0 : 1;
                } else if (/^mouse/i.test(original.type) || original.type == "click") {
                    event.pointerId = 1; // as per the pointer events spec, the mouse is always pointer id 1
                    event.pointerType = POINTER_TYPE_MOUSE;
                    event.buttons = original.type === "mouseup" ? 0 : getStandardizedButtonsProperty(original);
                } else {
                    event.pointerType = POINTER_TYPE_UNAVAILABLE;
                    event.buttons = 0;
                }
            }

            // if we have the bitmask for the depressed buttons from the mouse events polyfill, use it to mimic buttons for
            // browsers that do not support the HTML DOM LEVEL 3 events spec
            if (event.type === "pointermove" && typeof _isPointerDown !== "boolean" && _isPointerDown !== event.buttons) {
                event.buttons = _isPointerDown;
            }

            // touch events send an array of touches we need to convert to the pointer events format
            // which means we need to fire multiple events per touch
            if (original.touches) {
                var touches = original.touches;
                var events = [];
                var ev, i, j;

                // the problem with this is that on touchend it will remove the
                // touch which has ended from the touches list, this means we do
                // not want to fire pointerup for touches that are still there,
                // we instead want to send a pointerup with the removed touch's identifier
                if (event.type === "pointerup") {
                    // convert TouchList to a standard array
                    _lastTouches = Array.prototype.slice.call(_lastTouches);

                    // find the touch that was removed
                    for (i = 0; i < original.touches.length; i++) {
                        for (j = 0; j < _lastTouches.length; j++) {
                            if (_lastTouches[j].identifier === original.touches[i].identifier) {
                                _lastTouches.splice(j, 1);
                            }
                        }
                    }

                    // if we narrowed down the ended touch to one, then we found it
                    if (_lastTouches.length === 1) {
                        event.pointerId = _lastTouches[0].identifier;
                        _lastTouches = original.touches;
                        return event;
                    }
                }
                // on pointerdown we need to only trigger a new pointerdown for the touch,
                // and not the touches that were already there
                else if (event.type === "pointerdown") {
                    // convert TouchList to a standard array
                    touches = Array.prototype.slice.call(original.touches);

                    // find the new touch that was just added
                    for (i = 0; i < touches.length; i++) {
                        // last touches will be a list with one less touch
                        for (j = 0; j < _lastTouches.length; j++) {
                            if (touches[i].identifier === _lastTouches[j].identifier) {
                                touches.splice(i, 1);
                            }
                        }
                    }
                }

                // this will be used on pointermove and pointerdown
                for (i = 0; i < original.touches.length; i++) {
                    var touch = original.touches[i];
                    ev = $.extend({}, event);
                    // copy over information from the touch to the event
                    ev.clientX = touch.clientX;
                    ev.clientY = touch.clientY;
                    ev.pageX = touch.pageX;
                    ev.pageY = touch.pageY;
                    ev.screenX = touch.screenX;
                    ev.screenY = touch.screenY;
                    // the touch id on emulated touch events from chrome is always 0 (zero)
                    ev.pointerId = touch.identifier;
                    events.push(ev);
                }

                // do as little processing as you can here, this is done on touchmove and
                // there can be a lot of those events firing quickly, we do not want the
                // polyfill slowing down the application
                _lastTouches = original.touches;
                return events;
            }

            return event;
        }
    };

    $.event.delegateSpecial = function (setup) {
        return function (handleObj) {
            var thisObject = this,
                data = jQuery._data(thisObject);

            if (!data.pointerEvents) {
                data.pointerEvents = {};
            }

            if (!data.pointerEvents[handleObj.type]) {
                data.pointerEvents[handleObj.type] = [];
            }

            if (!data.pointerEvents[handleObj.type].length) {
                setup.call(thisObject, handleObj);
            }

            data.pointerEvents[handleObj.type].push(handleObj);
        };
    };

    $.event.delegateSpecial.remove = function (teardown) {
        return function (handleObj) {
            var handlers,
                thisObject = this,
                data = jQuery._data(thisObject);

            if (!data.pointerEvents) {
                data.pointerEvents = {};
            }

            handlers = data.pointerEvents[handleObj.type];

            handlers.splice(handlers.indexOf(handleObj), 1);

            if (!handlers.length) {
                teardown.call(thisObject, handleObj);
            }
        };
    };

    // allow jQuery's native $.event.fix to find our pointer hooks
    $.extend($.event.fixHooks, {
        pointerdown: $.event.pointerHooks,
        pointerup: $.event.pointerHooks,
        pointermove: $.event.pointerHooks,
        pointerover: $.event.pointerHooks,
        pointerout: $.event.pointerHooks,
        pointercancel: $.event.pointerHooks
    });

    // if browser does not natively handle pointer events,
    // create special custom events to mimic them
    if (!support.pointer) {
        $.event.special.pointerdown = {
            touch: function (event) {
                // prevent default to prevent the emulated mousedown event from being triggered,
                // we will force-emulate the click event again from within tounend:pointerup
                // event.preventDefault();

                triggerCustomEvent(this, "pointerdown", event);

                // set the pointer as currently down to prevent chorded pointerdown events
                _isPointerDown = true;
            },
            mouse: function (event) {
                // _isPointerDown is true when touch is down, this means we do not want to listen to mouse events too
                if (_isPointerDown === true) {
                    return;
                }

                // do not trigger another pointerdown event if currently down, prevent chorded pointerdown events
                if (_isPointerDown !== false) {
                    var button = getStandardizedButtonsProperty(event);
                    if (_isPointerDown !== button) {
                        _isPointerDown |= button;
                        // as per the pointer event spec, when the active "buttons" change it fires a new "pointermove"
                        // with the new buttons, but not a new pointerdown event (chorded)
                        triggerCustomEvent(this, "pointermove", event);
                        return;
                    }
                }

                var jEvent = triggerCustomEvent(this, "pointerdown", event);

                // set the pointer as currently down to prevent chorded pointerdown events
                _isPointerDown = jEvent.buttons;
            },
            add: $.event.delegateSpecial(function (handleObj) {
                // bind to touch events, some devices (chromebook) can send both touch and mouse events
                if (support.touch) {
                    addEvent(this, "touchstart", handleObj.selector, $.event.special.pointerdown.touch);
                }

                // bind to mouse events
                addEvent(this, "mousedown", handleObj.selector, $.event.special.pointerdown.mouse);
            }),
            remove: $.event.delegateSpecial.remove(function (handleObj) {
                // unbind touch events
                if (support.touch) {
                    removeEvent(this, "touchstart", handleObj.selector, $.event.special.pointerdown.touch);
                }

                // unbind mouse events
                removeEvent(this, "mousedown", handleObj.selector, $.event.special.pointerdown.mouse);
            })
        };

        $.event.special.pointerup = {
            touch: function (event) {
                // prevent default to prevent the emulated mouseup event from being triggered
                event.preventDefault();

                triggerCustomEvent(this, "pointerup", event);

                // release the pointerdown lock
                _isPointerDown = false;

                // on touchend, calling prevent default prevents the "mouseup" and "click" event
                // however on native "mouseup" events preventing default does not cancel the "click" event
                // as per the pointer event spec on "pointerup" preventing default should not cancel the "click" event
                //
                // we really do want to call this all the time, because if the function binded to this emulated
                // poiunterup triggered above called prevent default it would also prevent the click, which
                // would cause inconsistent behavior. To prevent the possibility of two click events though,
                // we want to call prevent default all the time (as we do above) and then force trigger the click here
                event.target.click();
            },
            mouse: function (event) {
                // the Mouse Events API provides the button on mouseup
                var button = getStandardizedButtonsProperty(event);

                // remove the button from the current pointers down signal
                // _isPointerDown can be false here if two "mouseup" events are received in parallel,
                // which can happen, say, if you bind to "pointerup" on a parent and a child (body and a link)
                if (_isPointerDown !== false) {
                    _isPointerDown ^= button;
                }

                // reset _isPointerDown to a boolean if no buttons are down
                if (_isPointerDown === 0) {
                    _isPointerDown = false;
                }

                // do not trigger another pointerdown event if currently down, prevent chorded pointerdown events
                if (_isPointerDown) {
                    // the mouse events spec shows that upon mouseup it fires a mousemove afterwards, which
                    // will trigger the pointermove we need to trigger to follow the pointer events spec
                    return;
                }

                var jEvent = triggerCustomEvent(this, "pointerup", event);

                // set the pointer as currently down to prevent chorded pointerdown events
                _isPointerDown = jEvent.buttons;

                // release the pointer down lock on mouseup
                _isPointerDown = false;
            },
            add: $.event.delegateSpecial(function (handleObj) {
                // bind to touch events, some devices (chromebook) can send both touch and mouse events
                if (support.touch) {
                    addEvent(this, "touchend", handleObj.selector, $.event.special.pointerup.touch);
                }

                // bind mouse events
                addEvent(this, "mouseup", handleObj.selector, $.event.special.pointerup.mouse);
            }),
            remove: $.event.delegateSpecial.remove(function (handleObj) {
                // unbind touch events
                if (support.touch) {
                    removeEvent(this, "touchend", handleObj.selector, $.event.special.pointerup.touch);
                }

                // unbind mouse events
                removeEvent(this, "mouseup", handleObj.selector, $.event.special.pointerup.mouse);
            })
        };

        $.event.special.pointermove = {
            touch: function (event) {
                triggerCustomEvent(this, "pointermove", event);
            },
            mouse: function (event) {
                // _isPointerDown will be true if they currently have their finger (touch only) down
                // because we cannot call preventDefault on the "touchmove" we get double triggers
                // and we prevent it with this signal check.
                // preventing default on "touchmove" prevents scrolling on mobile devices
                if (_isPointerDown === true) {
                    return false;
                }

                triggerCustomEvent(this, "pointermove", event);
            },
            add: $.event.delegateSpecial(function (handleObj) {
                // bind to touch events, some devices (chromebook) can send both touch and mouse events
                if (support.touch) {
                    addEvent(this, "touchmove", handleObj.selector, $.event.special.pointermove.touch);
                }

                // bind mouse events
                addEvent(this, "mousemove", handleObj.selector, $.event.special.pointermove.mouse);
            }),
            remove: $.event.delegateSpecial.remove(function (handleObj) {
                // unbind touch events
                if (support.touch) {
                    removeEvent(this, "touchmove", handleObj.selector, $.event.special.pointermove.touch);
                }

                // unbind mouse events
                removeEvent(this, "mousemove", handleObj.selector, $.event.special.pointermove.mouse);
            })
        };

        jQuery.each({
            pointerover: {
                mouse: "mouseover"
            },
            pointerout: {
                mouse: "mouseout"
            },
            pointercancel: {
                touch: "touchcancel"
            }
        }, function (pointerEventType, natives) {
            function onTouch(event) {
                event.preventDefault();
                triggerCustomEvent(this, pointerEventType, event);
            }

            function onMouse(event) {
                triggerCustomEvent(this, pointerEventType, event);
            }

            $.event.special[pointerEventType] = {
                setup: function () {
                    if (support.touch && natives.touch) {
                        addEvent(this, natives.touch, null, onTouch);
                    }
                    if (natives.mouse) {
                        addEvent(this, natives.mouse, null, onMouse);
                    }
                },
                teardown: function () {
                    if (support.touch && natives.touch) {
                        removeEvent(this, natives.touch, null, onTouch);
                    }
                    if (natives.mouse) {
                        removeEvent(this, natives.mouse, null, onMouse);
                    }
                }
            };
        });
    }

    // for IE10 specific, we proxy though events so we do not need to deal
    // with the various names or renaming of events.
    else if (navigator.msPointerEnabled && !navigator.pointerEnabled) {
        $.extend($.event.special, {
            pointerdown: {
                delegateType: "MSPointerDown",
                bindType: "MSPointerDown"
            },
            pointerup: {
                delegateType: "MSPointerUp",
                bindType: "MSPointerUp"
            },
            pointermove: {
                delegateType: "MSPointerMove",
                bindType: "MSPointerMove"
            },
            pointerover: {
                delegateType: "MSPointerOver",
                bindType: "MSPointerOver"
            },
            pointerout: {
                delegateType: "MSPointerOut",
                bindType: "MSPointerOut"
            },
            pointercancel: {
                delegateType: "MSPointerCancel",
                bindType: "MSPointerCancel"
            }
        });

        $.extend($.event.fixHooks, {
            MSPointerDown: $.event.pointerHooks,
            MSPointerUp: $.event.pointerHooks,
            MSPointerMove: $.event.pointerHooks,
            MSPointerOver: $.event.pointerHooks,
            MSPointerOut: $.event.pointerHooks,
            MSPointerCancel: $.event.pointerHooks
        });
    }

})(jQuery, window, document);
