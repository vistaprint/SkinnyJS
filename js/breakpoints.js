(function () {

    // Polyfill for String.trim()
    if (!String.prototype.trim) {
        String.prototype.trim = function () {
            return this.replace(/^\s+|\s+$/g, "");
        };
    }

    // int comparer for sorts
    var compareInts = function compare(a, b) {
        if (a < b) {
            return -1;
        }

        if (a > b) {
            return 1;
        }

        return 0;
    };

    // Indicates if an object is numeric
    var isNumeric = function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    };

    // Given a breakpoints object, will convert simple "max" values to a rich breakpoint object
    // which can contain min, max, and name
    var setMaxWidths = function (breakpoints) {
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

    // Given a breakpoints object, will assign "min" values based on the
    // existing breakpoints "max" values.
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

    // Given a breakpoints object, will create a "max" breakpoint
    // going from the largest breakpoint's max value to infinity
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

    // Given a raw breakpoints object (with simple ints for max values), 
    // converts to a fully normalized breakpoints object with breakpoint objects for values.
    var normalize = function (breakpoints) {
        // Normalize the breakpoints object
        var maxWidths = setMaxWidths(breakpoints);
        setMinWidths(breakpoints, maxWidths);
        addMaxBreakpoint(breakpoints, maxWidths);
    };

    // Given a string in a breakpoint format, parses it into a breakpoints object
    // e.g. small:300;medium:400;large:500;
    var parseBreakpointsAttr = function (attr) {
        if (!attr) {
            return {};
        }

        var ret = {};
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

    // Gets a parsed breakpoints object from the data-breakpoints attribute of an DOM element
    var getBreakpointsFromAttr = function (el) {
        var attr = el.attributes["data-breakpoints"];
        if (!attr || !attr.value) {
            return;
        }
        return parseBreakpointsAttr(attr.value.trim());
    };

    // Gets an element from an ID, or if el is an element already, just returns it.
    var getEl = function (el) {
        if (typeof el == "string") {
            return document.getElementById(el);
        }

        return el;
    };

    // parses a list of space-delimited css classes into an object "Set"
    var parseClassMap = function (className) {
        var classesArr = className ? className.split(" ") : [];
        var classes = {};
        for (var i = 0; i < classesArr.length; i++) {
            classes[classesArr[i]] = true;
        }
        return classes;
    };

    // serializes an object "Set" into a space-delimited list of css class names
    var serializeClassMap = function (classMap) {
        var classes = [];
        for (var prop in classMap) {
            if (classMap.hasOwnProperty(prop)) {
                classes.push(prop);
            }
        }

        return classes.join(" ");
    };

    window.skinny = window.skinny || {};

    // Public API
    window.skinny.breakpoints = {

        // Given DOM element and a breakpoints object (or a DOM element with the data-breakpoints attribute),
        // this will modify the CSS classes on the element to reflect its current width.
        setup: function (el, breakpoints) {

            // Support taking an ID or an element
            el = getEl(el);

            // If breakpoints aren't passed explicitly, see if there's a data-breakpoints attribute on the element.
            if (!breakpoints) {
                breakpoints = getBreakpointsFromAttr(el);
            }

            // Normalize the breakpoints object
            normalize(breakpoints);

            var width = this.update(el, breakpoints);

            // Store the elements for jQuery to hook on later
            this.all.push({ el: el, breakpoints: breakpoints, startWidth: width });

            return breakpoints;
        },

        update: function (el, breakpoints) {

            // Support taking an ID or an element
            el = getEl(el);

            var width = el.offsetWidth;

            // If the element hasn't yet been rendered, don't modify the CSS classes
            if (width === 0) {
                return;
            }

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
        },

        all: []
    };

    /* test-code */

    window.skinny.breakpoints._private = {
        parseClassMap: parseClassMap,
        serializeClassMap: serializeClassMap,
        getBreakpointsFromAttr: getBreakpointsFromAttr,
        parseBreakpointsAttr: parseBreakpointsAttr,
        setMaxWidths: setMaxWidths,
        setMinWidths: setMinWidths,
        addMaxBreakpoint: addMaxBreakpoint
    };

    /* end-test-code */

})();
