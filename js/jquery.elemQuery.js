(function($)
{
    $.fn.elemQuery = function()
    {
        var breakpoints = Array.prototype.slice.call(arguments, 0);

        this.each(function(i, el)
        {
            var $el = $(el);

            var resize = function()
            {
                var width = $el.innerWidth();

                var min = 0;
                var max = 0;

                for (var i=0; i<breakpoints.length; i++)
                {
                    if (width < breakpoints[i])
                    {
                        max = breakpoints[i];
                        break;
                    }

                    min = breakpoints[i];
                }

                var maxPart = (max === 0) ? "plus" : "to" + max;
                var cssClass = "content-" + min + maxPart;
                var previousClass = $el.data("elemQuery");
                if (previousClass)
                {
                    $el.removeClass(previousClass);
                }
                
                $el.data("elemQuery", cssClass);
                $el.addClass(cssClass);
            };

            $(document)
                .ready(resize)
                .on("resize", resize)
                .on("orientationchange", resize);
        });

        return this;
    };

})(jQuery);