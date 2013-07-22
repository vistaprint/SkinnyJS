(function ($) 
{
    /**
    * @class 
    * Utility class to manage multiple callbacks.
    * @constructor
    * @param {string} eventType The event type (i.e. "close", open")
    */
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


