(function($) {

    $(document).ready(function() {
        $("#dialogFromScriptLink").on("click", function() {
            $.modalDialog.create({
                content: "#dialogFromScript"
            }).open();
        })
    });

})(jQuery);
