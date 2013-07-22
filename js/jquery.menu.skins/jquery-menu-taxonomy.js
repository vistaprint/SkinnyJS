/*jsl:option explicit*/

/**
* Default strategy for this skin
*/
$.registerDropDownMenuSkin(
    "taxonomy",
    {
        position: function(e)
        {
            topNavTaxonomyPositioningStrategy(e);
        }
});

/**
* Contains the positioning strategy for the top nav
*/
var topNavTaxonomyPositioningStrategy = function(e)
{
    if (e.level === 0)
    {
        e.$panel.css({
            top: e.$item.innerHeight(),
            left: "-" + e.$item.css("borderLeftWidth")
        });

        // set top panel's height to height of tallest submenu
        var maxChildPanelHeight = e.$panel.height();
        e.$panel.find(".menu-panel").each( function(i) {
            // jQuery thinks that elements with display:none have a height of 0 -- so we need to display them, but make them visibility:hidden first
            $(this).css("visibility", "hidden"); 
            $(this).show();
        });
        e.$panel.css("visibility", "hidden").show();
        e.$panel.find(".menu-panel").each( function(i) {
            maxChildPanelHeight = Math.max ($(this).height(), maxChildPanelHeight);
            $(this).hide();
            $(this).css("visibility", "visible");
        });
        e.$panel.css("visibility", "visible").height(maxChildPanelHeight);

        return;
    }

    NonRootTaxonomyPositioningStrategy(e);
};

/**
* Contains the positioning strategy for the left nav
*/
var leftNavTaxonomyPositioningStrategy = function(e)
{
    if (e.level === 0)
    {
        e.$panel.css({
            top: 0,
            left: parseInt(e.$item.css("width")) 
        });
        return;
    }
    
    NonRootTaxonomyPositioningStrategy(e);
};

/**
* Contains the positioning strategy common between the left and top nav
*/
var NonRootTaxonomyPositioningStrategy = function (e)
{
    var pos = e.$item.position();

    // set new position to start aligned with the parent + border
    e.$panel.css({
        left: pos.left + e.$item.innerWidth(), 
        top: -pos.top - 3
    });

    // reset to natural height
    currentPanel = e.panel; 
    while (currentPanel && currentPanel.$panel)
    {
        currentPanel.$panel.css({
            height: ""
        });
        
        currentPanel = currentPanel.parent;
    }            

    // get the biggest height while going up the tree
    var maxHeight = -1;
    var currentPanel = e.panel;
    while (currentPanel && currentPanel.$panel)
    {
        maxHeight = Math.max(currentPanel.$panel.height(), maxHeight);
        currentPanel = currentPanel.parent;
    }

    // re-adjust all of the (grand) parents' panels to the same height
    currentPanel = e.panel; 
    while (currentPanel && currentPanel.$panel)
    {
        // compute tallest sibling panel
        var maxSiblingHeight = maxHeight;
     	currentPanel.$panel.parentsUntil(".menu-container").find(".menu-panel > .menu-item > .menu-panel").each(function(i) {
            maxSiblingHeight = Math.max($(this).height(), maxSiblingHeight);
		});
        // set all panels to that height
        currentPanel.$panel.height(maxSiblingHeight).parent().find(".menu-panel > .menu-item > .menu-panel").height(maxSiblingHeight);

        // compute widest sibling panel
        if (e.level == 1) // only widen submenus, not the primary menu        
        {
            var maxSiblingWidth = 0;
     	    currentPanel.$panel.parentsUntil(".menu-container").find(".menu-panel > .menu-item > .menu-panel").each(function(i) {
                maxSiblingWidth = Math.max($(this).width(), maxSiblingWidth);
		    });
            // set all submenus to that width
            currentPanel.$panel.parent().find(".menu-panel > .menu-item > .menu-panel").width(maxSiblingWidth);
        }

        currentPanel = currentPanel.parent;
    }

};