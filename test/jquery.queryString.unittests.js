/* jsl:option explicit*/

$(document).ready(function()
{
    module("jquery.querystring");

    var undefined;

    test("$.querystring decode", function()
    {
        var qs = {
            keyString: "string 1 2 3",
            keyStringNewLine: "string 1 2 3\n\string 1 2 3",
            keyInt: 123,
            keyFloat: 1.23,
            keyZero: 0,
            keyEmpty: "",
            keyNull: null,
            keyUndefined: undefined,
            keyNaN: NaN
        };

        var encoded = $.param(qs);
        var decoded = $.deparam(encoded);

        equal(decoded.keyString, "string 1 2 3");
        equal(decoded.keyStringNewLine, "string 1 2 3\n\string 1 2 3");
        equal(decoded.keyInt, "123");
        equal(decoded.keyFloat, "1.23");
        equal(decoded.keyZero, "0");
        equal(decoded.keyEmpty, "");
        equal(decoded.keyNull, "null");
        equal(decoded.keyUndefined, "undefined");
        equal(decoded.keyNaN, "NaN");
    });
});