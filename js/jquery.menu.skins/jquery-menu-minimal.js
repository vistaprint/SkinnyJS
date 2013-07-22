/*jsl:option explicit*/

(function($)
{
    var TRANSITION_TIME = 300;

    $.registerDropDownMenuSkin(
        "minimal",
        {
            position: function(e)
            {
                if (e.level === 0)
                {
                    var left = parseInt("-" + e.$item.css("borderLeftWidth")) || 0;
                    var top = e.$item.outerHeight() + 4;

                    // Render the panel so it can be measured, but keep it hidden.
                    e.$panel.css(
                    { 
                        visibility: "hidden", 
                        display: "block", 
                        top: top,
                        left: left 
                    });
                
                    var offset = e.$panel.offset();
                    var right = offset.left + e.$panel.outerWidth();
                    var diff = right - $(window).width();

                    // Ensure the panel does not go out of the right side of the window
                    if (diff > 0)
                    {
                        left -= diff;
                    }

                    e.$panel.css({
    			        top: top,
                        left: left,
                        visibility: "",
                        display: "none"
    		        });

    	            return;
                }
    		
                var pos = e.$item.position();
 
                e.$panel.css({
    		            left: pos.left + e.$item.innerWidth(), 
    		            top: 0
    	            });
            },

            animationShow: function(e, callback)
            {
                e.$panel.fadeIn(TRANSITION_TIME, callback);
            },

            animationHide: function(e, callback)
            {
                e.$panel.fadeOut(TRANSITION_TIME, callback);
            }
        });

})(jQuery);