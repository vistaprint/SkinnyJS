$(document).ready(function()
{
    function cleanup()
    {
        $.mockjaxClear();
    }

    module(
        "jquery.msAjax",
        {
            setup: cleanup,
            teardown: cleanup
        });

    asyncTest("Ensure Microsoft json date format is deserialized", 2, function()
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
            equal(data.date.valueOf(), 1239018869048);
            equal(status, "success");
            start();
        });
        
    });

    asyncTest("Ensure ISO 8601 date format is deserialized", 2, function()
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
            equal(data.date.valueOf(), 1239018869048);
            equal(status, "success");
            start();
        });
        
    });

    asyncTest("Ensure UTC date format is deserialized", 2, function()
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
            equal(data.date.valueOf(), 1239018869000);
            equal(status, "success");
            start();
        });
        
    });

    asyncTest("Ensure __type is removed", 2, function()
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
            equal(typeof data.__type, "undefined");
            equal(status, "success");
            start();
        });
        
    });
});