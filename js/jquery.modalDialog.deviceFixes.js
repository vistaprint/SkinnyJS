/*jsl:option explicit*/
/// <reference path="../jquery-current.js" />
/// <reference path="jquery.modalDialog.js" />
/// <reference path="jquery.disableEvent.js" />

/* globals DIALOG_TYPE_IFRAME */

// iOS
// iOS has a bug where text fields in an iFrame misbehave if there are touch events assigned to the 
// host window. This fix disables them while iFrame dialogs are open.

// Android
// Older versions of Android stock browser, particularly ones whose manufacturers customized the browser
// with proprietary text field overlays, have trouble with complex positioning and transforms.
// This becomes exacerbated by the complexity of the modal dialog DOM, especially when an IFrame 
// is involved.
// The result is that the proprietary text field overlays are positioned incorrectly (best case),
// or that they start producing nonsensical focus events, which cause the browser to scroll wildly.
// http://stackoverflow.com/questions/8860914/on-android-browser-the-whole-page-jumps-up-and-down-when-typing-inside-a-textbo

// Newer android browsers (4+) support the CSS property: -webkit-user-modify: read-write-plaintext-only;
// This will prevent the proprietary text field overlay from showing (though also HTML5 custom ones, such as email keyboards).
// http://stackoverflow.com/questions/9423101/disable-android-browsers-input-overlays
// https://code.google.com/p/android/issues/detail?id=30964

// To work around this problem in older Android (2.3), we have to hide elements that have any CSS transforms.
// The cleanest way is to remove ALL content in the DOM in the main panel. This will make the screen behind the dialog turn
// completely gray, which isn't a big deal- many dialog frameworks do this anyway.
// To do this, add the attribute to the element:
// data-dialog-main-panel="true"

// Otherwise, you can hide specific problematic elements by adding this attribute:
// data-dialog-hide-onopen="true"

(function ($)
{
    if ($.isSmallScreen()) {
        // When removing the host window content from the DOM, make the veil opaque to hide it.
        $.modalDialog.veilClass = "dialog-veil-opaque";

        var preventWindowTouchEvents = function(dialog, fix)
        {
            // The bug only affects iFrame dialogs
            if (dialog.dialogType != DIALOG_TYPE_IFRAME)
            {
                return;
            }

            $([window, document]).enableEvent("touchmove touchstart touchend", !fix);
        };

        var SHIM_KEY = "androidDialogShim";
        var SELECTOR_MAIN_PANEL = "[data-dialog-main-panel='true']";
        var SELECTOR_BAD_ELEMENT = "[data-dialog-hide-onopen='true']";

        // Puts a fake element next to the specified element
        // of the exact same size, and hides the original element.
        // Passing 'enable' = false reverses this.
        var createShims = function($els, enable)
        {
            $els.each(function(i, el)
            {
                var $el = $(el);
                var $shim = $el.data(SHIM_KEY);
                if (!$shim)
                {
                    $shim = $("<div style='display:none;'></div>");
                    $el.before($shim);
                    $el.data(SHIM_KEY, $shim);
                }

                if (enable)
                {
                    // Ensure the size is correct with each load- it may have changed.
                    $shim.css({ height: $el.height(), width: $el.width() }).show();
                    $el.hide();
                }
                else
                {
                    $el.show();
                    $shim.hide();
                }
            });
        };

        var initializeShimming = function()
        {
            // First, see if the main panel is specified.
            // If so, it's the best choice of elements to hide.
            var $badEls = $(SELECTOR_MAIN_PANEL);
            if ($badEls.length === 0)
            {
                // Otherwise, look for individually marked bad elements to hide.
                $badEls = $(SELECTOR_BAD_ELEMENT);
            }

            if ($badEls.length > 0)
            {
                $.modalDialog.onopen.add(function(e)
                {
                    if (this.level === 0)
                    {
                        createShims($badEls, true);
                    }
                });

                $.modalDialog.onbeforeclose.add(function(e)
                {
                    if (this.level === 0)
                    {
                        createShims($badEls, false);
                    }
                });
            }
        };

        $(function()
        {
            // This will run in a content window. They need the events disabled immediately.
            if ($.modalDialog && $.modalDialog._isContent)
            {
                var dialog = $.modalDialog.getCurrent();
                if (dialog)
                {
                    $(window).on("load", function() { preventWindowTouchEvents(dialog, true); });
                }
            }
            else
            {
                // This is for the host window.
                $.modalDialog.onopen.add(function() { preventWindowTouchEvents(this, true); });
                $.modalDialog.onbeforeclose.add(function() { preventWindowTouchEvents(this, false); });

                initializeShimming();
            }
        });
    }
})(jQuery);
