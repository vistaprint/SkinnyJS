mocha.setup("bdd");

$(window).on("load", function()
{
    mocha.checkLeaks();
    mocha.globals(["jQuery"]);
    mocha.run();
});