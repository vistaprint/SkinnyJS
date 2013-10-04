$(document).ready(function()
{
    module('jquery.scrollAnchor');

    var isInternalHash = $.fn.scrollAnchor._.isInternalHash,
        isTrue = $.fn.scrollAnchor._.isTrue;

    QUnit.test('isTrue (private) passes expectations', 3, function()
    {
        equal(isTrue('false'), false, 'string "false" is false');
        equal(isTrue(''), true, 'empty string is true');
        equal(isTrue('true'), true, 'any other string is true');
    });

    QUnit.test('Test internal links', 6, function()
    {
        function removeHash(uri)
        {
            return uri.indexOf('#') > -1 ? uri.substr(uri.indexOf('#')+1) : uri;
        }

        document.location.hash = '';
        var a = $('<a>').attr('href', removeHash(document.location.href));
        a = a[0];

        equal(isInternalHash('/some/link'), false, 'A local uri that is not an internal hash');
        equal(isInternalHash(''), false, 'empty uri');
        equal(isInternalHash('#hash'), true, 'simple uri with only a hash');
        equal(isInternalHash(a.href, a), false, 'local document should be false with no hash: ' + a.href);

        // add a hash to the test anchor link
        a.hash = '#myhash';
        equal(isInternalHash(a.href, a), true, 'internal absolute uri with hash');

        // turn the href to a local link
        a.href = document.location.pathname + '#myhash';
        equal(isInternalHash(a.href, a), true, 'internal relative uri with hash');
    });
});