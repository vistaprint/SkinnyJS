/// <reference path="../dependencies/jquery.mockjax.js" />
/// <reference path="../dependencies/json2.js" />
/// <reference path="../js/date-parse.js" />
/// <reference path="../js/jquery.msAjax.js" />

describe("jquery.msAjax_private.msJsonDateOnlySanitizer()", function () {

    var assert = chai.assert;

    it("should not interpret a PO box as a date", function () {

        var val = $.msAjax_private.msJsonDateOnlySanitizer("somekey", "PO box 1234");

        assert.ok(isNaN(val));
    });

});

describe("jquery.msAjax()", function () {

    var assert = chai.assert;

    beforeEach(function () {
        $.mockjaxClear();
    });

    afterEach(function () {
        $.mockjaxClear();
    });

    $.mockjaxSettings.logging = false;

    it("should parse a date string in Microsoft json date format", function (done) {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "\/Date(1239018869048)\/", "__type": "System.SomeDotNetType" }}'
        });

        $.msAjax({
            url: "/test.asmx",
            type: "GET"
        })
            .done(function (data, status) {
                // Mon, 06 Apr 2009 11:54:29 GMT
                assert.equal(data.date.valueOf(), 1239018869048);
                assert.equal(status, "success");
                done();
            });

    });

    it("should parse a date string in ISO 8601 date format", function (done) {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "2009-04-06T11:54:29.048Z" }}'
        });

        $.msAjax({
            url: "/test.asmx",
            type: "GET"
        })
            .done(function (data, status) {
                // Mon, 06 Apr 2009 11:54:29 GMT
                assert.strictEqual(data.date.valueOf(), 1239018869048);
                assert.equal(status, "success");
                done();
            });

    });

    it("should not parse number strings as dates", function (done) {
        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: JSON.stringify({
                d: {
                    number: 2013,
                    string: "002013"
                }
            })
        });

        $.msAjax({
            url: "/test.asmx",
            type: "GET"
        })
            .done(function (data, status) {
                assert.strictEqual(data.number, 2013);
                assert.strictEqual(data.string, "002013");
                assert.equal(status, "success");
                done();
            });
    });

    it("should parse a date string in UTC date format", function (done) {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "Mon, 06 Apr 2009 11:54:29 GMT" }}'
        });

        $.msAjax({
            url: "/test.asmx",
            type: "GET"
        })
            .done(function (data, status) {
                // Mon, 06 Apr 2009 11:54:29 GMT
                assert.equal(data.date.valueOf(), 1239018869000);
                assert.equal(status, "success");
                done();
            });

    });

    it("should remove the __type property from Microsoft json", function (done) {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "\/Date(1239018869048)\/", "__type": "System.SomeDotNetType" }}'
        });

        $.msAjax({
            url: "/test.asmx",
            type: "GET"
        })
            .done(function (data, status) {
                // Mon, 06 Apr 2009 11:54:29 GMT
                assert.typeOf(data.__type, "undefined");
                assert.equal(status, "success");
                done();
            });

    });

    it("should post dates in Microsoft JSON date formatted strings", function (done) {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            type: "POST",
            contentType: "application/json",
            response: function (settings) {
                this.responseText = '{ "d": {} }';
                assert.equal(settings.data, '{"date":"\/Date(1239018869000-0000)\/"}');
            }
        });

        $.msAjax({
            url: "/test.asmx",
            type: "POST",
            data: {
                date: new Date(1239018869048)
            }
        })
            .done(function (data, status) {
                // Mon, 06 Apr 2009 11:54:29 GMT
                assert.equal(status, "success");
                done();
            });

    });

    it("validate $.parseMsJSON.isNumericString", function () {
        // true
        assert.equal($.parseMsJSON.isNumericString("2013"), true, "should accept string with only numbers");
        assert.equal($.parseMsJSON.isNumericString("-2013"), true, "should accept numbers prefixed with hyphen");
        assert.equal($.parseMsJSON.isNumericString("2013.03"), true, "should accept numbers with periods");

        // false
        assert.equal($.parseMsJSON.isNumericString("2013.03.01"), false, "should reject strings with two periods");
        assert.equal($.parseMsJSON.isNumericString("11-01"), false, "should reject strings with inclusive hyphens");
        assert.equal($.parseMsJSON.isNumericString("2013-11-01"), false, "should reject dates");
        assert.equal($.parseMsJSON.isNumericString("2009-04-06T11:54:29.048Z"), false, "should reject ISO dates");
        assert.equal($.parseMsJSON.isNumericString("G930"), false, "should reject alphanumeric strings");
    });
});
