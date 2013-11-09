describe("Date", function() {
    var assert = chai.assert;

    describe("#.parse()", function() {
        it("should parse Microsoft json date format via Date.parse", function() {
            assert.strictEqual(Date.parse("\/Date(1239018869048)\/"), 1239018869048);
        });

        it("should parse ISO 8601 date format via Date.parseISO", function() {
            assert.strictEqual(Date.parse("2009-04-06T11:54:29.048Z"), 1239018869048);
        });

        it("should parse UTC date format via Date.parse", function() {
            // Removed milliseconds: UTC format doesn't support it
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.strictEqual(Date.parse("Mon, 06 Apr 2009 11:54:29 GMT"), 1239018869000);
        });
    });

    describe("#.parseISO()", function() {
        it("should parse ISO 8601 date format", function() {
            assert.strictEqual(Date.parseISO("2009-04-06T11:54:29.048Z"), 1239018869048);
        });

        it("should support YYYY-MM-DD date format", function() {
            assert.strictEqual(Date.parseISO("2014-01-30"), 1391040000000);
        });
    });

    describe("#.parseMsDate()", function() {
        it("should parse Microsoft json date format", function() {
            assert.strictEqual(Date.parseMsDate("\/Date(1239018869048)\/"), 1239018869048);
        });

        it("should parse Microsoft json date format with historical dates", function() {
            assert.strictEqual(Date.parseMsDate("\/Date(-1239018869048)\/"), -1239018869048);
        });
    });
});
