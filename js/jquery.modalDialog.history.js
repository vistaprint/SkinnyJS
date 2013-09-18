/* globals History */
// TODO: Need to support stacking dialogs:
// i.e. ?dialogs=#foo,ajax:/foo.html,iframe:/foo.html
// TODO dialog methods should return Deferreds

(function($) 
{
    $.modalDialog.enableHistory = function()
    {
        updateFromUrl(function()
        {
            $.modalDialog.onopen.add(openHandler);
            $.modalDialog.onclose.add(closeHandler);

            History.pushState(null, null, document.location.href);

            History.Adapter.bind(window, "statechange", popstateHandler);
        });
    };

    var _pageIsAtInitialState = true;
    var _stateAlreadyProcessed = false;
    var _disableHandlers = false;

    var openHandler = function()
    {
        if (_disableHandlers)
        {
            return;
        }

        var qs = {};

        qs.dialogId = this.settings.content ? "#" + $(this.settings.content).prop("id") : null;
        if (!qs.dialogId && this.settings.url)
        {
            qs.dialogType = this.settings.ajax ? "ajax" : "iframe";
            qs.dialogId = this.settings.url;
        }
        else
        {
            qs.dialogType = "node";
        }

        var currentQs = $.currentQueryString();

        if (currentQs.dialogId == qs.dialogId && 
            currentQs.dialogType == qs.dialogType)
        {
            return;
        }

        $.extend(currentQs, qs);
        var url = $.appendQueryString(document.location.pathname, currentQs);

        _stateAlreadyProcessed = true;

        History.pushState(null, null, url);

        _pageIsAtInitialState = false;
    };

    var closeHandler = function()
    {
        if (_disableHandlers)
        {
            return;
        }

        if (_pageIsAtInitialState)
        {
            var qs = $.currentQueryString();
            delete qs.dialogId;
            delete qs.dialogType;

            var url = $.appendQueryString(document.location.pathname, qs);

            History.pushState(null, null, url);
        }
        else
        {
            History.back();
        }

        _pageIsAtInitialState = false;
    };

    var popstateHandler = function()
    {
        if (_stateAlreadyProcessed)
        {
            _stateAlreadyProcessed = false;
            return;
        }

        updateFromUrl();
    };

    var updateFromUrl = function(callback)
    {
        callback = callback || $.noop;
        var settings;

        var qs = $.currentQueryString();

        if (qs.dialogId)
        {
            if (qs.dialogType == "iframe")
            {
                settings = { url: qs.dialogId };
            }
            else if (qs.dialogType == "ajax")
            {
                settings = 
                { 
                    ajax: true,
                    url: qs.dialogId
                };
            }
            else
            {
                var $content;
                try
                {
                    $content = $(qs.dialogId);
                }
                catch(ex)
                {}

                if ($content.length > 0)
                {
                    settings = $.modalDialog.getSettings($content);
                    settings.content = $content;
                }
            }
        }

        if (settings)
        {
            var dialog = $.modalDialog.create(settings);
            dialog.onopen.add(function() 
                { 
                    var callbackWrapper = function() 
                    {
                        callback();
                        dialog.onopen.remove(callbackWrapper);
                        _disableHandlers = false;
                    };

                    setTimeout(callbackWrapper, 0); 

                });

            _disableHandlers = true;
            dialog.open();
        }
        else
        {
            var currentDialog = $.modalDialog.getCurrent();
            if (currentDialog)
            {
                currentDialog.onclose.add(function() 
                { 
                    var callbackWrapper = function() 
                    {
                        callback();
                        currentDialog.onopen.remove(callbackWrapper);
                        _disableHandlers = false;
                    };

                    setTimeout(callbackWrapper, 0); 

                });

                _disableHandlers = true;
                currentDialog.close();
            }
            else
            {
                callback();
            }
        }
    };

})(jQuery);
