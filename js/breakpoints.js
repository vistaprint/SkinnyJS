(function () {

    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    var parseClassMap = function (className) {
        var classesArr = className ? className.split(" ") : [];
        var classes = {};
        for (var i = 0; i < classesArr.length; i++) {
            classes[classesArr[i]] = true;
        }
        return classes;
    };

    var serializeClassMap = function (classMap) {
        var classes = [];
        for (var prop in classMap) {
            if (classMap.hasOwnProperty(prop)) {
                classes.push(prop);
            }
        }

        return classes.join(" ");
    };

    var compareInts = function compare(a, b) {
        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    };

    var isNumeric = function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

    var normalizeBreakpoints = function (breakpoints) {
        var maxWidths = [];

        for (var name in breakpoints) {
            var breakpoint = breakpoints[name];

            if (isNumeric(breakpoint)) {
                var max = parseInt(breakpoint, 10);
                breakpoint = {
                    max: max
                };

                breakpoints[name] = breakpoint;
            } else if (breakpoint.hasOwnProperty("max")) {
                breakpoints.max = parseInt(breakpoints.max, 10);
            } else {
                throw new Error("No max specified for breakpoint: " + name);
            }

            breakpoint.name = name;

            maxWidths.push(breakpoint.max);
        }

        maxWidths.sort(compareInts);

        return maxWidths;
    };

    var setMinWidths = function (breakpoints, maxWidths) {
        for (var name in breakpoints) {
            var breakpoint = breakpoints[name];

            if (breakpoint.hasOwnProperty("min")) {
                continue;
            }

            for (var i = 0; i < maxWidths.length; i++) {
                if (breakpoint.max == maxWidths[i]) {
                    if (i === 0) {
                        breakpoint.min = 0;
                    } else {
                        breakpoint.min = maxWidths[i - 1] + 1;
                    }
                    break;
                }
            }
        }
    };

    var addMaxBreakpoint = function (breakpoints, maxWidths) {
        if (!maxWidths || maxWidths.length === 0) {
            return;
        }

        var largestBreakpoint = maxWidths[maxWidths.length - 1];

        breakpoints.max = {
            min: largestBreakpoint + 1,
            max: Infinity
        };
    };

    var parseBreakpointAttr = function (attr) {
        if (!attr) {
            return {};
        }

        var ret;
        var pairs = attr.split(";");
        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i];

            if (pair.length > 0) {
                var delimIndex = pair.indexOf(":");
                var key, value;

                if (delimIndex > 0 && delimIndex <= pair.length - 1) {
                    key = pair.substring(0, delimIndex);
                    value = pair.substring(delimIndex + 1);
                } else {
                    throw new Error("Invalid breakpoint attribute: " + attr);
                }

                ret[key.trim()] = value.trim();
            }
        }

        return ret;
    };

    var getBreakpointsFromAttr = function (el) {
        var attr = el.attributes["data-breakpoints"];
        if (!attr || !attr.value) {
            return;
        }
        return parseBreakpointAttr(attr.value.trim());
    };

    window.breakpoints = {
        setup: function (el, breakpoints) {

            // If breakpoints aren't passed explicitly, see if there's a data-breakpoints attribute on the element.
            if (!breakpoints) {
                breakpoints = getBreakpointsFromAttr(el);
            }

            var maxWidths = normalizeBreakpoints(breakpoints);
            setMinWidths(breakpoints, maxWidths);
            addMaxBreakpoint(breakpoints, maxWidths);

            var width = el.offsetWidth;
            var classMap = parseClassMap(el.className);

            for (var name in breakpoints) {
                var breakpoint = breakpoints[name];
                var cssClass = "breakpoint-" + name;

                // Detect which breakpoints have been entered and which ones have been left.
                if (width <= breakpoint.max && width >= breakpoint.min) {
                    classMap[cssClass] = true;
                } else {
                    delete classMap[cssClass];
                }
            }

            el.className = serializeClassMap(classMap);
        }
    };

    /* test-code */

    window.breakpoints._private = {
        parseClassMap: parseClassMap,
        serializeClassMap: serializeClassMap,
        getBreakpointsFromAttr: getBreakpointsFromAttr,
        parseBreakpointAttr: parseBreakpointAttr,
        normalizeBreakpoints: normalizeBreakpoints,
        setMinWidths: setMinWidths,
        addMaxBreakpoint: addMaxBreakpoint
    };

    /* end-test-code */

})();
