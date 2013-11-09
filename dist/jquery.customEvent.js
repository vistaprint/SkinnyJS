(function($) {

    // Utility class to manage multiple callbacks.

    // * {object} host: The object owning the event
    // * {string} eventType: The event type (i.e. "close", open")
    $.CustomEvent = function(host, eventType) {
        this._host = host;
        this.eventType = eventType;
        this._callbacks = new $.Callbacks();
    };


    // Triggers the event, and returns a jQuery.Event object.

    // * {object} data: Any data that should appended to the event object
    // * {object} host: Defines "this" in handlers. If not specified, the default host object is used.
    $.CustomEvent.prototype.fire = function(data, host) {
        var evt = new $.Event(this.eventType);
        $.extend(evt, data);
        evt.data = $.extend({}, evt.data, data);

        this._callbacks.fireWith(host || this._host, [evt]);

        return evt;
    };


    // Assigns an event handler

    // * {Function} callback: The event handler
    $.CustomEvent.prototype.add = function(callback) {
        if (callback) {
            this._callbacks.add(callback);
        }
    };

    // * {Function} callback: The event handler
    $.CustomEvent.prototype.one = function(callback) {
        if (!callback) {
            return;
        }

        var me = this;

        // TODO support removing this callback by calling this.remove().
        // This currently wont work because the wrapper is in the callbacks list

        var wrapper = $.proxy(function() {
            try {
                callback.apply(this, arguments);
            } finally {
                me.remove(callback);
            }

        }, this);

        this.add(wrapper);
    };

    // Assigns an event handler
    // * {Function} callback: The event handler
    $.CustomEvent.prototype.remove = function(callback) {
        if (callback) {
            this._callbacks.remove(callback);
        }
    };

    // Utility for adding an even to an object more tersely

    // * {object} host: The object owning the event
    // * {string} eventType: The event type (i.e. "close", open")
    $.CustomEvent.create = function(host, eventType) {
        var onEventType = "on" + eventType;
        var evt = new $.CustomEvent(host, eventType);
        host[onEventType] = evt;
        return evt;
    };

})(jQuery);
