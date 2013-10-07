describe("jquery.msAjax()", function()
{
    var assert = chai.assert;

    beforeEach(function()
    {
        $.mockjaxClear();
    });

    afterEach(function()
    {
        $.mockjaxClear();
    });

    $.mockjaxSettings.logging = false;

    it("should parse a date string in Microsoft json date format", function(done)
    {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "\/Date(1239018869048)\/", "__type": "System.SomeDotNetType" }}'
        });

        $.msAjax(
        {
            url: "/test.asmx",
            type: "GET"
        })
        .done(function(data, status)
        {
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.equal(data.date.valueOf(), 1239018869048);
            assert.equal(status, "success");
            done();
        });
        
    });

    it("should parse a date string in ISO 8601 date format", function(done)
    {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "2009-04-06T11:54:29.048Z" }}'
        });

        $.msAjax(
        {
            url: "/test.asmx",
            type: "GET"
        })
        .done(function(data, status)
        {
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.equal(data.date.valueOf(), 1239018869048);
            assert.equal(status, "success");
            done();
        });
        
    });

    it("should parse a date string in UTC date format", function(done)
    {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "Mon, 06 Apr 2009 11:54:29 GMT" }}'
        });

        $.msAjax(
        {
            url: "/test.asmx",
            type: "GET"
        })
        .done(function(data, status)
        {
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.equal(data.date.valueOf(), 1239018869000);
            assert.equal(status, "success");
            done();
        });
        
    });

    it("should remove the __type property from Microsoft json", function(done)
    {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            contentType: "application/json",
            responseText: '{ "d": { "date": "\/Date(1239018869048)\/", "__type": "System.SomeDotNetType" }}'
        });

        $.msAjax(
        {
            url: "/test.asmx",
            type: "GET"
        })
        .done(function(data, status)
        {
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.typeOf(data.__type, "undefined");
            assert.equal(status, "success");
            done();
        });
        
    });

    it("should post dates in Microsoft JSON date formatted strings", function(done)
    {
        /* jshint quotmark:false */

        $.mockjax({
            url: "/test.asmx",
            type: "POST",
            contentType: "application/json",
            response: function(settings)
            {
                this.responseText = '{ "d": {} }';
                assert.equal(settings.data, '{"date":"\/Date(1239018869000-0000)\/"}');
            }
        });

        $.msAjax(
        {
            url: "/test.asmx",
            type: "POST",
            data: { date: new Date(1239018869048) }
        })
        .done(function(data, status)
        {
            // Mon, 06 Apr 2009 11:54:29 GMT
            assert.equal(status, "success");
            done();
        });
        
    });
});