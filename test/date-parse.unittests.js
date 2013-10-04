describe("parse-date", function()
{
    it("should parse Microsoft json date format via Date.parse", function()
    {
        expect(Date.parse("\/Date(1239018869048)\/")).to.be(1239018869048);
    });

    it("should parse Microsoft json date format via Date.parseMsDate", function()
    {
        expect(Date.parseMsDate("\/Date(1239018869048)\/")).to.be(1239018869048);
    });

    it("should ISO 8601 date format via Date.parse", function()
    {
        expect(Date.parse("2009-04-06T11:54:29.048Z")).to.be(1239018869048);
    });

    it("should ISO 8601 date format via Date.parseISO", function()
    {
        expect(Date.parse("2009-04-06T11:54:29.048Z")).to.be(1239018869048);
    });

    it("should ISO 8601 date format via Date.parse", function()
    {
        expect(Date.parseISO("2009-04-06T11:54:29.048Z")).to.be(1239018869048);
    });

    it("should UTC date format via Date.parse", function()
    {
        // Removed milliseconds: UTC format doesn't support it
        expect(Date.parse("Mon, 06 Apr 2009 11:54:29 GMT")).to.be(1239018869000);
    });

    it("should YYYY-MM-DD date format is supported via Date.parseISO", function()
    {
        expect(Date.parseISO("2014-01-30")).to.be(1391040000000);
    });
});