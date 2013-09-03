// ## jQuery.ns

// Declare namespaces with no boilerplate.
// Won't overwrite existing namespaces.

// ### Usage

//     $.ns("widgetco.util.html")
//     
//     widgetco.util.html.writeHeader = function() { // ...

// ### Source

(function($)
{
    /**
    * Defines namespaces
    * @param {String} namespace
    */
    $.ns = function(namespace)
    {
        var parts = namespace.split(".");

        var last = window;
        for (var i=0; i<parts.length; i++)
        {
            var obj = last[parts[i]];
            if (!obj)
            {
                obj = {};
                last[parts[i]] = obj;
            }
            last = obj;
        }
    };
})(jQuery);