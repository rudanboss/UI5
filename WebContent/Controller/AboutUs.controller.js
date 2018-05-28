sap.ui.define([
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(MessageBox, jQuery, Controller, PDFViewer, JSONModel, NumberFormat) {
	"use strict"; 

	return Controller.extend("ztms.Controller.AboutUs", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AboutUs").attachPatternMatched(this._handleRouteMatched1, this);
		},
		
		
		_handleRouteMatched1 : function(evt) {
			var that = this;
		},
		
		onTerms: function(){
			var sSource = jQuery.sap.getModulePath("ztms/Files","/Terms.pdf");
			this._pdfViewer.setSource(sSource);
			this._pdfViewer.setTitle("ELAPS APP Terms & Conditions");
			this._pdfViewer.open();
		},
		
		onAbout: function(){
			this.oRouter.navTo("AboutUs", true);
		},
		
		onHelp: function(){
			sap.m.URLHelper.triggerEmail("rudramani.pandey@sap.com; aniket.singh@sap.com; ram.deepak@tcs.coms", "ELAPS Application Issue", "Dear " + "Fiori Team" + ",")
		}
	});
});
