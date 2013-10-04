/// <reference path="jquery.observeChildren.js" />

/**
 * Simple utility to smooth scroll transitions to anchors with hash references.
 *
 * To opt-in to have anchors animate their scrolling, add attr data-scroll-anchor:
 *
 *   <a href="#element" data-scroll-anchor>go to section!</a>
 *
 */
(function($, doc)
{
    var DATA_KEY_OPTIN = 'scrollAnchor'; // data-attribute key for opt-in to animation

    function localizedHash(uri)
    {
        var i = uri.indexOf('#');
        if (i === 0)
        {
            return true;
        }
        // else if (i > -1 && ..... // TODO: check to see if this is the same page
        // {
        //     doc.location
        // }
        else
        {
            return false;
        }
    }

    function onClick(event)
    {
        var target = jQuery(this),
            href = target.attr('href'),
            data = target.data();

        if (data.scrollSelector || localizedHash(href))
        {
            event.preventDefault();

            var scrollToElement = $(data.scrollSelector || href.substr(href.indexOf('#'))),
                destination = scrollToElement.offset().top - (data.scrollOffset || 30),
                timing = data.scrollSpeed || 800;

            jQuery('html:not(:animated), body:not(:animated)').animate(
                { scrollTop: destination },
                timing,
                function onAnchorScrollAnimationComplete()
                {
                    doc.location.hash = target.attr('href');
                }
            );

            return false;
        }
    }

    // if you pass "false" to the data-scroll-anchor data attribute,
    // it will not enable 
    function isTrue(v)
    {
        if (v === undefined || v === false || v === 'false')
        {
            return false;
        }
        else if (v === '')
        {
            return true;
        }
        else
        {
            return v;
        }
    }

    function bind(anchor)
    {
        anchor = jQuery(anchor);
        if (isTrue(anchor.data(DATA_KEY_OPTIN)))
        {
            anchor.on('click', onClick);
        }
    }

    $(function()
    {
        $('body').observeChildren(bind, 'a');
    });

})(jQuery, document);