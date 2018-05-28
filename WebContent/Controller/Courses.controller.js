sap.ui.define([
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(MessageBox, jQuery, Controller, PDFViewer, JSONModel, NumberFormat) {
	"use strict"; 

	return Controller.extend("ztms.Controller.Courses", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Courses").attachPatternMatched(this._handleRouteMatched1, this);
		},
		
		
		_handleRouteMatched1 : function(evt) {
			var that = this;
			this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV",true);
			this.oModel.read("/CoursesSet?", null, null, false, function(oData, oResponse){ 
				var t = new sap.ui.model.json.JSONModel();
				 t.setData(oData);
				 that.getView().setModel(t, "courses");
			});
			
		},
		onBackPress:function(){
			var that = this;
			this.flag = 1;
			that.oRouter.navTo("Main");
		},
		
		onTerms: function(){
//			window.open("http://openui5.org/", '_blank');
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
		},
		
		handleTutorialTile1 : function(oEvent) {
			var available = oEvent.getSource().getBindingContext("courses").getObject().AVAILABLE;
			var COURSE_ID = oEvent.getSource().getBindingContext("courses").getObject().COURSE_ID;
			if(available ==='X')
				{
			this.oRouter.navTo("Tutorials",{COURSE_ID : COURSE_ID});
				}
		}
		
	});
});
