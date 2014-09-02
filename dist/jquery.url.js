/// <reference path="jquery.queryString.js" />

(function ($) {

    // Parses and manipulates a URL. 
    $.Url = function (url) {
        var me = this;

        var _normalize = function (input) {
            if (input == null || input === "") {
                return "";
            }

            return input.toString();
        };

        // http: or https:
        var _protocol = "";

        this.protocol = function (value) {
            if (typeof value != "undefined") {
                _protocol = _normalize(value);

                if (_protocol) {
                    if (_protocol.charAt(_protocol.length - 1) != ":") {
                        _protocol += ":";
                    }
                }
            } else {
                return _protocol;
            }
        };

        // The server name- example: www.vistaprint.com
        var _hostname = "";

        this.hostname = function (value) {
            if (typeof value != "undefined") {
                _hostname = _normalize(value);
            } else {
                return _hostname;
            }
        };

        var _port = "";

        // The TCP port (if specified)
        this.port = function (value) {
            if (typeof value != "undefined") {
                _port = _normalize(value);
            } else {
                return _port;
            }
        };

        // The server name- example: www.vistaprint.com
        // Includes port string if specified- example www.vistaprint.com:80
        this.host = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);

                // Separate hostname & port from host
                if (value) {
                    var colonPos = value.indexOf(":");
                    if (colonPos != -1) {
                        _hostname = value.substr(0, colonPos);
                        _port = value.substr(colonPos + 1, value.length);
                    } else {
                        _hostname = _normalize(value);
                        _port = "";
                    }
                } else {
                    _hostname = "";
                    _port = "";
                }
            } else {
                var out = _hostname;
                if (_port) {
                    out += ":" + _port;
                }
                return out;
            }
        };

        var _pathname = "";

        // The root relative path to the file- example: /vp/myfile.htm
        this.pathname = function (value) {
            if (typeof value != "undefined") {
                _pathname = _normalize(value);
            } else {
                return _pathname;
            }
        };

        // The querystring- example: val1=foo&val2=bar
        this.queryString = {};

        // The querystring with the initial ? if specified- example: ?val1=foo&val2=bar
        this.search = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);
                me.queryString = $.deparam(value);
            } else {
                var qs = $.param(me.queryString);
                return qs ? "?" + qs : qs;
            }
        };

        // The anchor link- text after the # character
        var _hash = "";

        this.hash = function (value) {
            if (typeof value != "undefined") {
                value = _normalize(value);

                // Always ensure there is a # for any non-empty string
                if (value.length > 0) {
                    if (value.charAt(0) != "#") {
                        value = "#" + value;
                    }
                }
                _hash = value;
            } else {
                return _hash;
            }
        };

        var load = function (url) {
            var nextPartPos;
            var temp = url;

            // protocol: "http:" or "https:"
            if (temp.search(/https\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                _protocol = "https:";
                temp = url.substr(8);
            } else if (temp.search(/http\:\/\/+/i) === 0) //The ending + is to prevent comment removers from messing up this line
            {
                _protocol = "http:";
                temp = url.substr(7);
            }

            if (temp.length === 0) {
                return;
            }

            // host: contains hostname and port if specified (i.e. www.vistaprint.com:80)
            if (_protocol !== "") {
                //match a slash, hash, colon, or question mark
                nextPartPos = temp.search(/[\/\?\#]/i);
                if (nextPartPos == -1) {
                    me.host(temp);
                    return;
                }

                me.host(temp.substring(0, nextPartPos));
                temp = temp.substr(nextPartPos);
            }

            if (temp.length === 0) {
                return;
            }

            nextPartPos = temp.search(/[\?\#]/i);

            //pathname: i.e. /vp/mypage.htm
            if (nextPartPos !== 0) {
                if (nextPartPos == -1) {
                    _pathname = temp;
                    return;
                }

                _pathname = temp.substr(0, nextPartPos);
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
                    me.queryString = $.deparam(temp.substr(1));
                    temp = "";
                } else {
                    me.queryString = $.deparam(temp.substring(1, nextPartPos));
                    temp = temp.substr(nextPartPos);
                }
            }

            if (temp.length === 0) {
                return;
            }

            //hash (i.e. anchor link- #myanchor)
            if (temp.indexOf("#") === 0) {
                _hash = temp;
            }
        };

        // Gets the URL as a string
        this.toString = function () {
            var url = "";
            var host = me.host();
            if (host) {
                url = (_protocol || "http:") + "//" + me.host();
            }
            return url + me.pathname() + me.search() + me.hash();
        };

        // Gets a specific querystring value from its key name
        this.get = function (key, defaultValue) {
            if (!me.queryString.hasOwnProperty(key)) {
                return defaultValue;
            }

            return _normalize(me.queryString[key]);
        };

        // Sets a specific querystring value by its key name
        this.set = function (key, value) {
            if (key == null || key === "") {
                throw new Error("Invalid key: " + key);
            }

            me.queryString[key] = value;
        };

        // Removes a specific querystring value by its key name
        this.remove = function (key) {
            delete me.queryString[key];
        };


        this.getItemOrDefault = this.get;
        this.getOrDefault = this.get;
        this.getItem = this.get;
        this.setItem = this.set;
        this.removeItem = this.remove;

        load(url ? url.toString() : "");
    };

})(jQuery);
