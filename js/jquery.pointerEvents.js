// Pointer Events polyfill for jQuery

(function ($, window, document, undefined)
{
debugger;
var support = {
	touch: "ontouchend" in document,
	pointer: !!(navigator.pointerEnabled || navigator.msPointerEnabled)
};

$.extend( $.support, support );

function triggerCustomEvent (obj, eventType, event)
{
	var originalType = event.type;
	event = standardizePointerEvent(event);
	event.type = eventType;
	$.event.dispatch.call( obj, event );
	event.type = originalType;
}

// utility to just proxy through an event to a new event name
function proxyEventType (oldEventType, newEventType)
{
	return function ()
	{
		var thisObject = this;
		$(this).on(oldEventType, function (event)
		{
			triggerCustomEvent(thisObject, newEventType, event);
		});
	};
}

// utility to just prevent the default event behavior
function preventDefault (event)
{
	event.preventDefault();
}

var POINTER_TYPE_UNAVAILABLE = "unavailable";
var POINTER_TYPE_TOUCH = "touch";
var POINTER_TYPE_PEN = "pen";
var POINTER_TYPE_MOUSE = "mouse";

function standardizePointerEvent (event)
{
	var evObj = event.originalEvent;

	if (!evObj)
	{
		evObj = event.originalEvent = {};
	}

	//
	// standardize pointerType
	//
	evObj.POINTER_TYPE_UNAVAILABLE = POINTER_TYPE_UNAVAILABLE;
	evObj.POINTER_TYPE_TOUCH = POINTER_TYPE_TOUCH;
	evObj.POINTER_TYPE_PEN = POINTER_TYPE_PEN;
	evObj.POINTER_TYPE_MOUSE = POINTER_TYPE_MOUSE;

	// The old spec used numbers for the pointer type,
	// standardize to the new spec.
	switch (evObj.pointerType) {
		case 2:
			evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
			break;
		case 3:
			evObj.pointerType = evObj.POINTER_TYPE_PEN;
			break;
		case 4:
			evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
			break;
		default:
			if (/^touch/i.test(event.type))
			{
				evObj.pointerType = evObj.POINTER_TYPE_TOUCH;
			}
			else if (/^mouse/i.test(event.type) || event.type == "click")
			{
				evObj.pointerType = evObj.POINTER_TYPE_MOUSE;
			}
			break;
	}

	if (!evObj.pointerType)
	{
		evObj.pointerType = evObj.POINTER_TYPE_UNAVAILABLE;
	}

	//
	// standardize x/y coords
	//
	if (evObj.touches && evObj.touches.length > 0)
	{
		// touch events send an array of touches, which 99.9% has one item anyway...
		event.clientX = evObj.clientX = evObj.touches[0].clientX;
		event.clientY = evObj.clientY = evObj.touches[0].clientY;
	}

	return event;
}

// if browser does not natively handle pointer events,
// create special custom events to mimic them
if (!support.pointer)
{
	$.event.special.pointerdown =
	{
		preventClickEvents: false,

		setup: function ()
		{
			var thisObject = this,
				$this = $( thisObject );

			// add support for touch events
			if (support.touch)
			{
				$this.on("touchstart", function (event)
				{
					// prevent the click event from firing as well
					event.preventDefault();

					triggerCustomEvent(thisObject, "pointerdown", event);
				});
			}

			// now add support for mouse events
			$this.on("mousedown", function (event)
			{
				triggerCustomEvent(thisObject, "pointerdown", event);
			});

			if ($.event.special.pointerdown.preventClickEvents)
			{
				$this.on("click", preventDefault);
			}
		}
	};

	// pointerup defines when physical contact with a digitizer (screen) is broken,
	// or a mouse transitions from depressed to non-depressed (replaces touchend and mouseup)
	$.event.special.pointerup =
	{
		setup: function ()
		{
			var thisObject = this,
				$this = $( thisObject );

			// add support for touch events
			if (support.touch)
			{
				$this.on("touchend", function (event)
				{
					// prevent the mouseup event from firing as well
					event.preventDefault();

					triggerCustomEvent(thisObject, "pointerup", event);
				});
			}

			// now add support for mouse events
			$this.on("mouseup", function (event)
			{
				triggerCustomEvent(thisObject, "pointerup", event);
			});
		}
	};

	$.event.special.pointermove =
	{
		setup: function ()
		{
			var thisObject = this,
				$this = $( thisObject );

			// add support for touch events
			if (support.touch)
			{
				$this.on("touchmove", function (event)
				{
					// prevent the mousemove event from firing as well
					event.preventDefault();

					triggerCustomEvent(thisObject, "pointermove", event);
				});
			}

			// now add support for mouse events
			$this.on("mousemove", function (event)
			{
				triggerCustomEvent(thisObject, "pointermove", event);
			});
		}
	};

	// pointer over replaces mouseover, there is no equivalent for touch events
	$.event.special.pointerover =
	{
		setup: proxyEventType("mouseover", "pointerover")
		// we cannot just use bindType because we need to standardize the event object
	};

	// pointerout replaces mouseout, there is no equivalent for touch events
	$.event.special.pointerout =
	{
		setup: proxyEventType("mouseout", "pointerout")
		// we cannot just use bindType because we need to standardize the event object
	};
}

// for IE10 specific, we proxy though events so we do not need to deal
// with the various names or renaming of events.
else if (navigator.msPointerEnabled && !navigator.pointerEnabled)
{
	$.event.special.pointerdown =
	{
		delegateType: "MSPointerDown",
		bindType: "MSPointerDown"
	};

	$.event.special.pointerup =
	{
		delegateType: "MSPointerUp",
		bindType: "MSPointerUp"
	};

	$.event.special.pointermove =
	{
		delegateType: "MSPointerMove",
		bindType: "MSPointerMove"
	};

	$.event.special.pointerover =
	{
		delegateType: "MSPointerOver",
		bindType: "MSPointerOver"
	};

	$.event.special.pointerout =
	{
		delegateType: "MSPointerOut",
		bindType: "MSPointerOut"
	};
}

})( jQuery, window, document);
