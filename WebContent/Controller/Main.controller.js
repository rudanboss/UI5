sap.ui.define([
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/m/PDFViewer",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(MessageBox, jQuery, Controller, PDFViewer, JSONModel, NumberFormat) {
	"use strict"; 

	return Controller.extend("ztms.Controller.Main", {
		onInit: function() {
			this._pdfViewer = new PDFViewer();
			this.getView().addDependent(this._pdfViewer);
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Main").attachPatternMatched(this._handleRouteMatched1, this);
		},
		
		handleTile1 : function() {
			var that = this;
			that.oDialog = that.getView().byId("Asignin");
			if (!that.oDialog) {
				that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.Asignin");
				that.getView().addDependent(that.oDialog);
			}
			that.oDialog.open();
		},
		
		_handleRouteMatched1 : function(evt) {
			var that = this;
			this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV",true);
			if(localStorage.length>1){
				if(localStorage.user){
			that.oModel.read("/UserSet?$filter=USER_ID eq '"+localStorage.user+"' and USER_PASS eq '"+localStorage.pass+"'", null, null, false, function(oData, oResponse){ 
					 if (oData.results.length == 1) {
						 that.oRouter.navTo("UserInfo", true);
					 }
						});	}
				if(localStorage.admin){
					that.oModel.read("/AdminSet?$filter=ID eq '"+localStorage.admin+"' and PASSWORD eq '"+localStorage.admin_pass+"'", null, null, false, function(oData, oResponse){ 
						 if (oData.results.length == 1) {
							 that.oRouter.navTo("Admin", true);
						 }
							});
				}
			}
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
		
		
		handleTile2 : function() {
			var that = this;
			that.oDialog = that.getView().byId("Usignin");
			if (!that.oDialog) {
				that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.Usignin");
				that.getView().addDependent(that.oDialog);
			}
			that.oDialog.open();
		},
		
		onUSignin:function(){
			var that=this;
			var user = that.getView().byId("idu_user").getValue();
			var pass = that.getView().byId("idp_user").getValue();
			sap.ui.core.BusyIndicator.show(0);
			 that.oModel.read("/UserSet?$filter=USER_ID eq '"+user+"' and USER_PASS eq '"+pass+"'", null, null, true, function(oData, oResponse){ 
				 if (oData.results.length == 1) {
					 that.oDialog.close();
					 var oModel = new sap.ui.model.json.JSONModel();				 	
					 localStorage.user = user;
					 localStorage.pass = pass;
					 localStorage.timeStamp = new Date().getTime();
					 localStorage.flag = true;
					 if (that._sTimeoutId) {
							jQuery.sap.clearDelayedCall(that._sTimeoutId);
							that._sTimeoutId = null;
						}

						that._sTimeoutId = jQuery.sap.delayedCall(4000, that, function() {
							sap.ui.core.BusyIndicator.hide();
						});
					 that.oRouter.navTo("UserInfo", true);
					 that.onCancel();
				 }
				 else{
					 sap.ui.core.BusyIndicator.hide();
					 MessageBox.error("Please Enter correct details");
				 }
					});		 
			 
		},
		
		handleTile3 : function() {
			this.oRouter.navTo("Courses", true);
		},
		
		onCancel : function(){
			var that  = this;
			this.oDialog.close();
			 that.getView().byId("idu_user").setValue("");
			 that.getView().byId("idp_user").setValue("");
			 that.getView().byId("idu_admin").setValue("");
			 that.getView().byId("idp_admin").setValue("");
		},
		
		onRegister : function(){
			var oEntity = {};
			var that = this;
			var oView = that.getView();
			if((oView.byId("password").getValue()===oView.byId("password2").getValue()) && oView.byId("user_id").getValue()!="" && oView.byId("user_name").getValue()!= ""){
			oEntity.USER_ID = oView.byId("user_id").getValue();
	 		oEntity.USER_NAME = oView.byId("user_name").getValue();
	 		oEntity.USER_PASS = oView.byId("password").getValue();
	 		that.oModel.setHeaders({"X-Requested-With" : "X"});
	 		that.oModel.create("/UserSet",oEntity,null,function(){
	 			sap.m.MessageToast.show("You are successfully Registered!");
	 			oView.byId("user_id").setValue("");
	 			oView.byId("user_name").setValue("");
	 			oView.byId("password").setValue("");
	 			oView.byId("password2").setValue("");
	 		that.getView().byId("id_signInError").setVisible(false);
	 		
	 		 localStorage.user = oEntity.USER_ID;
			 localStorage.pass = oEntity.USER_PASS;
			 localStorage.timeStamp = new Date().getTime();
			 localStorage.flag = true;
			 if (that._sTimeoutId) {
					jQuery.sap.clearDelayedCall(that._sTimeoutId);
					that._sTimeoutId = null;
				}

				that._sTimeoutId = jQuery.sap.delayedCall(4000, that, function() {
				});
			 that.oRouter.navTo("UserInfo", true);
			 that.onCancel();
	 		
	 		
	 		
	 		
	 		},
	 				function(){sap.m.MessageToast.show("User Already Exist");});
			}
			else
				{
				that.getView().byId("id_signInError").setVisible(true);
				}
		},
		
		onASignin : function(){
			var that=this;
			var user = that.getView().byId("idu_admin").getValue();
			var pass = that.getView().byId("idp_admin").getValue();
			 sap.ui.core.BusyIndicator.show(0);
			 that.oModel.read("/AdminSet?$filter=ID eq '"+user+"' and PASSWORD eq '"+pass+"'", null, null, true, function(oData, oResponse){ 
				 if (oData.results.length == 1) {
					 that.oDialog.close();
					 var oModel = new sap.ui.model.json.JSONModel();				 	
					 localStorage.admin = user;
					 localStorage.admin_pass = pass;
					 localStorage.timeStamp = new Date().getTime();
					 localStorage.flag = true;
					 if (that._sTimeoutId) {
							jQuery.sap.clearDelayedCall(that._sTimeoutId);
							that._sTimeoutId = null;
						}

						that._sTimeoutId = jQuery.sap.delayedCall(4000, that, function() {
							sap.ui.core.BusyIndicator.hide();
						});
					 that.oRouter.navTo("Admin", true);
					 that.onCancel();
				 }
				 else{
					 sap.ui.core.BusyIndicator.hide();
					 MessageBox.error("Please Enter correct details");
				 }
					});	
		},
	});
});
