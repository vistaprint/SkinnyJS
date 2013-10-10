describe("jquery.disableEvent()", function()
{
	var assert = chai.assert;


	//make the basic link element
	var basicLinkElement = function()
	{
		var $link = $("<a href='#'>hi</a>").on("click",	function(){ window._someGlobal = true;});
		$link.appendTo(document.body);
		return $link;
	};


	it("should return true", function()
	{
		var $el = basicLinkElement();

		$el.trigger("click");

		assert.isTrue(window._someGlobal);
		
		$el.remove();
		delete window._someGlobal


	});

	it("should return true if the element has been disabled", function()
	{
		var $el = basicLinkElement();

		$el.disableEvent("click");
		
		$el.trigger("click");

		assert.isUndefined(window._someGlobal);

		$el.remove();
		window._someGlobal = undefined;

	});

});