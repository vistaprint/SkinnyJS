describe("jquery.msAjax", function()
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

    it("Ensure Microsoft json date format is deserialized", function(done)
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

    it("Ensure ISO 8601 date format is deserialized", function(done)
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

    it("Ensure UTC date format is deserialized", function(done)
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

    it("Ensure __type is removed", function(done)
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

    it("Ensure posted date is in Microsoft JSON date format", function(done)
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