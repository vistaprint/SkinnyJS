/**
 * Simple wrapper to observe the creation of children with a given tag.
 * Calls the passed function passing the element found,
 * each elements will be called once upon it's creation or on dom ready.
 */

(function ($, doc)
{
    var DATA_KEY = 'childMutationObserver';
    var mutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    $.fn.observeChildren = function observeChildren (bind, tag)
    {
        // bind listeners to existing <select> elements
        if (tag)
        {
            $(tag, this).each(function (i, node)
            {
                bind(node);
            });
        }

        function DOMNodeInserted(ev)
        {
            if (!tag)
            {
                bind(ev.target);
            }
            else if (ev.target.tagName == tag)
            {
                bind(ev.target);
            }
        }

        // create mutation observer to listen for new <select> elements
        if (mutationObserver)
        {
            var observer = new mutationObserver(function mutationObserver (mutations)
            {
                $.each(mutations, function (i, mutation)
                {
                    $.each(mutation.addedNodes, function (i, node)
                    {
                        if (!tag)
                        {
                            bind(node);
                        }
                        else if (node.tagName == tag)
                        {
                            bind(node);
                        }
                    });
                });
            });

            // start the observer to watch for children
            $.each(this, function ()
            {
                observer.observe(this, { childList: true });
            });

            $(this).data(DATA_KEY, observer);
        }

        // if we do not support mutation observers, attempt to use mutation events (legacy)
        else if (doc.body.addEventListener)
        {
            $.each(this, function (i, el)
            {
                el.addEventListener('DOMNodeInserted', DOMNodeInserted, false);
            });

            $(this).data(DATA_KEY, DOMNodeInserted);
        }

        return this;
    };

    $.fn.disconnectChildObservers = function disconnectChildObservers()
    {
        $.each(this, function (i, el)
        {
            var observer = $(el).data(DATA_KEY);

            if (observer)
            {
                if (mutationObserver)
                {
                    observer.disconnect();
                }
                else
                {
                    el.removeEventListener('DOMNodeInserted', observer, false);
                }
            }
        });
    };

})(jQuery, document);