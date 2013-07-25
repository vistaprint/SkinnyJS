(function($)
{

// Encodes a cookie text value, making sure to replace %20 with +
// and + with %2b. This is done because %20 gets lost going to the
// server.
var cookieEncode = function(text) 
{
    if (!text)
    {
        return "";
    }
    else
    {
        text = text.toString();
    }
    
    // First urlencode
    text = encodeURIComponent(text);
    
    // Then replace + and space
    text = text.replace(/\+/gi, "%2B").replace(/\%20/gi, "+");
    
    return text;    
};

// Decodes a cookie text value, making sure to replace + with %20
// and %2b with +. This undoes cookieEncode().
var cookieDecode = function(text) 
{
    if (!text)
    {
        return "";
    }
    else
    {
        text = text.toString();
    }

    // First replace + and space
    text = text.replace(/\+/gi, "%20").replace(/\%2B/gi, "+");

    // Then urldecode
    return decodeURIComponent(text);
};

// Ensures that if no domain is specified, the correct domain is used
// (as specified by the server). If null/empty, uses the default domain from the server.
var ensureDomain = function(domain)
{
    if (!domain && window._cookieDomain)
    {
        domain = window._cookieDomain;
    }

    return domain;
};

// Runs a test to determine if cookies are enabled on the browser.
$.cookie.isEnabled = function() 
{   
    $.cookie.set("test", "value");
    if ($.cookie.get("test") == "value") 
    {
        $.cookie.remove("test");
        return true;
    } 
    else 
    {
        return false;
    }
};


// Gets a cookie or sub-cookie value.
// If subCookie is specified, it will be retrieved.
// if the cookie contains subvalues, and the specific subCookie key isn't specified,
// an object containing all sub-values is returned.
$.cookie.get = function(name, /* optional */ subCookie)
{
    var cookies = new Cookies();
    var cookie = cookies[name];
    if (cookie)
    {
        if (subCookie)
        {
            if (cookie.subCookies)
            {
                return cookie.subCookies[subCookie] || "";
            }

            return null;
        }

        if (cookie.subCookies)
        {
            return cookie.subCookies;
        }
        else
        {
            return cookie.value || "";
        }
    }
    
    return null;
};

/**
* Sets a cookie value.
* @param {string} or {object} nameOrData The name of the cookie or an object containing the arguments.
* @param {string} or {object} value The value to set. Either a single value or an object of key value pairs.
* @param {string} domain (Optional) The domain in which to store the cookie. Uses the default domain if not specified.
* @param {Boolean} permanent (Optional) Indicates the cookie should be permanent. False by default.
* @param {Boolean} clearExistingSubCookies (Optional) If true, all sub-cookoies will be erased before writing new ones. 
                                                    False by default.
*/
$.cookie.set = function(nameOrData, value, domain, permanent, clearExistingSubCookies)
{
    var name = nameOrData;

    if (typeof(nameOrData) == "object")
    {
        name = nameOrData.name;
        value = nameOrData.value;
        domain = nameOrData.domain;
        permanent = nameOrData.permanent;
        clearExistingSubCookies = nameOrData.clearExistingSubCookies;
    }

    domain = ensureDomain(domain);

    // Value may be a map of subvalues.
    var subCookies;
    if (typeof(value) == "object" && value !== null)
    {
        subCookies = value;
        value = null;
    }

    // Check for an existing cookie. If not, create it.
    var cookie = (new Cookies())[name];
    if (!cookie)
    {
        cookie = new Cookie();
        cookie.name = name;
    }

    cookie.value = value;

    if (subCookies)
    {
        if (clearExistingSubCookies || !cookie.subCookies)
        {
            cookie.subCookies = subCookies;
        }
        else
        {
            // Subcookies should be merged into the existing ones.
            for (var subCookie in subCookies)
            {
                if (subCookies.hasOwnProperty(subCookie))
                {
                    cookie.subCookies[subCookie] = subCookies[subCookie];
                }
            }
        }
    }

    cookie.domain = domain;
    cookie.isPermanent = !!permanent;

    cookie.save();
};

/**
 * Deletes the cookie with the specified name.
 * @param {string} sName The name of the cookie to delete.
 */
$.cookie.remove = function(sName, domain) 
{
    var cookieText = cookieEncode(sName) + "=a; path=/; expires=Wed, 17 Jan 1979 07:01:00 GMT";
    domain = ensureDomain(domain);
    if (domain !== "") 
    {
        cookieText += "; domain=" + domain;
    }
    document.cookie = cookieText;
};

/**
* @class Represents a collection of cookies stored in the browser.
* Exposes the cookies as a dictionary of cookie names and cookie objects.
*/
var Cookies = function()
{
    var me = this;
    var cookie = document.cookie.toString();
    var cookieValues = cookie.split(";");
    
    for (var i=0; i<cookieValues.length; i++)
    {
        var oCookie = new Cookie();
        oCookie.parse(cookieValues[i]);
        if (oCookie.name)
        {
            me[oCookie.name] = oCookie;
        }
    }
};

/**
* @class Represents a cookie. Contains a value or a subvalues collection.
* @constructor
*/
var Cookie = function()
{
    var me = this;
    
    /**
    * The name of the cookie
    * @type string
    */
    this.name = null;
    
    /**
    * A collection of sub-values for the cookie. Null if there is a single value
    * @type collection
    */
    this.subCookies = null;
    
    /**
    * The value of the cookie. Null if there is a collection of sub-values
    * @type string
    */
    this.value = null;
    
    /**
    * The domain of the cookie. If null, the default domain is used.
    * @type string
    */
    this.domain = null;
    
    /**
    * Indicates the cookie persists on users machines
    * @type boolean
    */
    this.isPermanent = false;
    
    var validateName = function()
    {
        if (!me.name) 
        {
            throw new Error("Cookie: Cookie name is null.");
        }
    };
    
    /**
    * Gets the cookie as a serialized string
    * @return {String}
    */
    this.serialize = function()
    {
        validateName();

        var cookie = cookieEncode(me.name) + "=" + getEncodedValue();

        cookie += "; path=/";
        
        var sDomain = ensureDomain(me.domain);
        if (sDomain) 
        {
            cookie += "; domain=" + sDomain;
        }
        
        if (me.isPermanent)
        {

            var date = new Date();
            date.setFullYear(date.getFullYear() + 1);

            cookie += "; expires=" + date.toUTCString();
        }
        
        return cookie;
    };
    
    /**
    * Saves the value of the cookie- commits it to the browser's cookies.
    */
    this.save = function()
    {
        validateName();
        
        document.cookie = me.serialize();
    };
    
    /**
    * Takes the encoded value of the cookie as it is stored on disk, and populates the object with it.
    * @param {string} unparsedValue The encoded cookie data
    */
    this.parse = function(unparsedValue)
    {
        if (!unparsedValue)
        {
            return;
        }
        
        //trim the raw string off the leading and trailing spaces
        unparsedValue = unparsedValue.replace(/^\s*(.*?)\s*$/, "$1");
           
        //The name of the cookie is the value before the first "="
        var iPosEquals = unparsedValue.indexOf("=");
        if (iPosEquals <= 0)
        {
            return;
        }
        
        me.name = cookieDecode(unparsedValue.substr(0, iPosEquals));
        
        var sValue = unparsedValue.substr(iPosEquals + 1);
        if (sValue.indexOf("=") == -1)
        {
            me.value = cookieDecode(sValue);
            return;
        }
        
        me.subCookies = {};
        
        var subCookies = sValue.split("&");
        for (var i=0; i<subCookies.length; i++)
        {
            var subCookie = subCookies[i].split("=");
            if (subCookie.length != 2)
            {
                me.subCookies = null;
                return;
            }
            else
            {
                me.subCookies[cookieDecode(subCookie[0])] = cookieDecode(subCookie[1]);
            }
        }
    };
    
    /**
    * Gets the encoded value of the cookie (handles subcookies too).
    */
    var getEncodedValue = function()
    {
        if (me.subCookies)
        {
            var buffer = [];
            for (var sSub in me.subCookies)
            {
                buffer.push(cookieEncode(sSub) + "=" + cookieEncode(me.subCookies[sSub]));
            }
            return buffer.join("&");
        }
        else
        {
            return cookieEncode(me.value);
        }
    };
};

})(jQuery);