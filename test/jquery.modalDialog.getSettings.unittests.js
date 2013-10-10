/* jshint quotmark:false */

$.modalDialog.iframeLoadTimeout = 1000;
$.modalDialog.animationDuration = 100;

describe("$.modalDialog.getSettings()", function()
{
    var assert = chai.assert;

    it("should parse the title attribute properly", function()
    {
        var $div = $('<div data-dialog-title="foo">content</div>').appendTo(document.body);
        var settings = $.modalDialog.getSettings($div);

        assert.equal(settings.title, "foo");

        $div.remove();
    });

    it("should not create a title property when no attribute is present", function()
    {
        var $div = $('<div>content</div>').appendTo(document.body);
        var settings = $.modalDialog.getSettings($div);

        assert.isUndefined(settings.title);

        $div.remove();
    });

    it("should parse the enableHistory attribute properly as false", function()
    {
        var $div = $('<div data-dialog-enablehistory="false">content</div>').appendTo(document.body);
        var settings = $.modalDialog.getSettings($div);

        assert.isFalse(settings.enableHistory);

        $div.remove();
    });

    it("should parse the enableHistory attribute properly as true", function()
    {
        var $div = $('<div data-dialog-enablehistory="true">content</div>').appendTo(document.body);
        var settings = $.modalDialog.getSettings($div);

        assert.isTrue(settings.enableHistory);

        $div.remove();
    });

    it("should parse the onopen attribute properly to a function", function()
    {
        var $div = $('<div data-dialog-onopen="event.value = \'foo\';">content</div>').appendTo(document.body);
        var settings = $.modalDialog.getSettings($div);

        assert.isFunction(settings.onopen);
        
        var e = {};
        settings.onopen(e);
        assert.equal(e.value, "foo");

        $div.remove();
    });

});