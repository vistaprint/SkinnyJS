/// <reference path="../js/jquery.delimitedString.js" />
/// <reference path="../js/jquery.css.js" />

describe("jquery.css", function () {
    var assert = chai.assert;

    describe("#camelToDashCase()", function () {
        it("should convert a camel-case property to a dash-case property", function () {
            //basic conversion
            var actual = $.camelToDashCase("fontFamily");
            assert.equal(actual, "font-family");

            //Verify we don't break an already converted string
            actual = $.camelToDashCase("font-family");
            assert.equal(actual, "font-family");
        });
    });

    describe("#dashToCamelCase()", function () {
        it("should convert a dash-case property to a camel-case property", function () {
            //basic conversion
            var actual = $.dashToCamelCase("font-family");
            assert.equal(actual, "fontFamily");

            //Verify we don't break an already converted string
            actual = $.dashToCamelCase("fontFamily");
            assert.equal(actual, "fontFamily");
        });
    });

    describe("#encodeCssString()", function () {
        it("should return a properly formatted css string", function () {
            var css = {
                fontFamily: "Arial, Helvetica",
                color: "#232323",
                borderLeftColor: "#fff",
                borderWidth: "1px"
            };

            var actual = $.encodeCssString(css);

            assert.equal(actual, "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
        });

        it("should return a properly formatted css string with values trimmed", function () {
            var css = {
                fontFamily: "  Arial, Helvetica  ",
                color: " #232323  ",
                borderLeftColor: " #fff ",
                borderWidth: " 1px "
            };

            var actual = $.encodeCssString(css);

            assert.equal(actual, "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
        });
    });

    describe("#parseCssString()", function () {
        it("should return a parsed javascript object", function () {
            var css = "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px";

            var actual = $.parseCssString(css);

            assert.equal(actual.fontFamily, "Arial, Helvetica");
            assert.equal(actual.color, "#232323");
            assert.equal(actual.borderLeftColor, "#fff");
            assert.equal(actual.borderWidth, "1px");
        });

        it("should return a parsed javascript object with values trimmed", function () {
            var css = "font-family:Arial, Helvetica;color:#232323   ;border-left-color:#fff  ;border-width:1px ";

            var actual = $.parseCssString(css);

            assert.equal(actual.fontFamily, "Arial, Helvetica");
            assert.equal(actual.color, "#232323");
            assert.equal(actual.borderLeftColor, "#fff");
            assert.equal(actual.borderWidth, "1px");
        });

        it("should handle a key with no value", function () {
            var css = "font-family:";

            var actual = $.parseCssString(css);

            assert.property(actual, "fontFamily");
            assert.strictEqual(actual.fontFamily, "");
        });
    });
});
