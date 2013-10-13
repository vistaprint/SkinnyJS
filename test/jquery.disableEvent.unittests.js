	describe("jquery.disableEvent()", function()
{
	var assert = chai.assert;


	//make the basic link element
	var basicLinkElement = function()
	{
		var $link = $("<a href='#'>hi</a>").on("click",	function(){ window._linkGlobalClick = true;});
		$link.mousedown(function()	
		{
			window._linkGlobalMousedown = true;
		});

		$link.appendTo(document.body);
		return $link;
	};
	var basicButtonElement = function()
	{
		var $button = $("<button>button</button>").on("click",function(){ window._buttonGlobalClick = true;});
		$button.keydown(function()
		{
			window._buttonButtonKeydown = true;
		});
		$button.appendTo(document.body);
		return $button;
	};


	it("should return true if a click event has been disabled for a link", function()
	{
		var $el = basicLinkElement();

		$el.disableEvent("click");
		
		$el.trigger("click");

		assert.isUndefined(window._linkGlobalClick);

		$el.remove();
		window._linkGlobalClick = undefined;

	});

	it("should return true if a mousedown event has been disabled for a link", function()
	{
		var $el = basicLinkElement();

		$el.disableEvent("mousedown");
		
		$el.trigger("mousedown");

		assert.isUndefined(window._linkGlobalMousedown);

		$el.remove();
		window._linkGlobalMousedown = undefined;

	});


	it("should return true if a click and mousedown event have been disabled for a link", function(){
		var $el = basicLinkElement();

		$el.disableEvent("click mousedown");
		$el.trigger("click");
		$el.trigger("mousedown");

		assert.isUndefined(window._linkGlobalClick);
		assert.isUndefined(window._linkGlobalMousedown);

		$el.remove();
		window._linkGlobalClick = undefined;
		window._linkGlobalMousedown = undefined;

	});

	it("should return true if a click has been enabled after being disabled for a link",function(){
		var $el = basicLinkElement();
		$el.disableEvent("click");
		$el.trigger("click");
		$el.enableEvent("click");
		$el.trigger("click");

		assert.isTrue(window._linkGlobalClick);

		$el.remove();
		window._linkGlobalClick = undefined;

	});

	it("should return true if a click event has been disabled for a button", function()
	{
		var $el = basicButtonElement();
		$el.disableEvent("click");
		$el.trigger("click");
		assert.isUndefined(window._buttonGlobalClick);

		$el.remove();
		window._buttonGlobalClick = undefined;

	})

	it("should return true if a click and keydown event have been disabled for a button", function()
	{
		var $el = basicButtonElement();
		$el.disableEvent("click keydown");
		$el.trigger("click");
		$el.trigger("keydown");
		
		assert.isUndefined(window._buttonGlobalClick);
		assert.isUndefined(window._buttonButtonKeydown);

		$el.remove();
		window._buttonButtonKeydown = undefined;
		window._buttonGlobalClick = undefined;

	});

});