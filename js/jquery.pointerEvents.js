// Pointer Events polyfill for jQuery

(function($, window, document, undefined) {

    var support = {
        touch: "ontouchend" in document,
        pointer: !! (navigator.pointerEnabled || navigator.msPointerEnabled)
    };

    $.extend($.support, support);

    function triggerCustomEvent(elem, eventType, originalEvent) {
        // support for IE7-IE8
        originalEvent = originalEvent || window.event;

        // store the original event type so we can use it in the fixHook
        originalEvent.originalType = originalEvent.type;

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

        // trigger the true event
        $.event.dispatch.call(elem, event);
    }

    function addEvent(elem, type, func) {
        if (elem.addEventListener) {
            elem.addEventListener(type, func, false);
        } else if (elem.attachEvent) {
            elem.attachEvent("on" + type, func);
        }
    }

    var POINTER_TYPE_UNAVAILABLE = "unavailable";
    var POINTER_TYPE_TOUCH = "touch";
    var POINTER_TYPE_PEN = "pen";
    var POINTER_TYPE_MOUSE = "mouse";

    // add our own pointer event hook/filter
    $.event.pointerHooks = {
        props: "pointerType clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
        filter: function(event, original) {
            var body, eventDoc, doc,
                fromElement = original.fromElement;

            // touch events send an array of touches, which 99.9% has one item anyway...
            // reassign that touch to as the clientX/clientY
            if (original.touches && original.touches.length > 0) {
                var touch = original.touches[0];
                event.clientX = touch.clientX;
                event.clientY = touch.clientY;
                event.pageX = touch.pageX;
                event.pageY = touch.pageY;
                event.screenX = touch.screenX;
                event.screenY = touch.screenY;
            }

            // Calculate pageX/Y if missing and clientX/Y available
            // this is just copied from jQuery's standard pageX/pageY fix
            if (event.pageX == null && original.clientX != null) {
                eventDoc = event.target.ownerDocument || document;
                doc = eventDoc.documentElement;
                body = eventDoc.body;

                event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
            }

            // Add relatedTarget, if necessary
            // also copied from jQuery's standard event fix
            if (!event.relatedTarget && fromElement) {
                event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
            }

            // Add which for click: 1 === left; 2 === middle; 3 === right
            // Note: button is not normalized, so don't use it
            if (!event.pointerType || typeof event.pointerType == "number") {
                if (event.pointerType == 2) {
                    event.pointerType = POINTER_TYPE_TOUCH;
                } else if (event.pointerType == 3) {
                    event.pointerType = POINTER_TYPE_PEN;
                } else if (event.pointerType == 4) {
                    event.pointerType = POINTER_TYPE_MOUSE;
                } else if (/^touch/i.test(original.originalType)) {
                    event.pointerType = POINTER_TYPE_TOUCH;
                } else if (/^mouse/i.test(original.originalType) || original.originalType == "click") {
                    event.pointerType = POINTER_TYPE_MOUSE;
                } else {
                    event.pointerType = POINTER_TYPE_UNAVAILABLE;
                }
            }

            return event;
        }
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
            ignoreNextMousedownEvent: false,

            touch: function(event) {
                // prevent the click event from firing as well
                $.event.special.pointerdown.ignoreNextMousedownEvent = true;
                triggerCustomEvent(this, "pointerdown", event);
            },
            mouse: function(event) {
                if (!$.event.special.pointerdown.ignoreNextMousedownEvent) {
                    triggerCustomEvent(this, "pointerdown", event);
                } else {
                    $.event.special.pointerdown.ignoreNextMousedownEvent = false;
                }
            },
            setup: function() {
                if (support.touch) {
                    addEvent(this, "touchstart", $.event.special.pointerdown.touch);
                }
                addEvent(this, "mousedown", $.event.special.pointerdown.mouse);
            },
            teardown: function() {
                if (support.touch) {
                    jQuery.removeEvent(this, "touchstart", $.event.special.pointerdown.touch);
                }
                jQuery.removeEvent(this, "mousedown", $.event.special.pointerdown.mouse);
            }
        };

        jQuery.each({
            pointerup: {
                touch: "touchend",
                mouse: "mouseup"
            },
            pointermove: {
                touch: "touchmove",
                mouse: "mousemove"
            },
            pointerover: {
                mouse: "mouseover"
            },
            pointerout: {
                mouse: "mouseout"
            },
            pointercancel: {
                touch: "touchcancel"
            }
        }, function(pointerEventType, natives) {
            function onTouch(event) {
                event.preventDefault(); // prevent the mouse event from firing as well
                triggerCustomEvent(this, pointerEventType, event);
            }

            function onMouse(event) {
                triggerCustomEvent(this, pointerEventType, event);
            }

            $.event.special[pointerEventType] = {
                setup: function() {
                    if (support.touch && natives.touch) {
                        addEvent(this, natives.touch, onTouch);
                    }
                    if (natives.mouse) {
                        addEvent(this, natives.mouse, onMouse);
                    }
                },
                teardown: function() {
                    if (support.touch && natives.touch) {
                        jQuery.removeEvent(this, natives.touch, onTouch);
                    }
                    if (natives.mouse) {
                        jQuery.removeEvent(this, natives.mouse, onMouse);
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
