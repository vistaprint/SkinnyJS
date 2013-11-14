describe("jquery", function () {
    var assert = chai.assert;

    describe("#.deparam()", function () {
        function decodeTest(name, value, expected) {
            it("should decode " + name + " from an encoded querystring into a string value", function () {
                var qs = {
                    keyString: value
                };

                var encoded = $.param(qs);
                var decoded = $.deparam(encoded);

                assert.equal(decoded.keyString, expected);
            });
        }

        var BASIC_STRING = "string 1 2 3";
        decodeTest("a string", BASIC_STRING, BASIC_STRING);

        var STRING_WITH_NEWLINE = "string 1 2 3\nstring 1 2 3";
        decodeTest("a string with newline", STRING_WITH_NEWLINE, STRING_WITH_NEWLINE);

        decodeTest("an int", 123, "123");

        decodeTest("a float", 1.23, "1.23");

        decodeTest("zero", 0, "0");

        decodeTest("an empty string", "", "");

        decodeTest("null", null, "");

        var UNDEFINED;
        decodeTest("undefined", UNDEFINED, "");

        decodeTest("NaN", NaN, "NaN");

        it("should decode a key with no value", function () {
            var value = $.deparam("foo");
            assert.deepEqual(value, {
                "foo": ""
            });
        });
    });
});
