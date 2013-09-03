// ## jQuery.uncomment

// Allows lazy evaluation of HTML blobs by removing them from comment blocks.

// ### Usage

// Emit expensive content from the server in comment blocks
// to ensure lazy loading across all browsers:

//     <div class="commented-container">
//       <!--
//       <script src="some-expensive-widget.js"></script>
//       <img src="some-expensive-widget-logo.jpg" />
//       -->
//     </div>

// Then, use this plugin to remove the comments and load the content:

//     $(".commented-container").uncomment();

// ### Source

(function($)
{
    $.fn.uncomment = function()
    {
        for (var i = 0, l = this.length; i<l; i++)
        {
            for (var j = 0, len = this[i].childNodes.length; j<len; j++)
            {
                if (this[i].childNodes[j].nodeType === 8)
                {
                    var content = this[i].childNodes[j].nodeValue;
                    $(this[i].childNodes[j]).replaceWith(content);
                }
            }
        }
    };
})(jQuery);