describe("jquery.querystring", function()
{
    var assert = chai.assert;

    function decodeTest(name, value, expected)
    {
        it("should decode " + name + " properly", function()
        {
            var qs = {
                keyString: value
            };

            var encoded = $.param(qs);
            var decoded = $.deparam(encoded);

            assert.equal(decoded.keyString, expected);
        });
    }

    var BASIC_STRING = "string 1 2 3";
    decodeTest("string", BASIC_STRING, BASIC_STRING);

    var STRING_WITH_NEWLINE = "string 1 2 3\nstring 1 2 3";
    decodeTest("string with newline", STRING_WITH_NEWLINE, STRING_WITH_NEWLINE);

    decodeTest("int", 123, "123");

    decodeTest("float", 1.23, "1.23");

    decodeTest("zero", 0, "0");

    decodeTest("empty string", "", "");

    decodeTest("null", null, "");

    var UNDEFINED;
    decodeTest("undefined", UNDEFINED, "");

    decodeTest("NaN", NaN, "NaN");
});