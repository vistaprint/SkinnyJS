 /* jshint quotmark:false */

 $.modalDialog.iframeLoadTimeout = 1000;
 $.modalDialog.animationDuration = 100;

 describe("$.modalDialog.getSettings()", function () {
     var assert = chai.assert;

     function createDiv(attrs) {
         return $('<div ' + attrs + '>content</div>').appendTo(document.body);
     }

     it("should parse the title attribute properly", function () {
         var $div = createDiv('data-dialog-title="foo"');
         var settings = $.modalDialog.getSettings($div);

         assert.equal(settings.title, "foo");

         $div.remove();
     });

     it("should parse an empty title attribute as an empty string", function () {
         var $div = createDiv('data-dialog-title=""');
         var settings = $.modalDialog.getSettings($div);

         assert.equal(settings.title, "");

         $div.remove();
     });

     it("should not create a title property when no attribute is present", function () {
         var $div = createDiv('');
         var settings = $.modalDialog.getSettings($div);

         assert.isUndefined(settings.title);

         $div.remove();
     });

     function describeIntAttrs(name) {
         it("should parse the " + name + " attribute properly as an int", function () {
             var $div = createDiv('data-dialog-' + name.toLowerCase() + '="42"');
             var settings = $.modalDialog.getSettings($div);

             assert.equal(settings[name], 42);

             $div.remove();
         });

         it("should parse the " + name + " attribute properly as 0", function () {
             var $div = createDiv('data-dialog-' + name.toLowerCase() + '="0"');
             var settings = $.modalDialog.getSettings($div);

             assert.equal(settings[name], 0);

             $div.remove();
         });

         it("should parse the " + name + " attribute properly as undefined when not present", function () {
             var $div = createDiv('');
             var settings = $.modalDialog.getSettings($div);

             assert.isUndefined(settings[name]);

             $div.remove();
         });
     }

     describeIntAttrs("initialHeight");
     describeIntAttrs("maxWidth");
     describeIntAttrs("zIndex");

     function describeBoolAttrs(name) {
         it("should parse the " + name + " attribute properly as true", function () {
             var $div = createDiv('data-dialog-' + name.toLowerCase() + '="true"');
             var settings = $.modalDialog.getSettings($div);

             assert.isTrue(settings[name]);

             $div.remove();
         });

         it("should parse the " + name + " attribute properly as false", function () {
             var $div = createDiv('data-dialog-' + name.toLowerCase() + '="false"');
             var settings = $.modalDialog.getSettings($div);

             assert.isFalse(settings[name]);

             $div.remove();
         });

         it("should parse the " + name + " attribute properly as undefined when not present", function () {
             var $div = createDiv('');
             var settings = $.modalDialog.getSettings($div);

             assert.isUndefined(settings[name]);

             $div.remove();
         });
     }

     describeBoolAttrs("enableHistory");
     describeBoolAttrs("ajax");
     describeBoolAttrs("destroyOnClose");

     function describeEventAttrs(eventName) {
         it("should parse the on" + eventName + " attribute properly to a function", function () {
             var $div = createDiv('data-dialog-on' + eventName + '="event.value = \'foo\';"');
             var settings = $.modalDialog.getSettings($div);

             assert.isFunction(settings["on" + eventName]);

             var e = {};
             settings["on" + eventName](e);
             assert.equal(e.value, "foo");

             $div.remove();
         });
     }

     describeEventAttrs("open");
     describeEventAttrs("close");
     describeEventAttrs("beforeopen");
     describeEventAttrs("beforeclose");
     describeEventAttrs("ajaxerror");
 });
