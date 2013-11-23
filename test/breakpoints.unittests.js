/* globals breakpoints */

describe("breakpoints", function () {

    var assert = chai.assert;

    describe("#parseClassMap", function () {

        it("should parse a basic className attribute", function() {

            var classes = "foo bar baz";

            var parsed = breakpoints._private.parseClassMap(classes);

            assert.isTrue(parsed.foo, true);
            assert.isTrue(parsed.bar, true);
            assert.isTrue(parsed.baz, true);

        });

        it("should parse an empty string as an empty object", function() {

            var classes = "";

            var parsed = breakpoints._private.parseClassMap(classes);

            assert.deepEqual(parsed, {});

        });
    });

    describe("#serializeClassMap", function () {

        it("should parse a basic className attribute", function() {

            var parsed = { foo: true, bar: true, baz: true };

            var classes = breakpoints._private.serializeClassMap(parsed);

            assert.equal(classes, "foo bar baz");
        });
    });

    describe("#setup", function () {

        it("should initialize a class immediately", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "300px"
            });

            breakpoints.setup($el[0], 
                {
                    small: 200,
                    medium: 400,
                    large: 600
                });

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should set class to maximum size of breakpoint", function () {
            var $el = $("<div />").appendTo("body").css({
                width: "200px"
            });

            breakpoints.setup($el[0], {
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

            breakpoints.setup($el[0], {
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

            breakpoints.setup($el[0], {
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

            breakpoints.setup($el[0], {
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
                    breakpoints.setup($el[0], {
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

            breakpoints.setup($el[0], {
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

            breakpoints.setup($el[0], {
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

    describe("#normalizeBreakpoints", function () {
        it("should return maxWidths and convert integer values to objects with max properties", function () {
            var bp = {
                "small": 200,
                "medium": 400
            };

            var maxWidths = breakpoints._private.normalizeBreakpoints(bp);

            assert.lengthOf(maxWidths, 2);
            assert.equal(maxWidths[0], 200);
            assert.equal(maxWidths[1], 400);

            assert.deepEqual(bp, {
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
            var bp = {};

            var maxWidths = breakpoints._private.normalizeBreakpoints(bp);

            assert.lengthOf(maxWidths, 0);

            assert.deepEqual(bp, {});
        });

        it("should sort maxWidth values as integers, not strings", function () {
            var bp = {
                "small": 600,
                "medium": 900,
                "large": 1100
            };

            var maxWidths = breakpoints._private.normalizeBreakpoints(bp);

            assert.lengthOf(maxWidths, 3);
            assert.strictEqual(maxWidths[0], 600);
            assert.strictEqual(maxWidths[1], 900);
            assert.strictEqual(maxWidths[2], 1100);

            assert.deepEqual(bp, {
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
            var bp = {
                "small": {
                    max: 200
                },
                "medium": {
                    max: 400
                }
            };
            var maxWidths = [200, 400];

            breakpoints._private.setMinWidths(bp, maxWidths);

            assert.deepEqual(bp, {
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
            var bp = {
                "small": {
                    min: 100,
                    max: 200
                },
                "medium": {
                    max: 400
                }
            };
            var maxWidths = [200, 400];

            breakpoints._private.setMinWidths(bp, maxWidths);

            assert.deepEqual(bp, {
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
            var bp = {
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

            breakpoints._private.addMaxBreakpoint(bp, maxWidths);

            assert.deepEqual(bp, {
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
            var bp = {};
            var maxWidths = [];

            breakpoints._private.addMaxBreakpoint(bp, maxWidths);

            assert.deepEqual(bp, {});
        });
    });
});
