var dependencyTree = {
    "breakpoints": {
        deps: []
    },
    "date-parse": {
        deps: []
    },
    "jquery.breakpoints": {
        deps: ["breakpoints"]
    },
    "jquery.clientRect": {
        deps: []
    },
    "jquery.contentSize": {
        deps: ["jquery.clientRect"]
    },
    "jquery.cookies": {
        deps: []
    },
    "jquery.css": {
        deps: ["jquery.delimitedString"]
    },
    "jquery.customEvent": {
        deps: []
    },
    "jquery.delimitedString": {
        deps: []
    },
    "jquery.disableEvent": {
        deps: []
    },
    "jquery.hostIframe": {
        deps: []
    },
    "jquery.hoverDelay": {
        deps: []
    },
    "jquery.htmlEncode": {
        deps: []
    },
    "jquery.imageSize": {
        deps: []
    },
    "jquery.isVisibleKeyCode": {
        deps: []
    },
    "jquery.menu": {
        deps: ["pointy"]
    },
    "jquery.modalDialog": {
        deps: ["jquery.queryString", "jquery.postMessage", "jquery.customEvent", "jquery.clientRect", "jquery.hostIframe", "jquery.proxyAll", "jquery.partialLoad", "pointy"],
        single: true,
        notes: "Should be included separately, after other skinny.js modules, on pages that open modal dialogs, " +
            "but NOT in iframe dialog content window documents. Should not be included on the same document as jquery.modalDialogContent.",
        other: [{
            name: "modal dialog styles",
            path: "css/jquery.modalDialog.css",
            notes: "CSS file for modal dialogs. Include with jquery.modalDialog.js"
        }, {
            name: "History.js",
            path: "https://github.com/browserstate/history.js/",
            notes: "Optional. History.js is required if you wish to use the <a href='jquery.modalDialog.html#managing_history_browser_backforward_buttons' target='_blank'>jquery.modalDialog history management module</a>."
        }]
    },
    "jquery.modalDialogContent": {
        deps: ["jquery.queryString", "jquery.contentSize", "jquery.customEvent", "pointy"],
        single: true,
        notes: "Should be included separately, after other skinny.js modules, in iframe dialog content windows. " +
            "Should NOT be included on the same document as jquery.modalDialog.",
        other: [{
            name: "modal dialog content window styles",
            path: "css/jquery.modalDialogContent.css",
            notes: "CSS file for modal dialog content windows. Include with jquery.modalDialogContent.js"
        }]
    },
    "jquery.msAjax": {
        deps: ["date-parse"]
    },
    "jquery.ns": {
        deps: []
    },
    "jquery.partialLoad": {
        deps: []
    },
    "jquery.postMessage": {
        deps: [],
        other: [{
            name: "postmessage polyfill",
            path: "postmessage.htm",
            notes: "postMessage polyfill HTML file for browsers that don't support postMessage. Make this accessible on your web server, and <a href='jquery.postMessage.html' target='_blank'>configure jquery.postMessage to point to it</a>."
        }]
    },
    "jquery.proxyAll": {
        deps: []
    },
    "jquery.queryString": {
        deps: ["jquery.delimitedString"]
    },
    "jquery.scrollAnchor": {
        deps: []
    },
    "jquery.uncomment": {
        deps: []
    },
    "jquery.url": {
        deps: ["jquery.queryString"]
    },
    "pointy": {
        deps: []
    },
    "pointy.gestures": {
        deps: ["pointy"]
    }
};
