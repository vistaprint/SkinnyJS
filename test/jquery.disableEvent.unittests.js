/// <reference path="../js/jquery.disableEvent.js" />

describe("jquery.disableEvent plugin", function () {
    mocha.globals(["_linkGlobalClick", "_linkGlobalMousedown", "_buttonGlobalClick"]);

    var assert = chai.assert;

    var _$link, _$button;

    //make the basic link element
    var basicLinkElement = function () {
        _$link = $("<a href='#'>hi</a>")
            .on("click", function () {
                window._linkGlobalClick = true;
            })
            .on("mousedown", function () {
                window._linkGlobalMousedown = true;
            })
            .appendTo(document.body);

        return _$link;
    };

    var basicButtonElement = function () {
        _$button = $("<button>button</button>")
            .on("click", function () {
                window._buttonGlobalClick = true;
            })
            .on("keydown", function () {
                window._buttonButtonKeydown = true;
            })
            .appendTo(document.body);

        return _$button;
    };

    afterEach(function () {
        if (_$link) {
            _$link.remove();
        }

        if (_$button) {
            _$button.remove();
        }

        delete window._linkGlobalClick;
        delete window._linkGlobalMousedown;
        delete window._buttonGlobalClick;
        delete window._buttonButtonKeydown;
    });

    describe("jquery.disableEvent()", function () {
        it("should prevent a click handler on an element from firing", function () {
            var $el = basicLinkElement();

            $el.disableEvent("click");

            $el.trigger("click");

            assert.isUndefined(window._linkGlobalClick);
        });

        it("should prevent a mousedown handler on an element from firing", function () {
            var $el = basicLinkElement();

            $el.disableEvent("mousedown");

            $el.trigger("mousedown");

            assert.isUndefined(window._linkGlobalMousedown);
        });

        it("should prevent multiple events from firing on an element from firing", function () {
            var $el = basicLinkElement();

            $el.disableEvent("click mousedown");
            $el.trigger("click");
            $el.trigger("mousedown");

            assert.isUndefined(window._linkGlobalClick);
            assert.isUndefined(window._linkGlobalMousedown);
        });

        it("should prevent a click handler from firing on a button", function () {
            var $el = basicButtonElement();
            $el.disableEvent("click");
            $el.trigger("click");

            assert.isUndefined(window._buttonGlobalClick);
        });

        it("should prevent multiple events from firing on a button", function () {
            var $el = basicButtonElement();
            $el.disableEvent("click keydown");
            $el.trigger("click");
            $el.trigger("keydown");

            assert.isUndefined(window._buttonGlobalClick);
            assert.isUndefined(window._buttonButtonKeydown);
        });

        it("should prevent native events", function () {
            var $el = $("<div />")
                .attr("onclick", "window._buttonGlobalClick = true;")
                .appendTo(document.body);

            $el.disableEvent("click");
            $el.trigger("click");

            assert.isUndefined(window._buttonGlobalClick);
        });
    });

    describe("jquery.enableEvent()", function () {
        it("should re-enable a click event after they have been disabled", function () {
            var $el = basicLinkElement();
            $el.disableEvent("click");
            $el.trigger("click");
            assert.isUndefined(window._linkGlobalClick);

            $el.enableEvent("click");
            $el.trigger("click");

            assert.isTrue(window._linkGlobalClick);
        });

        it("should re-enable multiple events after they have been disabled", function () {
            var $el = basicLinkElement();
            $el.disableEvent("click mousedown");

            $el.trigger("click");
            assert.isUndefined(window._linkGlobalClick);

            $el.trigger("mousedown");
            assert.isUndefined(window._linkGlobalMousedown);

            $el.enableEvent("click mousedown");
            $el.trigger("click");

            assert.isTrue(window._linkGlobalClick);

            $el.trigger("mousedown");
            assert.isTrue(window._linkGlobalMousedown);
        });

        it("should re-enable multiple events, separately, after they have been disabled", function () {
            var $el = basicLinkElement();
            $el.disableEvent("click mousedown");

            $el.trigger("click");
            assert.isUndefined(window._linkGlobalClick);

            $el.trigger("mousedown");
            assert.isUndefined(window._linkGlobalMousedown);

            $el.enableEvent("click");
            $el.trigger("click");

            assert.isTrue(window._linkGlobalClick);

            $el.trigger("mousedown");
            assert.isUndefined(window._linkGlobalMousedown);

            $el.enableEvent("mousedown");
            $el.trigger("mousedown");
            assert.isTrue(window._linkGlobalMousedown);
        });

        it("should re-enable native events", function () {
            var $el = $("<div />")
                .attr("onclick", "window._buttonGlobalClick = true;")
                .appendTo(document.body);

            $el.disableEvent("click");
            $el.trigger("click");

            assert.isUndefined(window._buttonGlobalClick);

            $el.enableEvent("click");
            $el.trigger("click");

            assert.isTrue(window._buttonGlobalClick);
        });
    });

});
