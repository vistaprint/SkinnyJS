$(document).ready(function()
{
    var _cleanEls = [];

    var tempEl = function(html)
    {
        var $el = $(html);
        _cleanEls.push($el);
        return $el;
    };

    var basicEl = function()
    {
        return tempEl("<div />")
            .css({ position: "absolute", width: 100, height: 100, top: 100, left: 100 })
            .appendTo("body");
    };

    var cleanup = function()
    {
        while (_cleanEls.length > 0)
        {
            _cleanEls[0].remove();
            _cleanEls.splice(0, 1);
        }
    };

    var rectEquals = function(rect, top, left, width, height)
    {
        var bottom = top + height;
        var right = left + width;
        equal(Math.round(rect.top), top, "top should be " + top);
        equal(Math.round(rect.left), left, "left should be " + left);
        equal(Math.round(rect.width), width, "width should be " + width);
        equal(Math.round(rect.height), height, "height should be " + height);
        equal(Math.round(rect.bottom), bottom, "bottom should be " + bottom);
        equal(Math.round(rect.right), right, "right should be " + right);
    };

    var testClientRect = function(name, fn)
    {
        test(name, function() { 
            $.support.getBoundingClientRect = true;
            fn(); 
        });

        test(name +  " no getBoundingClientRect", function() { 
            $.support.getBoundingClientRect = false;
            fn(); 
        });
    };

    testClientRect("basic", function() 
    {
        var $el = basicEl();

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        cleanup();
    });

    testClientRect("detached element returns 0 rect", function() 
    {
        var $el = basicEl().remove();

        var rect = $el.clientRect();

        rectEquals(rect, 0, 0, 0, 0);

        cleanup();
    });

    testClientRect("hidden element returns 0 rect", function() 
    {
        var $el = basicEl().hide();

        var rect = $el.clientRect();

        rectEquals(rect, 0, 0, 0, 0);

        cleanup();
    });

    testClientRect("basic with margin", function() 
    {
        var $el = basicEl().css("margin", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 110, 110, 100, 100);

        cleanup();
    });

    testClientRect("basic with padding", function() 
    {
        var $el = basicEl().css("padding", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 120, 120);

        cleanup();
    });

    testClientRect("basic with border", function() 
    {
        var $el = basicEl().css("border", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        cleanup();
    });

    testClientRect("document element with margin", function() 
    {
        var $el = basicEl();

        $(document).css("margin", 10);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        $(document).css("margin", 0);
        cleanup();
    });


    testClientRect("window scrolled", function() 
    {
        var $el = basicEl();

        // Create a big element so we can scroll the window
        basicEl().css({ height: 1000, width: 1000, position: "absolute" });

        window.scrollTo(150, 150);

        var rect = $el.clientRect();

        rectEquals(rect, 100, 100, 100, 100);

        window.scrollTo(0, 0);
        cleanup();
    });

    testClientRect("in element with overflow scroll", function() 
    {
        var $outerEl = basicEl().css({ overflow: "scroll" });

        $("<div />").css({ width: 200, height: 200 }).appendTo($outerEl);

        var $el = $("<div />").css({ width: 20, height: 20 }).appendTo($outerEl);

        $outerEl.scrollTop(50);
        
        var rect = $el.clientRect();

        rectEquals(rect, 250, 100, 20, 20);

        cleanup();
    });

});






