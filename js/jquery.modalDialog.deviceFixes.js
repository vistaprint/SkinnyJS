/* global jQuery */

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

(function ($) {
    var SELECTOR_MAIN_PANEL = "[data-dialog-main-panel='true']";
    var SELECTOR_BAD_ELEMENT = "[data-dialog-hide-onopen='true']";

    var preventWindowTouchEvents = function (dialog, fix) {
        // The bug only affects iFrame dialogs
        if (dialog.dialogType != "iframe") {
            return;
        }

        $([window, document]).enableEvent("touchmove touchstart touchend", !fix);
    };

    var getWindowHeight = function () {
        return window.innerHeight || $(window).height();
    };

    var initializeShimming = function () {
        // First, see if the main panel is specified.
        // If so, it's the best choice of elements to hide.
        var $badEls = $(SELECTOR_MAIN_PANEL);
        if ($badEls.length === 0) {
            // Otherwise, look for individually marked bad elements to hide.
            $badEls = $(SELECTOR_BAD_ELEMENT);
        }

        // Cache original values to restore when the dialog closes
        var _scrollTop = 0;
        var _height = 0;

        $.modalDialog.onbeforeopen.add(function () {
            if (this.level === 0) {
                // Cache scroll height and body height so we can restore them when the dialog is closed
                _scrollTop = $(document).scrollTop();
                _height = document.body.style.height;

                // Cache the parent for each element we need to remove from the DOM.
                // This is important to fix the various WebKit text overlay bugs (described above in the header).
                // Hiding them wont do it.
                $badEls.each(function (i, el) {
                    $(el).data("dialog-parent", el.parentNode);
                })
                    .detach();

                // HACK: setting the body to be larger than the screen height prevents the address bar from showing up in iOS
                document.body.style.height = (getWindowHeight() + 50) + "px";

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onopen.add(function () {
            if (this.level === 0) {
                // Ensure the body/background is bigger than the dialog,
                // otherwise we see the background "end" above the bottom
                // of the dialog.
                var height = Math.max(this.$container.height(), getWindowHeight()) + 20;

                document.body.style.height = height + "px";
                $(".dialog-background").css({
                    height: height
                });

                window.scrollTo(0, 1);
            }
        });

        $.modalDialog.onclose.add(function () {
            if (this.level === 0) {
                // Restore body height, elements, and scroll position
                document.body.style.height = _height;

                $badEls.each(function (i, el) {
                    $($(el).data("dialog-parent")).append(el);
                });

                window.scrollTo(0, _scrollTop);
            }
        });
    };

    $(function () {
        if (!$.modalDialog.isSmallScreen()) {
            return;
        }

        // When removing the host window content from the DOM, make the veil opaque to hide it.
        $.modalDialog.veilClass = "dialog-veil-opaque";

        // This will run in a content window. They need the events disabled immediately.
        if ($.modalDialog && $.modalDialog._isContent) {
            var dialog = $.modalDialog.getCurrent();
            if (dialog) {
                $(window).on("load", function () {
                    preventWindowTouchEvents(dialog, true);
                });
            }
        } else {
            // This is for the host window.
            $.modalDialog.onopen.add(function () {
                preventWindowTouchEvents(this, true);
            });
            $.modalDialog.onbeforeclose.add(function () {
                preventWindowTouchEvents(this, false);
            });

            initializeShimming();
        }
    });

})(jQuery);