(function($) {

    $(document).ready(function() {
        $("#dialogFromScriptLink").on("click", function() {
            $.modalDialog.create({
                content: "#vegDialog"
            }).open();
        })

        $("#iframeDialogFromScriptLink").on("click", function() {
            $.modalDialog.create({
                url: "modal-dialogs-demo-content.html"
            }).open();
        })
    });

})(jQuery);
