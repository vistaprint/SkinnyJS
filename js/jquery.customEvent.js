// ## jQuery.customEvent
// A class that implements an observable event. 

// This is useful when jQuery custom events aren't appropriate because there's no DOM element involved. 

// This is implemented as a thin wrapper on jQuery.Callbacks().

// ### Usage

// Here's a simple class *Car* that exposes the event *ondrive*:

//     var Car = function()
//     {
//         $.CustomEvent.create(this, "ondrive");
//     
//         this.drive = function()
//         {
//             // TODO some driving implementation
//             this.ondrive.fire();
//         }
//     }

// A consumer of Car could observe the event:

//     var car = new Car();
//     car.ondrive.add(function() { alert("my car is driving!"); });

// We can also customize the event object that is passed to observers:

//     var Car = function()
//     {
//         $.CustomEvent.create(this, "ondrive");
//     
//         this.drive = function(speed)
//         {
//             // Data will be passed to handlers via the event object
//             this.ondrive.fire({ speed: speed }); 
//         }
//     }

//     var car = new Car();
//     car.ondrive.add(function(e) { alert("my car is driving at " + e.speed + "mph!"); });

// The event object passed to handlers of jQuery.CustomEvent is a jQuery.Event, and is
// also returned from jQuery.CustomEvent.fire(). This is useful if you want to use jQuery.Event's methods, 
// such as *preventDefault()* and *isDefaultPrevented()* to allow observers to influence the behavior of the
// object.

//     var Car = function()
//     {
//         $.CustomEvent.create(this, "ondrive");
//     
//         this.drive = function()
//         {
//             var evt = this.ondrive.fire(); 
//             if (evt.isDefaultPrevented())
//             {
//                 // Stop driving!!!
//             }
//         }
//     }

// ### Source

(function ($) 
{

    // Utility class to manage multiple callbacks.
    // @param {string} eventType The event type (i.e. "close", open")
    $.CustomEvent = function(host, eventType)
    {
        this._host = host;
        this.eventType = eventType;
        this._callbacks = new $.Callbacks();
    };

    /**
    * Triggers the event
    * @param {object} data Any data that should appended to the event object
    * @param {object} host Defines "this" in handlers. If not specified, the default host object is used.
    * @return {object} The event object
    */
    $.CustomEvent.prototype.fire = function(data, host)
    {
        var evt = new $.Event(this.eventType);
        $.extend(evt, data);
        evt.data = $.extend({}, evt.data, data);

        this._callbacks.fireWith(host || this._host, [evt]);

        return evt;
    };

    /**
    * Assigns an event handler
    * @param {Function} callback The event handler
    */
    $.CustomEvent.prototype.add = function(callback)
    {
        if (callback)
        {
            this._callbacks.add(callback);
        }
    };

    /**
    * Assigns an event handler
    * @param {Function} callback The event handler
    */
    $.CustomEvent.prototype.remove = function(callback)
    {
        if (callback)
        {
            this._callbacks.remove(callback);
        }
    };

    $.CustomEvent.create = function(obj, eventType)
    {
        var onEventType = "on" + eventType;
        var evt = new $.CustomEvent(obj, eventType);
        obj[onEventType] = evt;
        return evt;
    };

})(jQuery);


