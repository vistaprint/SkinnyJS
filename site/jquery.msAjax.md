---
layout: main
title: jquery.msAjax
---

## jQuery.msAjax plugin

Eases the pain of dealing with legacy Microsoft web services technologies (ASMX, WCF, JsonDataContractSerializer).

* Correctly serializes/deserializes [Microsoft's date format](http://msdn.microsoft.com/en-us/library/bb299886.aspx#intro_to_json_sidebarb) 
and revives dates into a JavaScript Date object.
** Supports ISO8601 dates as well.
* Remove Microsoft specific JSON wrappers, including the "d" property, the embedded "__type" property
* Wont do any of this if the JSON object isn't Microsoft-styled

**Note**: This is not necessary when using ASP.NET MVC 4+ with Web API (which uses [JSON.NET](http://james.newtonking.com/projects/json-net.aspx)) 
by default). WebAPI uses ISO8601 dates and doesn't add any Microsoft specific properties to JSON objects.

### Dependencies
jQuery.msAjax has two dependencies:

* date-parse.js (also part of skinny.js).

* For less-than-awesome browsers that don't support JSON.parse() or JSON.stringify(), you should include
a polyfill, such as [Doug Crockford's json2.js](https://github.com/douglascrockford/JSON-js/blob/master/json2.js). 

### Example Usage:

#### ASMX

{% highlight javascript %}
    $.msAjax({
        url: 'PersonWebService.asmx', 
        methodName: 'GetPerson', 
        data: {'personId': 1}, 
        success: function(oPerson) { alert(oPerson.Name); },
        error: function() { logSomething(arguments); }
    });
{% endhighlight %}

 
#### WCF (REST style)

{% highlight javascript %}
    $.msAjax({
        url: 'PersonWebService.svc/People/1', 
        success: function(oPerson) { alert(oPerson.Name); },
        error: function() { logSomething(arguments); }
    });
{% endhighlight %}
