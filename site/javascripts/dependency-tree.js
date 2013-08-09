var dependencyTree = 
{
	"date-parse": { deps: [] },
	"jquery.clientRect": { deps: [] },
	"jquery.contentSize": { deps: ["jquery.clientRect"] },
	"jquery.css": { deps: ["jquery.delimitedString"] },
	"jquery.customEvent": { deps: [] },
	"jquery.delimitedString": { deps: [] },
	"jquery.disableEvent": { deps: [] },
	"jquery.hostIframe": { deps: [] },
	"jquery.hoverDelay": { deps: [] },
	"jquery.htmlEncode": { deps: [] },
	"jquery.imageSize": { deps: [] },
	"jquery.isVisibleKeyCode": { deps: [] },
	"jquery.menu": { deps: [] },
	"jquery.modalDialog": 
	{ 
		deps: ["jquery.queryString","jquery.postMessage","jquery.customEvent","jquery.clientRect","jquery.hostIframe","jquery.proxyAll"], 
		single: true, 
		notes: "Should be included separately, after other skinny.js modules, on pages that open modal dialogs, " +
			"but NOT in iframe dialog content window documents. Should not be included on the same document as jquery.modalDialogContent.",
		other: [
			{ 
				name: "modal dialog styles", 
				path: "css/jquery.modalDialog.less", 
				notes: "LESS file for modal dialogs. Include with jquery.modalDialog.js" 
			},
			{ 
				name: "modal dialog styles for old IE", 
				path: "css/jquery.modalDialog.less", 
				notes: "LESS file for modal dialog old IE (IE 8 or less) workarounds. Include with jquery.modalDialog.js in IE only" 
			}
		]
	},
	"jquery.modalDialogContent": 
	{ 
		deps: ["jquery.queryString","jquery.contentSize","jquery.customEvent"], 
		single: true, 
		notes: "Should be included separately, after other skinny.js modules, in iframe dialog content windows. " +
			"Should NOT be included on the same document as jquery.modalDialog.",
		other: [
			{ 
				name: "modal dialog content window styles", 
				path: "css/jquery.modalDialog.less", 
				notes: "LESS file for modal dialogs. Include with jquery.modalDialog.js" 
			}
		]
	},
	"jquery.msAjax": { deps: ["date-parse"] },
	"jquery.ns": { deps: [] },
	"jquery.partialLoad": { deps: [] },
	"jquery.postMessage": { deps: [] },
	"jquery.proxyAll": { deps: [] },
	"jquery.queryString": { deps: ["jquery.delimitedString"] },
	"jquery.uncomment": { deps: [] },
	"jquery.url": { deps: ["jquery.queryString"] }
};