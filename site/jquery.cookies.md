---
layout: main
title: jquery.cookies
---

## jQuery.cookies

jQuery.cookies is a general purpose cookie library with several distinguishing design features:

1. Ability to specify defaults for domain, path, and "permanent" cookie expiration date
2. Presumes that most cookies are intended as either session scoped or permanent. Most web developers don't want to set expiration dates manually.
3. Ability to easily manage sub-values within top-level cookies.

### Usage

jQuery.cookies allows setting a default path, domain, and expiration date (for permanent cookies) for all usages of its API where these values are not explicitly specified. To set defaults, use $.cookies.setDefaults(). The options include:

* **path**: Sets the default path. By default, it is "/".
* **domain**: Sets the default domain. By default, it is "".
* **permanentDate**: Sets the expiration date to use for cookies you declare "permanent". By default, it is 1 year into the future. This should be specified as a UTC date.

{% highlight javascript %}
    $.cookies.setDefaults({ 
        path: "/", 
        domain: "vistaprint.com",
        permanentDate: "Sun, 13 Oct 2100 19:53:24 GMT"
    });
{% endhighlight %}

#### Setting and getting cookies

Here's a basic example of setting and getting a top-level cookie:
{% highlight javascript %}

    // Sets a top-level session cookie
    $.cookies.set("userid", "12345");

    // Gets the value of a cookie
    var value = $.cookies.get("userid");

{% endhighlight %}

Some more examples of setting cookies:

{% highlight javascript %}

    // Sets a top-level session cookie using the object syntax 
    $.cookies.set({ 
        name: "userid", 
        value: "12345" 
    });

    // Sets a top-level permanent cookie using the object syntax 
    $.cookies.set({ 
        name: "userid", 
        value: "12345",
        permanent: true
    });

    // Overrides domain and path
    $.cookies.set({ 
        name: "userid", 
        value: "12345",
        permanent: true,
        domain: "somesubdomain.vistaprint.com",
        path: "/special-directory"
    });

{% endhighlight %}

#### Working with sub values
You can use an object to specify sub-values for a cookie:

{% highlight javascript %}

    // Use an object literal to pass key-value pairs
    $.cookies.set("user", { id: "12345", favoriteColor: "blue" });

    // When retrieving a cookie with sub-values, the return value is an object.
    var userId = $.cookies.get("user").id;

    // You can also use this alternate syntax to avoid potential null reference errors
    var userId = $.cookies.get("user", "id");

    // Setting a cookie with sub-values, using object syntax
    $.cookies.set({ 
        name: "userid", 
        value: { id: "12345", favoriteColor: "blue" }    
    });

{% endhighlight %}

#### Removing cookies
To remove/delete a cookie, use jQuery.cookie.remove():

{% highlight javascript %}

    $.cookies.remove("user");

{% endhighlight %}

#### Checking if cookies are enabled

{% highlight javascript %}

    if ($.cookies.enabled())
    {
        // use cookies
    }

{% endhighlight %}
