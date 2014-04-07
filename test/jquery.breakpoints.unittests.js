describe("jquery.breakpoints", function () {
    var assert = chai.assert;
    describe("jquery.breakpoints", function () {
        it("should initialize a class immediately", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should update on resize", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            $el.css({
                width: "500px "
            });

            $(window).trigger("resize");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should update on orientationchange", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            $el.css({
                width: "500px "
            });

            $(window).trigger("orientationchange");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should update on breakpoints:refresh on the window", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            $el.css({
                width: "500px "
            });

            $(window).trigger("breakpoints:refresh");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should update on breakpoints:refresh on the element", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            $el.css({
                width: "500px "
            });

            $el.trigger("breakpoints:refresh");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should update on breakpoints:refresh on one of the element's ancestors", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            $el.css({
                width: "500px "
            });

            $("body").trigger("breakpoints:refresh");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should set class to maximum size of breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "200px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            assert.equal($el.attr("class"), "breakpoint-small");
        });

        it("should set class to minimum size of breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "201px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should set class for largest breakpoint if size is max for largest breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "600px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should remove breakpoint classes if the width is larger than the largest breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "601px"
            });

            $el.breakpoints({
                small: 200,
                medium: 400,
                large: 600
            });

            assert.equal($el.attr("class"), "breakpoint-max");
        });

        it("should throw an error if no max is specified for a breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "601px"
            });

            assert.throws(function () {
                    $el.breakpoints({
                        small: {
                            min: 0,
                            max: 200
                        },
                        medium: {
                            min: 201,
                            max: 400
                        },
                        large: {
                            min: 600
                        }
                    });
                },
                "No max specified for breakpoint: large");
        });

        it("should support explicit ranges with no overlap", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "500px"
            });

            $el.breakpoints({
                small: {
                    min: 0,
                    max: 200
                },
                medium: {
                    min: 201,
                    max: 400
                },
                large: {
                    max: 600
                }
            });

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should support explicit ranges with overlap", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "150px"
            });

            $el.breakpoints({
                small: {
                    min: 0,
                    max: 200
                },
                medium: {
                    min: 100,
                    max: 300
                }
            });

            assert.equal($el.attr("class"), "breakpoint-small breakpoint-medium");
        });
    });
});
