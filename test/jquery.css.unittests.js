describe("jquery.css", function()
{
    it("$.camelToDashCase", function()
    {
        //basic conversion
        var actual = $.camelToDashCase("fontFamily");
        expect(actual).to.be("font-family");

        //Verify we don't break an already converted string
        actual = $.camelToDashCase("font-family");
        expect(actual).to.be("font-family");
    });

    it("$.dashToCamelCase", function()
    {
        //basic conversion
        var actual = $.dashToCamelCase("font-family");
        expect(actual).to.be("fontFamily");

        //Verify we don't break an already converted string
        actual = $.dashToCamelCase("fontFamily");
        expect(actual).to.be("fontFamily");
    });

    it("$.encodeCssString", function()
    {
        var css = {
            fontFamily: "Arial, Helvetica",
            color: "#232323",
            borderLeftColor: "#fff",
            borderWidth: "1px"
        };

        var actual = $.encodeCssString(css);

        expect(actual).to.be("font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
    });

    it("$.encodeCssString with trim", function()
    {
        var css = {
            fontFamily: "  Arial, Helvetica  ",
            color: " #232323  ",
            borderLeftColor: " #fff ",
            borderWidth: " 1px "
        };

        var actual = $.encodeCssString(css);

        expect(actual).to.be("font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px");
    });

    it("$.parseCssString", function()
    {
        var css = "font-family:Arial, Helvetica;color:#232323;border-left-color:#fff;border-width:1px";

        var actual = $.parseCssString(css);

        expect(actual.fontFamily).to.be("Arial, Helvetica");
        expect(actual.color).to.be("#232323");
        expect(actual.borderLeftColor).to.be("#fff");
        expect(actual.borderWidth).to.be("1px");
    });

    it("$.parseCssString with trim", function()
    {
        var css = "font-family:Arial, Helvetica;color:#232323   ;border-left-color:#fff  ;border-width:1px ";

        var actual = $.parseCssString(css);

        expect(actual.fontFamily).to.be("Arial, Helvetica");
        expect(actual.color).to.be("#232323");
        expect(actual.borderLeftColor).to.be("#fff");
        expect(actual.borderWidth).to.be("1px");
    });
});