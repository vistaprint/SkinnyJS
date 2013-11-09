/// <reference path="jquery.querystring.js" />

(function($) {

    // Parses and manipulates a URL. 
    $.Url = function(url) {
        var me = this;

        // The anchor link- text after the # character
        this.hash = "";

        // http: or https:
        this.protocol = "";

        // The server name- example: www.vistaprint.com
        this.hostname = "";

        // The server name- example: www.vistaprint.com
        // Includes port string if specified- example www.vistaprint.com:80
        this.host = "";

        // The TCP port (if specified)
        this.port = "";

        // The querystring- example: val1=foo&val2=bar
        this.queryString = "";

        // The querystring with the initial ? if specified- example: ?val1=foo&val2=bar
        this.search = "";

        // The root relative path to the file- example: /vp/myfile.htm
        this.pathname = "";

        var load = function(url) {
            var nextPartPos;
            var temp = url;

            // protocol: "http:" or "https:"
            if (temp.search(/https\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                me.protocol = "https:";
                temp = url.substr(8);
            } else if (temp.search(/http\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                me.protocol = "http:";
                temp = url.substr(7);
            }

            if (temp.length === 0) {
                return;
            }

            //host: contains hostname and port if specified (i.e. www.vistaprint.com:80)
            if (me.protocol !== "") {
                //match a slash, hash, colon, or question mark
                nextPartPos = temp.search(/[\/\?\#]/i);
                if (nextPartPos == -1) {
                    me.host = temp;
                    return;
                }

                me.host = temp.substring(0, nextPartPos);
                temp = temp.substr(nextPartPos);
            }

            // Separate hostname & port from host
            if (me.host && me.host !== "") {
                var colorPos = me.host.indexOf(":");
                if (colorPos != -1) {
                    me.hostname = me.host.substr(0, colorPos);
                    me.port = me.host.substr(colorPos + 1, me.host.length);
                } else {
                    me.hostname = me.host;
                }
            }

            if (temp.length === 0) {
                return;
            }

            nextPartPos = temp.search(/[\?\#]/i);

            //pathname: i.e. /vp/mypage.htm
            if (nextPartPos !== 0) {
                if (nextPartPos == -1) {
                    me.pathname = temp;
                    return;
                }

                me.pathname = temp.substr(0, nextPartPos);
                temp = temp.substr(nextPartPos);
            }

            if (temp.length === 0) {
                return;
            }

            // queryString (i.e. myval1=1&myval2=2)
            // search: same as querystring with initial question mark (i.e. ?myval1=1&myval2=2)
            if (temp.indexOf("?") === 0) {
                nextPartPos = temp.indexOf("#");

                if (nextPartPos == -1) {
                    me.queryString = temp.substr(1); //cut off the initial ?
                    temp = "";
                } else {
                    me.queryString = temp.substring(1, nextPartPos);
                    temp = temp.substr(nextPartPos);
                }

                updateSearch();
            }

            if (temp.length === 0) {
                return;
            }

            //hash (i.e. anchor link- #myanchor)
            if (temp.indexOf("#") === 0) {
                me.hash = temp;
            }
        };

        var updateSearch = function() {
            me.search = "";
            if (me.queryString && me.queryString !== "") {
                me.search = "?" + me.queryString;
            }
        };

        // Gets the URL as a string
        this.toString = function() {
            var sPort = me.port;
            var sProtocol = me.protocol;

            if (sPort && sPort !== "") {
                sPort = ":" + sPort;
            }
            if (sProtocol && sProtocol !== "") {
                sProtocol = sProtocol + "//";
            }
            return sProtocol + me.hostname + sPort + me.pathname + me.search + me.hash;
        };

        // Gets a specific querystring value from its key name
        this.getItem = function(key, defaultValue) {
            var qs = $.deparam(me.queryString);

            var value = qs[key];
            if (typeof value == "undefined") {
                return defaultValue;
            }

            return value;
        };

        this.getItemOrDefault = this.getItem;

        // Sets a specific querystring value by its key name
        this.setItem = function(key, value) {
            var qs = $.deparam(me.queryString);

            if (value === null || typeof value == "undefined") {
                value = "";
            } else if (typeof value != "string") {
                value = value.toString();
            }

            qs[key] = value;
            me.queryString = $.param(qs);

            updateSearch();
        };

        // Removes a specific querystring value by its key name
        this.removeItem = function(key) {
            var qs = $.deparam(me.queryString);
            delete qs[key];
            me.queryString = $.param(qs);

            me.search = "";
            if (me.queryString !== "") {
                me.search = "?" + me.queryString;
            }
        };

        load(url.toString());
    };

})(jQuery);
