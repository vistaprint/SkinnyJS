(function($) {

    $(document).ready(function() {
        $("#dialogFromScriptLink").on("click", function() {
            $.modalDialog.create({
                content: "#vegDialog"
            }).open();
        })
    });

})(jQuery);
