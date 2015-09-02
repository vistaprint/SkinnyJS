/// <reference path="jquery.modalDialog.setup.html" />
/// <reference path="jquery.modalDialog.setup.js" />

describe("Plugins", function () {	
	
	it("should render the plugin modal", function (done) {
		
		// add a fake plugin
		$.modalDialog.registerPlugin(function(modalDialog, initializers) {			
			// create the test dialog
			var TestDialog = function () {
				modalDialog.apply(this, arguments);
			}
			
			$.extend(TestDialog.prototype, modalDialog.prototype);
	
			TestDialog.prototype.dialogType = "test";
			
			TestDialog.prototype._buildContent = function () {
				this.$content =  $("<div class='dialog-content'>This is a test</div>");
			};
			
			// add an initializer function
			initializers.unshift( function(settings) {
				if(settings.isTest === true) {
					return new TestDialog(settings);
				}
				return null;
			});
		});		
		
		// create the dialog of the plugin type
        var dialog = $.modalDialog.create({isTest: true});

        dialog
            .open()
            .then(
                function () {
                    assert.equal($.trim(dialog.$container.find(".dialog-content").text()), "This is a test");
                    return dialog.close();
                })
            .then(done);
    });
	
});