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