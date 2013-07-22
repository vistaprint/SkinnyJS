/* jsl:option explicit */
/// <reference path="jquery.querystring.js" />

(function($)
{

/**
 * @class Parses and manipulates a URL. 
 * Allows manipulation of any component of the URL including querystring keys/values.
 * Mimics the document.location object in the DOM, 
 * but provides additional features such as querystring manipulation
 * @constructor
 * @param {string} sUrl The URL to parse.
 * @author Laban Eilers, leilers@vistaprint.com
 */
$.Url = function(url)
{
    var _url = url.toString();
    var me = this;

    /**
    * The anchor link- text after the # character
    * @type String
    */
    this.hash = "";

    /**
    * http: or https:
    * @type String
    */
    this.protocol = "";

    /**
    * The server name- example: www.vistaprint.com
    * @type String
    */
    this.hostname = "";

    /**
    * The server name- example: www.vistaprint.com
    * Includes port string if specified- example www.vistaprint.com:80
    * @type String
    */
    this.host = "";

    /**
    * The TCP port (if specified)
    * @type String
    */
    this.port = "";

    /**
    * The querystring- example: val1=foo&val2=bar
    * @type String
    */
    this.queryString = "";

    /**
    * The querystring with the initial ? if specified- example: ?val1=foo&val2=bar
    * @type String
    */
    this.search = "";

    /**
    * The root relative path to the file- example: /vp/myfile.htm
    * @type String
    */
    this.pathname = "";

    var load = function()
    {
        var iNextPart;
        var sTemp = _url;

        //protocol: "http:" or "https:"
        if (sTemp.search(/https\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
        {
            me.protocol = "https:";
            sTemp = _url.substr(8);
        }
        else if (sTemp.search(/http\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
        {
            me.protocol = "http:";
            sTemp = _url.substr(7);
        }

        if (sTemp.length === 0)
        {
            return;
        }

        //host: contains hostname and port if specified (i.e. www.vistaprint.com:80)
        if (me.protocol !== "")
        {
            //match a slash, hash, colon, or question mark
            iNextPart = sTemp.search(/[\/\?\#]/i);
            if (iNextPart == -1)
            {
                me.host = sTemp;
                return;
            }

            me.host = sTemp.substring(0, iNextPart);
            sTemp = sTemp.substr(iNextPart);
        }

        //seperate hostname & port from host
        if (me.host && me.host !== "")
        {
            var iColon = me.host.indexOf(':');
            if (iColon != -1)
            {
                me.hostname = me.host.substr(0, iColon);
                me.port = me.host.substr(iColon + 1, me.host.length);
            }
            else
            {
                me.hostname = me.host;
            }
        }

        if (sTemp.length === 0)
        {
            return;
        }

        iNextPart = sTemp.search(/[\?\#]/i);

        //pathname: i.e. /vp/mypage.htm
        if (iNextPart !== 0)
        {
            if (iNextPart == -1)
            {
                me.pathname = sTemp;
                return;
            }

            me.pathname = sTemp.substr(0, iNextPart);
            sTemp = sTemp.substr(iNextPart);
        }

        if (sTemp.length === 0)
        {
            return;
        }

        //queryString (i.e. myval1=1&myval2=2)
        //search: same as querystring with initial question mark (i.e. ?myval1=1&myval2=2)
        if (sTemp.indexOf('?') === 0)
        {
            iNextPart = sTemp.indexOf("#");

            if (iNextPart == -1)
            {
                me.queryString = sTemp.substr(1); //cut off the initial ?
                sTemp = "";
            }
            else
            {
                me.queryString = sTemp.substring(1, iNextPart);
                sTemp = sTemp.substr(iNextPart);
            }

            updateSearch();
        }

        if (sTemp.length === 0)
        {
            return;
        }

        //hash (i.e. anchor link- #myanchor)
        if (sTemp.indexOf("#") === 0)
        {
            me.hash = sTemp;
        }
    };

    var updateSearch = function()
    {
        me.search = "";
        if (me.queryString && me.queryString !== "")
        {
            me.search = "?" + me.queryString;
        }
    };

    /**
    * Gets the URL as a string
    * @return {string} The URL as a string
    */
    this.toString = function()
    {
        var sPort = me.port;
        var sProtocol = me.protocol;

        if (sPort && sPort !== "")
        {
            sPort = ':' + sPort;
        }
        if (sProtocol && sProtocol !== "")
        {
            sProtocol = sProtocol + "//";
        }
        return sProtocol + me.hostname + sPort + me.pathname + me.search + me.hash;
    };

    /**
    * Gets a specific querystring value from its key name
    * @return {string} The querystring value
    */
    this.getItem = function(key, defaultValue)
    {
        var qs = $.deparam(me.queryString);

        var value = qs[key];
        if (typeof value == "undefined")
        {
            return defaultValue;
        }

        return value;
    };

    this.getItemOrDefault = this.getItem;

    /**
    * Sets a specific querystring value by its key name
    */
    this.setItem = function(key, value)
    {
        var qs = $.deparam(me.queryString);

        if (value === null || typeof value == "undefined")
        {
            value = "";
        }
        else if (typeof value != "string")
        {
            value = value.toString();
        }

        qs[key] = value;
        me.queryString = $.param(qs);

        updateSearch();
    };

    /**
    * Removes a specific querystring value by its key name
    */
    this.removeItem = function(key)
    {
        var qs = $.deparam(me.queryString);
        delete qs[key];
        me.queryString = $.param(qs);

        me.search = "";
        if (me.queryString !== "")
        {
            me.search = '?' + me.queryString;
        }
    };

    load();
};

})(jQuery);