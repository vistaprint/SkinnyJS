mocha.setup("bdd");

$(window).on("load", function () {
    mocha.checkLeaks();
    mocha.globals(["jQuery"]);
    mocha.run();
});

(function () {
    function CustomEvent(event, params) {
        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };
        var evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    // CustomEvent.prototype = window.CustomEvent.prototype;

    if (!window.CustomEvent) {
        window.CustomEvent = CustomEvent;
    }

    $.fn.triggerNative = function (type, props, params) {
        var event = new CustomEvent(type, params || {});
        $.extend(event, props || {});
        this[0].dispatchEvent(event);
    };
})();
