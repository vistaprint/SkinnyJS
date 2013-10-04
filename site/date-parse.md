---
layout: main
title: date-parse
---

## Date.parse

Enhances Date.parse() to support ISO 8601 and Microsoft-style dates.

Based on Colin Snover's [js-iso8601.js](https://github.com/csnover/js-iso8601)

### Usage
This library provides 3 methods:

####Date.parse(date)
Enhanced version of JavaScript's native Date.parse()
If 'date' is a date in either ISO 8601, [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb), 
or in any format the browser's Date.parse() implementation supports, a Date value (integer) is returned (which can be turned into a date using the Date()constructor), otherwise NaN.

{% highlight javascript %}
    // returns a date value using native Date.parse()
    var date = Date.parse("Aug 9, 1995");
    
    // returns a date value, knows about ISO8601 dates
    var date = Date.parse("2011-10-10T14:48:00");
    
    // returns a date value, knows about [Microsoft's JSON date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb)
    var date = Date.parse("\/Date(628318530718)\/");
{% endhighlight %}

####Date.parseISO(date)
If 'date' is an ISO 8601 date, a date value is returned, otherwise NaN.

{% highlight javascript %}
    // returns NaN because the date is not ISO8601
    var date = Date.parseISO("Aug 9, 1995");
    
    // returns a date value
    var date = Date.parseISO("2011-10-10T14:48:00");
{% endhighlight %}

####Date.parseMsDate(date)
If 'date' is a date in [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb), 
a date value is returned, otherwise NaN.

{% highlight javascript %}
    // returns NaN because the date is not in Microsoft format
    var date = Date.parseMsDate("Aug 9, 1995");
    
    // returns a date value
    var date = Date.parseMsDate("\/Date(628318530718)\/");
{% endhighlight %}