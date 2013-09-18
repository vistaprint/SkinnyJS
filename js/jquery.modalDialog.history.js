/* globals History */

(function($) 
{
    var url = "#dialog";

    $.modalDialog.enableHistory = function()
    {
        $.modalDialog.onopen.add(openHandler);
        $.modalDialog.onclose.add(closeHandler);
    };

    var openHandler = function()
    {
        History.pushState({ dialog: this, action: "open" }, null, url);
    };

    var closeHandler = function()
    {
        History.pushState({ dialog: this, action: "close" }, null, "");
    };

})(jQuery);
