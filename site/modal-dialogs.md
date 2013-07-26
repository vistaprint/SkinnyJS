# Modal dialogs

## Features

For a dialog's content, the framework can use one of the following techniques:

* Use an element on the page ("node dialog")
* Display a different page within the dialog ("IFrame dialog")
* Load content via AJAX ("ajax dialog")

Other features:

* The API for IFrame dialogs works seamlessly across different domains (i.e. www.vistaprint.com vs secure.vistaprint.com) by internally using window.postMessage()
* A dialog's height is based on the content size. There is no explicit method to specify the height.
* The dialog framework supports mobile devices via responsive design.

## Usage

### Adding jQuery.modalDialog to your site:

TODO: Look at JQueryModalDialog and copy the HTML

### Creating a dialog

To create a dialog, use the following method:

    $.modalDialog.create()

#### Settings

`$.modalDialog.create()` takes a settings object as an argument. Here are the available settings:

* **title**: The title to display in the title bar of the dialog.
* **id**: The internal ID of the dialog. If the same ID is passed to <code>$.modalDialog.create()</code> more than once, the existing dialog is reused.
* **maxWidth**: Sets the maximum width of the dialog. Note that on small mobile devices, the actual width may be smaller, so you should design the dialog content accordingly. Defaults to 600.
* **skin**:  The name of the skin to use for the dialog. Defaults to "primary".
* **ajax**:  Determines how the ''url'' setting is interpreted. If true, the URL is the source for an AJAX dialog. If false, it will be the URL of an IFrame dialog.
* **url**:  The URL for the content of an IFrame or AJAX dialog.
* **content**:  A CSS selector or jQuery object for a content node to use for a node dialog.
* **destroyOnClose**:  If true, the dialog DOM will be destroyed and all events removed when the dialog closes. Defaults to ''false''.
* **containerElement**:  A CSS selector or jQuery object for the element that should be the parent for the dialog DOM (useful for working with jQuery mobile). Defaults to "body".
* **preventEventBubbling**:  If true, click and touch events are prevented from bubbling up to the document. Defaults to ''true''.
* **onbeforeopen**: A handler for the ''beforeopen'' event. See [[#Events| events]] below.
* **onopen**: A handler for the ''open'' event. See [[#Events| events]] below.
* **onclose**: A handler for the ''close'' event. See [[#Events| events]] below.
* **onbeforeclose**: A handler for the ''beforeclose'' event. See [[#Events| events]] below.
* **onajaxerror**:  A handler for the ''ajaxerror'' event. See [[#Events| events]] below.

### Dialog object methods

`$.modalDialog.create()` returns a dialog object with the following methods:

* **open()**: Opens the dialog
* **close()**: Closes the dialog
* **center()**: Centers the dialog based on the current dimensions
* **setTitle()**: Sets the title displayed in the dialog's title bar
* **getWindow()**: Gets a reference to the window for the dialog. For an IFrame dialog, this is the content window, for node or AJAX dialogs, it is the host window. This is useful for sending messages between dialogs.
* **getParent()**: Gets a reference to the dialog object immediately below the current dialog in visual stacking order (usually the one that opened it). This will be null for a dialog that was opened directly from the host window, and has no parent dialog.

### Node dialogs

A node dialog is created using an element on the page. To open a node dialog, use the following syntax:

    var dialog = $.modalDialog.create({ content: ".color-dialog", title: JSLM_ColorDialogTitle });
    dialog.open();
     
    //close dialog
    dialog.close();

There is also an alternative jQuery-centric syntax. This is completely equivalent to the previous snippet:

    // Opens the dialog immediately
    $(".color-dialog").modalDialog({ title: JSLM_ColorDialogTitle });
    
    // Closes the dialog
    $(".color-dialog").modalDialog("close");

### AJAX dialogs

An AJAX dialog is created using content which is dynamically loaded from a URL. To create an AJAX dialog, use the following syntax:

    var dialog = $.modalDialog.create({ url: "/warning.aspx", ajax: true });
    dialog.open();
     
    //close dialog
    dialog.close();
