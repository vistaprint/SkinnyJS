$(document).ready(function()
{
    module("parse-date");

    test("Ensure parse Microsoft json date format via Date.parse", function()
    {
        equal(Date.parse("\/Date(1239018869048)\/"), 1239018869048);
    });

    test("Ensure parse Microsoft json date format via Date.parseMsDate", function()
    {
        equal(Date.parseMsDate("\/Date(1239018869048)\/"), 1239018869048);
    });

    test("Ensure ISO 8601 date format via Date.parse", function()
    {
        equal(Date.parse("2009-04-06T11:54:29.048Z"), 1239018869048);
    });

    test("Ensure ISO 8601 date format via Date.parseISO", function()
    {
        equal(Date.parse("2009-04-06T11:54:29.048Z"), 1239018869048);
    });

    test("Ensure ISO 8601 date format via Date.parse", function()
    {
        equal(Date.parseISO("2009-04-06T11:54:29.048Z"), 1239018869048);
    });

    test("Ensure UTC date format via Date.parse", function()
    {
        // Removed milliseconds: UTC format doesn't support it
        equal(Date.parse("Mon, 06 Apr 2009 11:54:29 GMT"), 1239018869000);
    });

});