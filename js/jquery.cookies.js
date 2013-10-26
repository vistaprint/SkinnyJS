(function($)
{

$.cookies = {};

// Encodes a cookie text value, making sure to replace %20 with +
// and + with %2b. This is done because %20 gets lost going to the
// server.
// @param {string} sText The text to encode.
// @return {string} The encoded text.
var _cookieEncode = function(sText) 
{
    if (!sText)
    {
        return "";
    }
    else
    {
        sText = sText.toString();
    }
    
    // first urlencode
    sText = encodeURIComponent(sText);
    
    // then replace + and space
    sText = sText.replace(/\+/gi, "%2B").replace(/\%20/gi, "+");
    
    // return the text
    return sText;    
};

// Decodes a cookie text value, making sure to replace + with %20
// and %2b with +. This undoes _cookieEncode().
// @param {string} sText The text to decode.
// @return {string} The decoded text.
var _cookieDecode = function(sText) 
{
    if (!sText)
    {
        return "";
    }
    else
    {
        sText = sText.toString();
    }

    // first replace + and space
    sText = sText.replace(/\+/gi, "%20").replace(/\%2B/gi, "+");

    // now urldecode
    return decodeURIComponent(sText);
};

var _defaultPermanentDate = function()
{
    var d = new Date(); 
    d.setFullYear(d.getFullYear() + 1); 
    return d.toUTCString();
};

var _defaults = 
{
    domain: null,
    path: "/",
    permanentDate: _defaultPermanentDate(),
    watcher: $.noop
};

var _settings = _defaults;

$.cookies.setDefaults = function(settings)
{
    _settings = $.extend({}, _defaults, settings);
};

var _getDefault = function(key, overrideValue)
{
    if (overrideValue)
    {
        return overrideValue;
    }

    return _settings[key];
};

// Runs a test to determine if cookies are enabled on the browser.
// @return {boolean} True if cookies are enabled, false if not.
$.cookies.enabled = function() 
{   
    $.cookies.set("cookietest", "value");
    if ($.cookies.get("cookietest") == "value") 
    {
        $.cookies.remove("cookietest");
        return true;
    } 
    else 
    {
        return false;
    }
};

// Gets a cookie or sub-cookie value.
// @param {string} name The name of the cookie
// @param {string} subCookie Optional. The sub-cookie value to get
// @return {string} or {object} (if the cookie contains subvalues)
$.cookies.get = function(name, /* optional */ subCookie)
{
    var cookies = new Cookies();
    var cookie = cookies[name];
    if (cookie)
    {
        if (subCookie)
        {
            if (cookie.subCookies)
            {
                return cookie.subCookies[subCookie] || null;
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

// Sets a cookie value.
// @param {string} or {object} nameOrData The name of the cookie or an object containing the arguments.
// @param {string} or {object} value The value to set. Either a single value or an object of key value pairs.
// @param {string} domain (Optional) The domain in which to store the cookie. Uses the default domain if not specified.
// @param {Boolean} permanent (Optional) Indicates the cookie should be permanent. False by default.
// @param {Boolean} clearExistingSubCookies (Optional) If true, all sub-cookoies will be erased before writing new ones. False by default.
$.cookies.set = function(nameOrData, value, domain, permanent, clearExistingSubCookies)
{
    var name = nameOrData;
    var path;

    if (typeof(nameOrData) == "object")
    {
        name = nameOrData.name;
        value = nameOrData.value;
        domain = nameOrData.domain;
        permanent = nameOrData.permanent;
        path = nameOrData.path;
        clearExistingSubCookies = nameOrData.clearExistingSubCookies || nameOrData.clearExisting;
    }

    // value may be a map of subvalues.
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

    cookie.domain = _getDefault("domain", domain);
    cookie.path = _getDefault("path", path);
    cookie.isPermanent = !!permanent;

    cookie.save();
};

// Deletes the cookie with the specified name.
// @param {string} sName The name of the cookie to delete.
$.cookies.remove = function(name, domain, path) 
{
    var cookie = _cookieEncode(name) + "=a; path=" + _getDefault("path", path) + "; expires=Wed, 17 Jan 1979 07:01:00 GMT";
    
    domain = _getDefault("domain", domain);
    if (domain) 
    {
        cookie += "; domain=" + domain;
    }

    _settings.watcher(cookie);

    document.cookie = cookie;
};

// @class Represents a collection of cookies stored in the browser.
// Exposes the cookies as a dictionary of cookie names and cookie objects.
var Cookies = function()
{
    var me = this;
    var cookie = document.cookie.toString();
    var cookieArray = cookie.split(";");
    
    var iLen = cookieArray.length;
    for (var i=0; i<iLen; i++)
    {
        var oCookie = new Cookie();
        oCookie.parse(cookieArray[i]);
        if (oCookie.name)
        {
            me[oCookie.name] = oCookie;
        }
    }
};

// @class Represents a cookie. Contains a value or a subvalues collection.
// @constructor
var Cookie = function()
{
    var me = this;
    
    // The name of the cookie
    this.name = null;
    
    // A collection of sub-values for the cookie. Null if there is a single value
    this.subCookies = null;
    

    // The value of the cookie. Null if there is a collection of sub-values
    this.value = null;
    

    // The domain of the cookie. If null, the default domain is used.
    this.domain = null;

    // The path of the cookie. If null, the default path / is used.
    this.path = null;
    
    // Indicates the cookie persists on users machines
    this.isPermanent = false;
    
    var _validateName = function()
    {
        if (!me.name) 
        {
            throw new Error("Cookie: Cookie name is null.");
        }
    };
    

    // Gets the cookie as a serialized string
    // @return {String}
    this.serialize = function()
    {
        _validateName();

        var cookie = _cookieEncode(me.name) + "=" + _getEncodedValue();

        cookie += "; path=" + _getDefault("path", this.path);
        
        var domain = _getDefault("domain", me.domain);
        if (domain) 
        {
            cookie += "; domain=" + domain;
        }
        
        if (me.isPermanent)
        {
            cookie += "; expires=" + _getDefault("permanentDate");
        }
        
        return cookie;
    };
    

    // Saves the value of the cookie- commits it to the browser's cookies.
    this.save = function()
    {
        _validateName();
        
        var cookie = me.serialize();
        _settings.watcher(cookie);

        document.cookie = cookie;
    };
    

    // Takes the encoded value of the cookie as it is stored on disk, and populates the object with it.
    // @param {string} sUnparsedValue The encoded cookie data
    this.parse = function(sUnparsedValue)
    {
        if (!sUnparsedValue)
        {
            return;
        }
        
        //trim the raw string off the leading and trailing spaces
        sUnparsedValue = sUnparsedValue.replace(/^\s*(.*?)\s*$/, "$1");
           
        //The name of the cookie is the value before the first "="
        var iPosEquals = sUnparsedValue.indexOf("=");
        if (iPosEquals <= 0)
        {
            return;
        }
        
        me.name = _cookieDecode(sUnparsedValue.substr(0, iPosEquals));
        
        var sValue = sUnparsedValue.substr(iPosEquals + 1);
        if (sValue.indexOf("=") == -1)
        {
            me.value = _cookieDecode(sValue);
            return;
        }
        
        me.subCookies = {};
        
        var aSubCookies = sValue.split("&");
        var iLen = aSubCookies.length;
        for (var i=0; i<iLen; i++)
        {
            var aSubCookie = aSubCookies[i].split("=");
            if (aSubCookie.length != 2)
            {
                me.subCookies = null;
                return;
            }
            else
            {
                me.subCookies[_cookieDecode(aSubCookie[0])] = _cookieDecode(aSubCookie[1]);
            }
        }
    };
    

    // Gets the encoded value of the cookie (handles subcookies too).
    var _getEncodedValue = function()
    {
        if (me.subCookies)
        {
            var aOut = [];
            for (var sSub in me.subCookies)
            {
                aOut.push(_cookieEncode(sSub) + "=" + _cookieEncode(me.subCookies[sSub]));
            }
            return aOut.join("&");
        }
        else
        {
            return _cookieEncode(me.value);
        }
    };

    /* test-code */

    $.cookies.private = 
    {
        _getEncodedValue: _getEncodedValue,
        _cookieEncode: _cookieEncode,
        _cookieDecode: _cookieDecode, 
        _validateName: _validateName,
        _defaultPermanentDate: _defaultPermanentDate,
        _getDefault: _getDefault,
        Cookies: Cookies,
        Cookie: Cookie
    };

    /* end-test-code */
};

})(jQuery);