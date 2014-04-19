/* global jQuery */

// Simple smooth scrolling for anchors with internal page hash references.

// To opt-in to have anchors animate their scrolling, add attr data-scroll-anchor:
//
//   <a href="#element" data-scroll-anchor>go to section!</a>

(function ($, doc) {
    var loc = doc.location;

    function isInternalHash(uri, anchor) {
        var i = uri.indexOf('#');
        if (i === 0) {
            return true;
        }
        // if there is a hash, test for internal link still
        else if (i > -1 && anchor && anchor.host == loc.host && anchor.path == loc.path && anchor.search == loc.search) {
            return true;
        } else {
            return false;
        }
    }

    function onClick(event) {
        var target = jQuery(this),
            href = target.attr('href'),
            data = target.data();

        if (data.scrollSelector || isInternalHash(href, target[0])) {
            event.preventDefault();

            var scrollToElement = $(data.scrollSelector || href.substr(href.indexOf('#'))),
                destination = scrollToElement.offset().top - (data.scrollOffset || 30),
                timing = data.scrollSpeed || 800;

            jQuery('html:not(:animated), body:not(:animated)').animate({
                    scrollTop: destination
                },
                timing,
                function onAnchorScrollAnimationComplete() {
                    loc.hash = target.attr('href');
                }
            );

            return false;
        }
    }

    $(document).on('click', '[data-scroll-anchor]', onClick);

    // public jQuery extension to add programmatically
    $.fn.scrollAnchor = function () {
        return $(this).on('click', onClick);
    };

    // private utility methods exposed for unit tests
    $.fn.scrollAnchor._ = {
        isInternalHash: isInternalHash
    };

})(jQuery, document);