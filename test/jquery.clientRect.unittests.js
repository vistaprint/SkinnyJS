describe("jquery.clientRect()", function () {
    var assert = chai.assert;

    var _cleanEls = [];

    afterEach(function () {
        while (_cleanEls.length > 0) {
            _cleanEls[0].remove();
            _cleanEls.splice(0, 1);
        }
    });

    var tempEl = function (html) {
        var $el = $(html);
        _cleanEls.push($el);
        return $el;
    };

    var basicEl = function () {
        return tempEl("<div />")
            .css({
                position: "absolute",
                width: 100,
                height: 100,
                top: 100,
                left: 100
            })
            .appendTo("body");
    };

    var rectEquals = function (rect, top, left, width, height) {
        var bottom = top + height;
        var right = left + width;

        assert.equal(Math.round(rect.top), top);
        assert.equal(Math.round(rect.left), left);
        assert.equal(Math.round(rect.width), width);
        assert.equal(Math.round(rect.height), height);
        assert.equal(Math.round(rect.bottom), bottom);
        assert.equal(Math.round(rect.right), right);
    };

    var clientRectShould = function (description, fn) {
        it("should " + description, function () {
            $.support.getBoundingClientRect = true;
            fn();
        });

        it("should " + description + " without using getBoundingClientRect", function () {
            $.support.getBoundingClientRect = false;
            fn();
        });
    };

    clientRectShould("read a basic 100px square rectangle", function () {
        var $el = basicEl();

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);
    });

    clientRectShould("return a 0 rect for a detached element", function () {
        var $el = basicEl().remove();

        var rect = $el.clientRect();

        rectEquals(rect, 0, 0, 0, 0);

    });

    clientRectShould("return a 0 rect for a hidden element", function () {
        var $el = basicEl().hide();

        var rect = $el.clientRect();

        rectEquals(rect, 0, 0, 0, 0);

    });

    clientRectShould("include margin in resulting rect", function () {
        var $el = basicEl().css("margin", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 110, 110, 100, 100);

    });

    clientRectShould("include padding in resulting rect", function () {
        var $el = basicEl().css("padding", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 120, 120);

    });

    clientRectShould("not include border in resulting rect", function () {
        var $el = basicEl().css("border", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

    });

    clientRectShould("return a 100px rect if the document element has a margin", function () {
        var $el = basicEl();

        $(document).css("margin", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        $(document).css("margin", 0);
    });


    clientRectShould("return a 100px rect when the window is scrolled", function () {
        var $el = basicEl();

        // Create a big element so we can scroll the window
        basicEl().css({
            height: 1000,
            width: 1000,
            position: "absolute"
        });

        window.scrollTo(150, 150);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        window.scrollTo(0, 0);
    });

    clientRectShould("factor in scroll position when within an element with overflow scroll", function () {
        var $outerEl = basicEl().css({
            overflow: "scroll"
        });

        $("<div />").css({
            width: 200,
            height: 200
        }).appendTo($outerEl);

        var $el = $("<div />").css({
            width: 20,
            height: 20
        }).appendTo($outerEl);

        $outerEl.scrollTop(50);

        var rect = $el.clientRect();

        rectEquals(rect, 250, 100, 20, 20);

    });

});
