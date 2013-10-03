/**
* Defines namespaces
* @param {String} namespace
*/
jQuery.ns = function(namespace)
{
    var parts = namespace.split(".");

    var last = window;
    for (var i=0; i<parts.length; i++)
    {
        last = last[parts[i]] || (last[parts[i]] = {});
    }
};
