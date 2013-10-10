describe('jquery.scrollAnchor', function ()
{
    describe('_.isInternalHash', function()
    {
        var isInternalHash = $.fn.scrollAnchor._.isInternalHash;

        function removeHash(uri)
        {
            return uri.indexOf('#') > -1 ? uri.substr(uri.indexOf('#')+1) : uri;
        }

        var a = document.createElement('a');
        a.href = removeHash(document.location.href);

        it('should recongize local URIs without hashes as false', function()
        {
            chai.assert.equal(isInternalHash('/some/link'), false);
        });

        it('should recongize empty hrefs as false', function()
        {
            chai.assert.equal(isInternalHash(''), false);
        });

        it('should recongize hash-only hrefs as true', function()
        {
            chai.assert.equal(isInternalHash('#hash'), true);
        });

        it('should recongize same-page links without hashes as false', function()
        {
            chai.assert.equal(isInternalHash(a.href, a), false);
        });

        // add a hash to the test anchor link
        it('should recongize same-page (internal) links with hashes as true', function()
        {
            a.hash = '#myhash';
            chai.assert.equal(isInternalHash(a.href, a), true);
        });
    });
});