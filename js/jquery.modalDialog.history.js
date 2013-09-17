/* globals History */

jQuery(function() 
{
    var $ = jQuery;
    var url = "foo";

    $.modalDialog.onopen.add(function()
    {
        History.pushState({ dialog: this }, null, url);
    });

});


