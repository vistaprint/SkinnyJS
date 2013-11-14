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

        it("should update on breakpoints:refresh", function () {
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

        it("should fire enter event handler", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "100px"
            });

            var wasCalled = false;

            var enterHandler = function (breakpoint) {
                wasCalled = true;

                assert.equal(breakpoint.name, "medium");
            };

            $el.breakpoints({
                small: {
                    max: 200
                },
                medium: {
                    max: 400,
                    enter: enterHandler
                }
            });

            $el.css({
                width: "300px "
            });

            $(window).trigger("breakpoints:refresh");

            assert.ok(wasCalled);
        });

        it("should fire leave event handler", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "100px"
            });

            var wasCalled = false;

            var leaveHandler = function (breakpoint) {
                wasCalled = true;

                assert.equal(breakpoint.name, "small");
            };

            $el.breakpoints({
                small: {
                    max: 200,
                    leave: leaveHandler
                },
                medium: {
                    max: 400
                }
            });

            $el.css({
                width: "300px "
            });

            $(window).trigger("breakpoints:refresh");

            assert.ok(wasCalled);
        });

        it("should fire breakpoint:enter event handler", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "100px"
            });

            var wasCalled = false;

            var enterHandler = function (e) {
                wasCalled = true;

                assert.equal(e.breakpoint.name, "medium");
            };

            $el
                .breakpoints({
                    small: {
                        max: 200
                    },
                    medium: {
                        max: 400
                    }
                })
                .on("breakpoint:enter", enterHandler);

            $el.css({
                width: "300px "
            });

            $(window).trigger("breakpoints:refresh");

            assert.ok(wasCalled);
        });

        it("should fire breakpoint:leave event handler", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "100px"
            });

            var wasCalled = false;

            var leaveHandler = function (e) {
                wasCalled = true;

                assert.equal(e.breakpoint.name, "small");
            };

            $el
                .breakpoints({
                    small: {
                        max: 200
                    },
                    medium: {
                        max: 400
                    }
                })
                .on("breakpoint:leave", leaveHandler);

            $el.css({
                width: "300px "
            });

            $(window).trigger("breakpoints:refresh");

            assert.ok(wasCalled);
        });
    });

    describe("jquery.breakpointsFromAttrs", function () {
        it("should read data-breakpoints attributes, multiple", function () {
            var $el = $("<div data-breakpoints='small:200; medium: 400; large: 600;'></div>").appendTo("body").css({
                width: "300px"
            });

            $(document).breakpointsFromAttrs();

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should read data-breakpoints attributes, single", function () {
            var $el = $("<div data-breakpoints='small:200'></div>").appendTo("body").css({
                width: "300px"
            });

            $(document).breakpointsFromAttrs();

            assert.equal($el.attr("class"), "breakpoint-max");
        });
    });

    describe("#normalizeBreakpoints", function () {
        it("should return maxWidths and convert integer values to objects with max properties", function () {
            var breakpoints = {
                "small": 200,
                "medium": 400
            };

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 2);
            assert.equal(maxWidths[0], 200);
            assert.equal(maxWidths[1], 400);

            assert.deepEqual(breakpoints, {
                "small": {
                    name: "small",
                    max: 200
                },
                "medium": {
                    name: "medium",
                    max: 400
                }
            });
        });

        it("should return an empty array when no breakpoints are specified", function () {
            var breakpoints = {};

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 0);

            assert.deepEqual(breakpoints, {});
        });

        it("should sort maxWidth values as integers, not strings", function () {
            var breakpoints = {
                "small": 600,
                "medium": 900,
                "large": 1100
            };

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 3);
            assert.strictEqual(maxWidths[0], 600);
            assert.strictEqual(maxWidths[1], 900);
            assert.strictEqual(maxWidths[2], 1100);

            assert.deepEqual(breakpoints, {
                "small": {
                    name: "small",
                    max: 600
                },
                "medium": {
                    name: "medium",
                    max: 900
                },
                "large": {
                    name: "large",
                    max: 1100
                }
            });
        });
    });

    describe("#setMinWidths", function () {
        it("should assign min widths based on the lowest previous maxWidth", function () {
            var breakpoints = {
                "small": {
                    max: 200
                },
                "medium": {
                    max: 400
                }
            };
            var maxWidths = [200, 400];

            $.breakpointsPrivate.setMinWidths(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {
                "small": {
                    min: 0,
                    max: 200
                },
                "medium": {
                    min: 201,
                    max: 400
                }
            });
        });

        it("should not overwrite an explicit min width", function () {
            var breakpoints = {
                "small": {
                    min: 100,
                    max: 200
                },
                "medium": {
                    max: 400
                }
            };
            var maxWidths = [200, 400];

            $.breakpointsPrivate.setMinWidths(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {
                "small": {
                    min: 100,
                    max: 200
                },
                "medium": {
                    min: 201,
                    max: 400
                }
            });
        });
    });

    describe("#addMaxBreakpoint", function () {
        it("should create max breakpoint larger than the largest maxWidth", function () {
            var breakpoints = {
                "small": {
                    min: 0,
                    max: 200
                },
                "medium": {
                    min: 201,
                    max: 400
                }
            };
            var maxWidths = [200, 400];

            $.breakpointsPrivate.addMaxBreakpoint(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {
                "small": {
                    min: 0,
                    max: 200
                },
                "medium": {
                    min: 201,
                    max: 400
                },
                "max": {
                    min: 401,
                    max: Infinity
                }
            });
        });

        it("should do nothing if empty objects are passed", function () {
            var breakpoints = {};
            var maxWidths = [];

            $.breakpointsPrivate.addMaxBreakpoint(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {});
        });
    });
});
