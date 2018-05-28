sap.ui.define([
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	'sap/ui/model/Filter',
	"sap/ui/model/json/JSONModel"
], function(jQuery, Controller, Filter, JSONModel) {
	"use strict";

	return Controller.extend("ztms.Controller.Tutorials", {
		onInit: function() {
			var that = this;
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			that.oRouter = sap.ui.core.UIComponent.getRouterFor(that);
			that.oRouter.attachRoutePatternMatched(that._handleRouteMatched, that);
			this.flag = 0;
		},
		
		_handleRouteMatched : function(oEvent) {
			var that = this;
			var COURSE_ID = Number(oEvent.getParameter("arguments").COURSE_ID);			  
			this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV/",true);
			var results = this.oModel.read("/TopicsSet?$filter=COURSE_ID eq "+COURSE_ID+"", null, null, true, function(oData, oResponse){ 
			var t = new sap.ui.model.json.JSONModel(oData);
			that.getView().setModel(t);
			var selectedTopic = that.getView().getModel().getData().results[COURSE_ID].TOPIC;
			that.getView().byId("detail").setTitle(selectedTopic);
			var oFrame = that.getView().byId("Link");
	          var oFrameContent = oFrame.$()[0];
	         var selectedSource = that.getView().getModel().getData().results[COURSE_ID].SOURCE;
	          oFrameContent.setAttribute("src", selectedSource); 
			});
			if(this.flag ===0)
			{sap.ui.core.BusyIndicator.show(0);
			if (this._sTimeoutId) {
				jQuery.sap.clearDelayedCall(that._sTimeoutId);
				that._sTimeoutId = null;
			}

			this._sTimeoutId = jQuery.sap.delayedCall(4000, this, function() {
				sap.ui.core.BusyIndicator.hide();
			});
			}
		},
		onBackPress:function(){
			var that = this;
			this.flag = 1;
			that.oRouter.navTo("Courses");
		},
		handleListItemPress: function (evt) {
			var that = this;
			var selectedTopic = evt.getSource().getTitle();
			that.getView().byId("detail").setTitle(selectedTopic);
			 var oFrame = this.getView().byId("Link");
	          var oFrameContent = oFrame.$()[0];
	          var selectedSource = evt.getSource().getBindingContext().getProperty("SOURCE");
	          oFrameContent.setAttribute("src", selectedSource); 
		},
		
		onSearch: function(oEvt)
		{
			// add filter for search
			var aFilters = [];
			var sQuery = oEvt.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("TOPIC", sap.ui.model.FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var list = this.getView().byId("idList");
			var binding = list.getBinding("items");
			binding.filter(aFilters, "Application");
		}
	});
});
