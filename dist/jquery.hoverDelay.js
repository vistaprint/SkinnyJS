(function($)
{
    //Simplified version of hoverIntent.
    //Supports distinct over and out delays
    $.fn.hoverDelay = function(options)
    {
        var _defaults = {
            over: function() {},
            out: function() {},
            delayOver: 0,
            delayOut: 0
        };
        
        var _options = $.extend({}, _defaults, options);
        
        //For each element in the jQuery collection,
        //assign a mouseover and mouseout event handlers
        //that have been "debounced" (wrapped with setTimeouts).
        this.each(function()
        {
            var overTimer = null;
            var outTimer = null;
            
            var clearTimers = function()
            {
                if (overTimer)
                {
                    clearTimeout(overTimer);
                }
                
                if (outTimer)
                {
                    clearTimeout(outTimer);
                }
            };
            
            var mouseOver = function(e)
            {
                var me = this;
                clearTimers();

                if (_options.delayOver === 0)
                {
                    _options.over.call(this, e);
                }
                else
                {
                    overTimer = setTimeout(function() { _options.over.call(me, e); }, _options.delayOver);
                }
            };
            
            var mouseOut = function(e)
            {
                var me = this;
                clearTimers();
                
                if (_options.delayOut === 0)
                {
                    _options.out.call(this, e);
                }
                else
                {
                    outTimer = setTimeout(function() { _options.out.call(me, e); }, _options.delayOut);
                }
            };
        
            $(this).hover(mouseOver, mouseOut);
        });
        
        return this;
    };

    
})(jQuery);