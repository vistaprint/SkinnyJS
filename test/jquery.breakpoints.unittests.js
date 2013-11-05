describe("jquery.breakpoints", function()
{
    var assert = chai.assert;
    describe("jquery.breakpoints", function()
    {
        it("should initialize a class immediately", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "300px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should update on resize", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "300px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            $el.css({ width: "500px "});

            $(window).trigger("resize");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should update on orientationchange", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "300px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            $el.css({ width: "500px "});

            $(window).trigger("orientationchange");

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should set class to maximum size of breakpoint", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "200px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            assert.equal($el.attr("class"), "breakpoint-small");
        });

        it("should set class to minimum size of breakpoint", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "201px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should set class for largest breakpoint if size is max for largest breakpoint", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "600px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should remove breakpoint classes if the width is larger than the largest breakpoint", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "601px" });

            $el.breakpoints({ small: 200, medium: 400, large: 600 });

            assert.equal($el.attr("class") || "", "");
        });

        it("should throw an error if no max is specified for a breakpoint", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "601px" });

            assert.throws(function()
                {
                    $el.breakpoints({ small: { min: 0, max: 200 }, medium: { min: 201, max: 400 }, large: { min: 600 } });
                },
                "No max specified for breakpoint: large");
        });

        it("should support explicit ranges with no overlap", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "500px" });

            $el.breakpoints({ small: { min: 0, max: 200 }, medium: { min: 201, max: 400 }, large: { max: 600 } });
            
            assert.equal($el.attr("class"), "breakpoint-large");
        });

        it("should support explicit ranges with overlap", function()
        {
            var $el = $("<div />").appendTo("body").css({ width: "150px" });

            $el.breakpoints({ small: { min: 0, max: 200 }, medium: { min: 100, max: 300 } });
            
            assert.equal($el.attr("class"), "breakpoint-small breakpoint-medium");
        });
    });

    describe("jquery.breakpointsFromAttrs", function()
    {
        it("should read data-breakpoints attributes, multiple", function()
        {
            var $el = $("<div data-breakpoints='small:200; medium: 400; large: 600;'></div>").appendTo("body").css({ width: "300px" });

            $(document).breakpointsFromAttrs();
            
            assert.equal($el.attr("class"), "breakpoint-medium");
        });

        it("should read data-breakpoints attributes, single", function()
        {
            var $el = $("<div data-breakpoints='small:200'></div>").appendTo("body").css({ width: "300px" });

            $(document).breakpointsFromAttrs();
            
            assert.isUndefined($el.attr("class"));
        });
    });

    describe("#normalizeBreakpoints", function()
    {
        it("should return maxWidths and convert integer values to objects with max properties", function()
        {
            var breakpoints = { "small": 200, "medium" : 400 };

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 2);
            assert.equal(maxWidths[0], 200);
            assert.equal(maxWidths[1], 400);

            assert.deepEqual(breakpoints, {
                "small": { max: 200 },
                "medium": { max: 400 }
            });
        });

        it("should return an empty array when no breakpoints are specified", function()
        {
            var breakpoints = {};

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 0);

            assert.deepEqual(breakpoints, {});
        });

        it("should sort maxWidth values as integers, not strings", function()
        {
            var breakpoints = { "small": 600, "medium" : 900, "large": 1100 };

            var maxWidths = $.breakpointsPrivate.normalizeBreakpoints(breakpoints);

            assert.lengthOf(maxWidths, 3);
            assert.strictEqual(maxWidths[0], 600);
            assert.strictEqual(maxWidths[1], 900);
            assert.strictEqual(maxWidths[2], 1100);

            assert.deepEqual(breakpoints, {
                "small": { max: 600 },
                "medium": { max: 900 },
                "large": { max: 1100 }
            });
        });

        small:600;medium:900;large:1100
    });

    describe("#setMinWidths", function()
    {
        it("should assign min widths based on the lowest previous maxWidth", function()
        {
            var breakpoints = { "small": { max: 200 }, "medium": { max: 400 } };
            var maxWidths = [200, 400];

            $.breakpointsPrivate.setMinWidths(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {
                "small": { min: 0, max: 200 },
                "medium": { min: 201, max: 400 }
            });
        });

        it("should not overwrite an explicit min width", function()
        {
            var breakpoints = { "small": { min: 100, max: 200 }, "medium": { max: 400 } };
            var maxWidths = [200, 400];

            $.breakpointsPrivate.setMinWidths(breakpoints, maxWidths);

            assert.deepEqual(breakpoints, {
                "small": { min: 100, max: 200 },
                "medium": { min: 201, max: 400 }
            });
        });
    });
});

