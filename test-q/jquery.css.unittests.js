$(document).ready(function()
{
    module("jquery.css methods");

    test("$.camelToDashCase", function()
    {
        //basic conversion
        var actual = $.camelToDashCase("fontFamily");
        equal(actual, "font-family");

        //Verify we don't break an already converted string
        actual = $.camelToDashCase("font-family");
        equal(actual, "font-family");
    });

    test("$.dashToCamelCase", function()
    {
        //basic conversion
        var actual = $.dashToCamelCase("font-family");
        equal(actual, "fontFamily");

        //Verify we don't break an already converted string
        actual = $.dashToCamelCase("fontFamily");
        equal(actual, "fontFamily");
    });

    test("$.encodeCssString", function()
    {
        var css = {
            fontFamily: "Arial, Helvetica",
            color: "#232323",
            borderLeftColor: "#fff",
            borderWidth: "1px"
        };

        var actual = $.encodeCssString(css);

        equal(actual, "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
    });

    test("$.encodeCssString with trim", function()
    {
        var css = {
            fontFamily: "  Arial, Helvetica  ",
            color: " #232323  ",
            borderLeftColor: " #fff ",
            borderWidth: " 1px "
        };

        var actual = $.encodeCssString(css);

        equal(actual, "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
    });

    test("$.parseCssString", function()
    {
        var css = "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px";

        var actual = $.parseCssString(css);

        equal(actual.fontFamily, "Arial, Helvetica");
        equal(actual.color, "#232323");
        equal(actual.borderLeftColor, "#fff");
        equal(actual.borderWidth, "1px");
    });

    test("$.parseCssString with trim", function()
    {
        var css = "font-family:Arial, Helvetica;color:#232323   ;border-left-color:#fff  ;border-width:1px ";

        var actual = $.parseCssString(css);

        equal(actual.fontFamily, "Arial, Helvetica");
        equal(actual.color, "#232323");
        equal(actual.borderLeftColor, "#fff");
        equal(actual.borderWidth, "1px");
    });
});