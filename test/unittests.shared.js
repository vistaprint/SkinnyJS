mocha.setup("bdd");

$(window).on("load", function()
{
    mocha.checkLeaks();
    mocha.globals(["jQuery","_linkGlobalClick","_linkGlobalMousedown", "_buttonGlobalClick"]);
    mocha.run();
});