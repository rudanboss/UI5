sap.ui.define([
        'sap/m/MessageBox',
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		"ztms/Controller/formatter"
	], function(MessageBox, jQuery, Controller,formatter) {
	"use strict";
	var oModel;

	return Controller.extend("ztms.Controller.Admin", {
		formatter: formatter,
		onInit : function(){
			this.count = 0;
			this.items = {};
			this.XL_row_object=[];
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("Admin").attachPatternMatched(this._handleRouteMatched, this);
			var oDataEditable={
			editable : false,
			visible : true,
			invisible : false
	}
	var oModelEditable = new sap.ui.model.json.JSONModel(oDataEditable);
	this.getView().setModel(oModelEditable,"oModelEditable");
		},

		_handleRouteMatched : function(evt) {
			var admin_id;
			var that=this;
			this.admin = localStorage.admin;
			
			var admin_id;
			this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV",true);
			this.oModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(this.oModel);
			if(localStorage.flag=="true"){
			that.oModel.setHeaders({"X-Requested-With" : "X"});
			that.oModel.read("/AdminSet?$filter=ID eq '"+localStorage.admin+"' and PASSWORD eq '"+localStorage.admin_pass+"'", null, null, false, function(oData, oResponse){ 
					 if (oData.results.length == 1) {
						 admin_id = oData.results[0].ID;
						 var t = new sap.ui.model.json.JSONModel();
						 t.setData(oData);
						 that.getView().setModel(t, "login_check");	
						 that.getView().byId("smartForm").setModel(that.oModel);
						 that.getView().byId("smartForm").bindElement("/AdminSet(ID='"+oData.results[0].ID+"')");
						 that.getView().byId("smartForm2").setModel(that.oModel);
						 that.getView().byId("smartForm2").bindElement("/AdminSet(ID='"+oData.results[0].ID+"')");
					 }
					 else{
						 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
							that.oRouter.navTo("Main", true);
							localStorage.clear();
					 }
						});	
			this.admin_id = admin_id;
			
			that.oModel.read("/Admin_PieSet?$filter=ID eq '"+localStorage.admin+"'", null, null, false, function(oData, oResponse){ 
				var t = new sap.ui.model.json.JSONModel();
				 t.setData(oData);
				 that.getView().setModel(t,"sampleDatajson");
			});	
			
			that.oModel.read("/Admin_dashSet?$filter=ID eq '"+localStorage.admin+"'", null, null, false, function(oData, oResponse){ 
				var b={}, results=[];
				 oData.results.forEach(function(temp){
					 b.SET
					 b[temp.SET_NAME]= b[temp.SET_NAME]!== undefined ? b[temp.SET_NAME]+1 : 1;
					 });
				 Object.keys(b).forEach(function(temp){
					    results.push({"SET_NAME":temp,"ATTEMPTS":b[temp]});
					});
				 var t = new sap.ui.model.json.JSONModel({results:results});
				 that.getView().setModel(t,"samplepiejson");
			});	
			var utc = new Date().toJSON().slice(0,10).replace(/-/g,'/');
			that.getView().byId("idDonutChart").setVizProperties({
					title: {
					text: "Recent Test Details for Date:" + utc
				}});
		}
			 else{
				 if(localStorage.flag==undefined || localStorage.flag=="false"){
				 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
					that.oRouter.navTo("Main", true);
				 }
				 that.oRouter.navTo("Main", true);
			 }
		},
		
		onBeforeRebindTable: function(oEvent) {        
			var oBindingParams = oEvent.getParameter("bindingParams");       
			oBindingParams.filters.push(new sap.ui.model.Filter("ID", "EQ", this.admin));
			},
			/*
			onBeforeRebindTable2: function(oEvent) { 
				if(this.USER_ID)
					{
				var oBindingParams = oEvent.getParameter("bindingParams");       
				oBindingParams.filters.push(new sap.ui.model.Filter("USER_ID", "EQ", this.USER_ID));
					}
				},*/
			
		onCollapseExpandPress: function () {
			var oSideNavigation = this.getView().byId('sideNavigation');
			var bExpanded = oSideNavigation.getExpanded();
			oSideNavigation.setExpanded(!bExpanded);
			var viewId = this.getView().getId();
			var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		
		
		onSelectDashboard : function(oEvent){
			this.getView().byId("navCon").to(this.getView().byId("p_dashboard"));
			this._handleRouteMatched();
		},
	
		onSelectTest : function(oEvent){
			this.getView().byId("navCon").to(this.getView().byId("p_testDetails"));
		},
		
		onUserDetails  :function(oEvent){
			var that = this;
			that.getView().byId("navCon").to(that.getView().byId("p_users"));
			that.getView().byId("navCon2").to(that.getView().byId("p_users_details"));
		},
	
		onSelectnewTest : function(oEvent){
			var that = this;
			that.oDialog = that.getView().byId("AddSet");
			if (!that.oDialog) {
				that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.AddSet");
				that.getView().addDependent(that.oDialog);
			}
			that.oDialog.open();
			
		},
		
		onAddSet : function(){
			var that = this;
			if(this.getView().byId("id_setName").getValue() !== "" && this.getView().byId("id_setID").getValue() !== "" && this.getView().byId("id_maxTime").getValue() && this.getView().byId("id_comboitem").getSelectedKey() !== "")
			{this.getView().byId("label_setName").setValue("Set Name: " + this.getView().byId("id_setName").getValue());
			this.getView().byId("label_setID").setValue("Set ID: " + this.getView().byId("id_setID").getValue());
			this.getView().byId("label_maxTime").setValue("Max Time: "+this.getView().byId("id_maxTime").getValue()+" Minutes");
			this.UKEY = this.admin_id+"-"+this.getView().byId("id_setName").getValue()+"-"+this.getView().byId("id_setID").getValue();
			this.TYPE = this.getView().byId("id_comboitem").getSelectedKey();
			var oEntity = {};
			oEntity.UKEY = this.UKEY.toString();
			oEntity.ID = this.admin_id.toString();
			oEntity.SET_ID = this.getView().byId("id_setID").getValue().toString();
			oEntity.SET_NAME = this.getView().byId("id_setName").getValue().toString();
			oEntity.MAX_TIME = this.getView().byId("id_maxTime").getValue().toString();
			oEntity.TYPE = this.getView().byId("id_comboitem").getSelectedKey();
			this.oModel.create("/SetSet",oEntity,null,function(){
				that.onCreateQues();
				that.getView().byId("navCon").to(that.getView().byId("p_addTest"));
				that.oDialog.close();
				that.getView().byId("id_error").setVisible(false);
				that.getView().byId("id_error_mandt").setVisible(false);
			},function(){
				that.getView().byId("id_error").setVisible(true);
			});
			}
			else
				{
			that.getView().byId("id_error_mandt").setVisible(true);
				}
		},
		
		onCancelDialog : function(){
			this.oDialog.close();
			this.getView().byId("id_error").setVisible(false);
		},
	
		onSelectUsers : function(oEvent){
			this.getView().byId("navCon").to(this.getView().byId("p_users"));
			this.getView().byId("navCon2").to(this.getView().byId("p_users_2"));
		},
		
		onTestPress: function(oEvent,val){
			var that = this;
			if(val)
				{
				var UKEY = this.admin + "-" + val;
				}
			else
				{
				var oSource = oEvent.oSource.getBindingContext().getObject(); 
				var UKEY = this.admin + "-" + oSource.SET_NAME + "-" + oSource.SET_ID;
				}
			
			that.oModel.read("/QuesSet?$filter=UKEY eq '"+UKEY+"'", null, null, false, function(oData, oResponse){ 
				if(oData.results.length>0)
					{
			var t = new sap.ui.model.json.JSONModel(oData);
			that.getView().setModel(t, "testPress");	
			if(that._oPopover)
				{
			that._oPopover.close();
				}
			that.getView().byId("navCon").to(that.getView().byId("p_test_details"));
					}
				else
					{
					sap.m.MessageBox.information("The Questionnaire is not Maintained!");
					}
			},function(oError){
				sap.m.MessageBox.error("Some error");
			});
			
		},
		
		onTest: function()
		{
			this.getView().byId("navCon").to(this.getView().byId("p_testDetails"));
		},
		
		onUserPress : function(oEvent,val){
			var dropDownA=[];
			var that = this;
			if(val)
				{
				var results = {"USER_ID":val};
				}
			else
				{
				var results = oEvent.getSource().getBindingContext().getObject();
				}
			this.USER_ID = results.USER_ID;
			that.oModel.read("/UserSet(USER_ID='"+results.USER_ID+"')",{success:function(oData,oResponse){
				var authArray = oData.AUTH.split(",");
				/*var authArr1 = [];
				authArray.forEach(function(val){
					authArr1.push({"SET":val});
				});*/
				oData.AUTH = authArray;
				var userModel = new sap.ui.model.json.JSONModel(oData);
				that.getView().setModel(userModel,"userModel");
				that.oModel.read("/SetSet?$filter=ID eq '"+localStorage.admin+"'", null, null, false, function(oData, oResponse){ 
					var t = new sap.ui.model.json.JSONModel(oData);
					that.getView().setModel(t,"authorizeModel");
				});	
				that.oModel.read("/Admin_dashSet?$filter=USER_ID eq '"+that.USER_ID+"'", null, null, false, function(oData, oResponse){ 
					var detailModel = new sap.ui.model.json.JSONModel(oData);
					that.getView().setModel(detailModel,"detailsModel");
				},function(oError){
					
				});
				that.getView().byId("navCon").to(that.getView().byId("p_users"));
				that.getView().byId("navCon2").to(that.getView().byId("p_users_details"));
			},error:function(oError){
				MessageBox.error("The record could not be found");
			}});
			that.oModel.read("/User_dashSet?$filter=USER_ID eq '"+that.USER_ID+"'", null, null, false, function(oData, oResponse){ 
				var gData = {"results":[]};
				if(oData.results.length > 0)
					{
						oData.results.forEach(function(val){
							if(val.SCORE != -1)
								{
									gData.results.push(val);
								}
						});
					}
				var newData = {
						 'results':[]
						};
				 var unique = {};
				 var distinct = [];
				 distinct.push({"SET_NAME":"ALL"});
				 oData.results.forEach(function (x) {
					
				   if (!unique[x.SET_NAME]) {
				     distinct.push({"SET_NAME":x.SET_NAME});
				     unique[x.SET_NAME] = true;
				   }
				 });
				 newData.results= distinct;
				 var t2 = new sap.ui.model.json.JSONModel(newData);
				 that.getView().setModel(t2,"sampleDatajson2");
				var t = new sap.ui.model.json.JSONModel();
				 t.setData(gData);
				 that.getView().setModel(t,"sampleUserDatajson");
			});
			
		},
		
		onSelectUkeyChange:function(oEvent){ 
			var that=this;
			var selected = oEvent.getSource().getSelectedItem().getText();
			if(selected=="ALL"){
				this.oModel.read("/User_dashSet?$filter=USER_ID eq '"+that.USER_ID+"'", null, null, false, function(oData, oResponse){ 
					var t = new sap.ui.model.json.JSONModel();
					 t.setData(oData);

					 that.getView().setModel(t,"sampleUserDatajson");
					 
				});
			}
			else{
				this.oModel.read("/User_dashSet?$filter=USER_ID eq '"+that.USER_ID+"' and SET_NAME eq '"+selected+"'", null, null, false, function(oData, oResponse){ 
					var t = new sap.ui.model.json.JSONModel();
					 t.setData(oData);

					 that.getView().setModel(t,"sampleUserDatajson");
					 
				});
			}
			
			this.getView().getModel("sampleUserDatajson").refresh(true);
			
		},
		
		onRefresh: function(){
			var that = this;
			this.getView().getModel().refresh(true);
			sap.ui.core.BusyIndicator.show(0);
			if (this._sTimeoutId) {
				jQuery.sap.clearDelayedCall(that._sTimeoutId);
				that._sTimeoutId = null;
			}

			this._sTimeoutId = jQuery.sap.delayedCall(2000, this, function() {
				sap.ui.core.BusyIndicator.hide();
				window.location.reload(false); 
			});
		},
		
		onProfiles: function(){
			
			this.getView().byId("navCon2").to(this.getView().byId("p_users_2"));
		},
		onAuthorize: function(){
			var auth = [];
			var authModel = [];
			var that = this;
			var tokens = this.getView().byId("user_auth").getSelectedKeys();
			var oEntity={};
			oEntity.AUTH = tokens.toString();
			oEntity.USER_ID = this.USER_ID;
			oEntity.USER_NAME = "1";
			this.oModel.update("/UserSet(USER_ID='"+oEntity.USER_ID+"')",oEntity,null,function(){
				sap.m.MessageToast.show("Successfully Authorized");
				that.getView().getModel("userModel").getData().AUTH = tokens;
				that.getView().getModel("userModel").refresh(true);
			},function(){
				
			});
		},
		authorizePress : function()
		{
			var that = this;
			var selected = this.getView().byId("table").getSelectedItems();
			if(selected.length > 0)
				{
			if (!this._authoPopover) {
				this._authoPopover = sap.ui.xmlfragment("ztms.Fragment.auth", this);
				this.getView().addDependent(this._authoPopover);
			}
			that.oModel.read("/SetSet?$filter=ID eq '"+localStorage.admin+"'", null, null, false, function(oData, oResponse){ 
				var t = new sap.ui.model.json.JSONModel(oData);
				that.getView().setModel(t,"authMultiModel");
			});	
			this._authoPopover.open();
				}
			else
				{
				sap.m.MessageBox.error("No user to authorize");
				}
		},
		handleClose1:function(oEvent)
		{
			var that = this;
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				var tokens = aContexts.map(function(oContext) { return oContext.getObject().UKEY; }).join(",");
				var selected = this.getView().byId("table").getSelectedItems();
				var batchChanges = [];
				selected.forEach(function(val){
					batchChanges.push(that.oModel.createBatchOperation(
							"UserSet(USER_ID='"+val.getBindingContext().getObject().USER_ID+"')", "PUT",
							{"USER_ID":val.getBindingContext().getObject().USER_ID,"AUTH":tokens,"USER_NAME":"0"}));
				});
				sap.ui.core.BusyIndicator.show();
				that.oModel.addBatchChangeOperations(batchChanges);
				that.oModel.submitBatch(function(oResponse) {
					sap.ui.core.BusyIndicator.hide();
					sap.m.MessageBox.success("Successfully authorized");
					that.getView().byId("table").removeSelecteds();
				},function(oError){});
				}
		},
		handleMessagePopoverPress: function (oEvent) {

			// create popover
			if (!this._oPopover) {
				this._oPopover = sap.ui.xmlfragment("ztms.Fragment.Bot", this);
				this.getView().addDependent(this._oPopover);
			}
			if(this._oPopover.isOpen())
				{
				this._oPopover.close();
				}
			else
				{
			this._oPopover.openBy(oEvent.getSource());
				}
		},
		ask:function(oEvent)
		{
			var input = sap.ui.getCore().byId("query").getValue();
			var fBox = new sap.m.FlexBox({
				alignItems: "Start",
				justifyContent:"End"
			});
			var text = new sap.m.Text({
				text : input
				});
			text.addStyleClass("chat2");
			fBox.addItem(text);
			fBox.addStyleClass("sapUiSmallMarginTop");
			sap.ui.getCore().byId("chat").addItem(fBox);
			sap.ui.getCore().byId("query").setValue("");
			this.answer(input);
		},
		answer:function(query)
		{
			var greetings = ["hi","hello","what's up","wassup"];
			var greetings_response = ["Hello","Nice to meet you","Hmm mm"];
			var job = ["what can you do for me?","what can you do for me","what can you do","what can you do?"];
			if(query)
				{
				if(greetings.indexOf(query.toLowerCase())!= -1)
					{
					var item = greetings_response[Math.floor(Math.random()*greetings_response.length)];
					var a = this.createText(item);
					this.reply(a);
					}
				else if (query.toLowerCase().match(/what.*you.*do/g))
					{
					var a = this.createText("What do you want me to do? XD");
					var b = this.createButton("Show you your Questionnaire");
					var c = this.createButton("Show you user details");
					var d = this.createButton("Delete users");
					var e = this.createButton("Do something naughty");
					var vbox = new sap.m.VBox();
					vbox.addItem(a);
					vbox.addItem(b);
					vbox.addItem(c);
					vbox.addItem(d);
					vbox.addItem(e);
					
					this.reply(vbox);
					}
				else
					{
					this.reply();
					}
				}
		},
		reply: function(ans)
		{
			if(ans)
				{
				var fBox = new sap.m.FlexBox({
					alignItems: "Start",
					justifyContent:"Start"
				});
				ans.addStyleClass("chat1");
				ans.addStyleClass("sapUiSizeCompact");
				fBox.addItem(ans);
				fBox.addStyleClass("sapUiSmallMarginTop");
				sap.ui.getCore().byId("chat").addItem(fBox);
				}
			else
			{
			var fBox = new sap.m.FlexBox({
				alignItems: "Start",
				justifyContent:"Start"
			});
			var text = new sap.m.Text({
				text : "Did not recognize you. Come again"
				});
			text.addStyleClass("chat1");
			fBox.addItem(text);
			fBox.addStyleClass("sapUiSmallMarginTop");
			sap.ui.getCore().byId("chat").addItem(fBox);
			}
			$("#pop-cont").scrollTop($("#pop-cont")[0].scrollHeight - $("#pop-cont").height());
			
		},
		onClear: function (oEvent) {
			sap.ui.getCore().byId("chat").removeAllItems();
		},
		
		onScroll : function(){
			$("#pop-cont").scrollTop($("#pop-cont")[0].scrollHeight - $("#pop-cont").height());
		},
		
		createText: function(text)
		{
			var text = new sap.m.Text({
				text : text
				});
			return text;
		},
		buttonPress: function(btext){
			var that = this;
			var naughty = ["I just did.\n I was being naughty by giving you the option of being naughty :D","You should not ask for that ;)",
			               "Its rude to ask for it","Gotcha :P ","That was a character test, you failed"];
			var btext = btext.toLowerCase();
			if(btext.match(/show.*ques/g))
				{
				var Input = new sap.m.Input({
					submit: function(oEvent)
					{
						that.onTestPress(oEvent,oEvent.getParameter("value"));
					}
					});
				var a = this.createText("Provide the SET NAME-SET ID  and hit Enter");
				var vbox = new sap.m.VBox();
				vbox.addItem(a);
				vbox.addItem(Input);
				this.reply(vbox);
				}
			else if (btext.match(/show.*user/g))
				{
				var Input = new sap.m.Input({
					submit: function(oEvent)
					{
						that.onUserPress(oEvent,oEvent.getParameter("value"));
					}
					});
				var a = this.createText("Provide the USER_ID  and hit Enter");
				var vbox = new sap.m.VBox();
				vbox.addItem(a);
				vbox.addItem(Input);
				this.reply(vbox);
				}
			else if(btext.match(/delete.*user/g))
				{
				var a = this.createText("Sorry the function is not yet available");
				this.reply(a);
				}
			else if (btext.match(/naughty/g))
				{
				var item = naughty[Math.floor(Math.random()*naughty.length)];
				var a = this.createText(item);
				this.reply(a);
				}
		},
		createButton:function(text)
		{
			var that = this;
			var link = new sap.m.Button({
				text : text,
				type: sap.m.ButtonType.Accept,
				press: function(oEvent)
				{
					that.buttonPress(text);
				}
				});
			link.addStyleClass("sapUiSmallMarginTop");
			return link;
		},
		onSelectSetting : function(oEvent){
			this.getView().byId("navCon").to(this.getView().byId("p_accountSetting"));
		},
		
		onEdit:function(){
			this.getView().getModel("oModelEditable").getData().editable = true;
			this.getView().getModel("oModelEditable").getData().invisible = true;
			this.getView().getModel("oModelEditable").getData().visible = false;
			this.getView().getModel("oModelEditable").refresh(true);
		},
		
		onSave:function(){
			var that=this;
			var formData = this.getView().byId("smartForm").getBindingContext().getObject();
			if (this.getView().byId("id_name").getValue() != "")
				{
			delete formData['__metadata'];
			this.oModel.setHeaders({"X-Requested-With" : "X"});
			this.oModel.update("/AdminSet(ID='"+formData.ID+"')",formData, {
						success : function() {
							sap.m.MessageToast.show("Updated Successfully");
						},
						error:function(){
							sap.m.MessageToast.show("Error in Updating details");
							that.getView().getModel().refresh(true);
						}
					});
			this.getView().getModel("oModelEditable").getData().editable = false;
			this.getView().getModel("oModelEditable").getData().invisible = false;
			this.getView().getModel("oModelEditable").getData().visible = true;
			this.getView().getModel("oModelEditable").refresh(true);
				}
		},
		
		onCancel : function()
		{
			this.getView().getModel("oModelEditable").getData().editable = false;
			this.getView().getModel("oModelEditable").getData().invisible = false;
			this.getView().getModel("oModelEditable").getData().visible = true;
			this.getView().getModel("oModelEditable").refresh(true);
			this.getView().getModel().refresh(true);
		},
		
		onSelectLogOut : function(oEvent){
			var that = this;
			localStorage.clear();
			localStorage.flag = false;
			that.oRouter.navTo("Main", true);
			
			
		},

	onCreateQues: function(){
		var that = this;
		if(that.count>0)
			{
		var oEntity={};
		oEntity.UKEY = this.UKEY.toString();
		oEntity.QID = Number(this.count);
		oEntity.QNAME = this.quesInput.getValue();
		oEntity.A1 = this.mcqOpt1.getValue();
		oEntity.A2 = this.mcqOpt2.getValue();
		oEntity.A3 = this.mcqOpt3.getValue();
		oEntity.A4 = this.mcqOpt4.getValue();
		oEntity.A  = this.selected_answer;
		oEntity.MARKS = Number(this.marks.getValue());
		oEntity.ANS = this.desc_input.getValue().toString();
		that.items["Question no."+oEntity.QID]=oEntity;
			}
		this.count++;
		var panel = new sap.m.Panel({
			class: "borderColor"
		});
		var vbox = new sap.m.VBox({
			id : "vbox"+that.count
		});
		var mcq_vbox = new sap.m.VBox();
		var vbox_dec = new sap.m.VBox();
		var hbox = new sap.m.HBox();
		var quesLabel = new sap.m.Label({
			text : "Question no." + this.count
		})
		var quesOpt = new sap.m.ComboBox({
			showSecondaryValues : true,
			change : function (){
				if (this.getSelectedItem().getKey() === "2")
					{
					vbox_dec.setVisible(true);
					mcq_vbox.setVisible(false);
					}
				else if(this.getSelectedItem().getKey() === "1") 
					{
					vbox_dec.setVisible(false);
					mcq_vbox.setVisible(true);
					}
			}
		});
		var opt1 = new sap.ui.core.Item({
			key : "1",
			text : "MCQ Question"
		});
		var opt2 = new sap.ui.core.Item({
			key : "2",
			text : "Descriptive Question"
		});
		if(this.TYPE === 'O')
			{
		quesOpt.addItem(opt1);
		quesOpt.setSelectedKey("1");
		vbox_dec.setVisible(false);
		mcq_vbox.setVisible(true);
			}
		else if(this.TYPE === 'S')
			{
		quesOpt.addItem(opt2);
		quesOpt.setSelectedKey("2");
		vbox_dec.setVisible(true);
		mcq_vbox.setVisible(false);
			}
		else
			{
		quesOpt.addItem(opt1).addItem(opt2);	
		quesOpt.setSelectedKey("1");
		vbox_dec.setVisible(false);
		mcq_vbox.setVisible(true);
			}
		this.quesInput = new sap.m.Input({
			width : "50rem",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].QNAME=oEvent.getSource().getValue();}
			}
		});
		var mcqLabel6 = new sap.m.Label({
			text : "Answer: " 
		});
		
		this.mcqOpt1 = new sap.m.Input({
			width : "10rem",
			value : ""	,
			placeholder: "Option 1",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].A1=oEvent.getSource().getValue();}
			}
		});
		this.mcqOpt2 = new sap.m.Input({
			width : "10rem",
			value : ""	,
			placeholder: "Option 2",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].A2=oEvent.getSource().getValue();}
			}
		});
		this.mcqOpt3 = new sap.m.Input({
			width : "10rem",
			value : ""	,
			placeholder: "Option 3",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].A3=oEvent.getSource().getValue();}
			}
		});
		this.mcqOpt4 = new sap.m.Input({
			width : "10rem",
			value : ""	,
			placeholder: "Option 4",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].A4=oEvent.getSource().getValue();}
			}
		});
		var mcqOpt5 = new sap.m.ComboBox({
			width : "15rem",
			placeholder: "Select An Answer",
			selectionChange : function(oEvent){
				that.selected_answer = oEvent.oSource.getSelectedKey();
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].A=that.selected_answer;}
			}
		});
		var ansopt1 = new sap.ui.core.Item({
			key : "0",
			text : "Option 1"
		});
		var ansopt2 = new sap.ui.core.Item({
			key : "1",
			text : "Option 2"
		});
		var ansopt3 = new sap.ui.core.Item({
			key : "2",
			text : "Option 3"
		});
		var ansopt4 = new sap.ui.core.Item({
			key : "3",
			text : "Option 4"
		});
		mcqOpt5.addItem(ansopt1).addItem(ansopt2).addItem(ansopt3).addItem(ansopt4);
		this.marks = new sap.m.Input({
			width: "5rem",
			placeholder: "Marks",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].MARKS=oEvent.getSource().getValue();}
			}
		});
		var mcq_hbox = new sap.m.HBox();
		vbox.addItem(quesLabel);
		hbox.addItem(this.quesInput);
		hbox.addItem(quesOpt);
		hbox.addItem(this.marks);
		vbox.addItem(hbox);
		/*ADD MCQ OPTION*/
		mcq_vbox.addItem(this.mcqOpt1);
		mcq_vbox.addItem(this.mcqOpt2);
		mcq_vbox.addItem(this.mcqOpt3);
		mcq_vbox.addItem(this.mcqOpt4);
		mcq_vbox.addItem(mcqOpt5);
		
		vbox.addItem(mcq_vbox);
		
		/*ADD Decriptive Ans*/
		
		this.desc_input = new sap.m.TextArea({
			growing : true,
			width : "100%",
			liveChange : function(oEvent){
				var oEntity = {};
				var currentQues = oEvent.getSource().getParent().getParent().getItems()[0].getText();
				if(that.items[currentQues])
				{that.items[currentQues].ANS=oEvent.getSource().getValue();}
			}
		});
		vbox_dec.addItem(mcqLabel6);
		vbox_dec.addItem(this.desc_input);
		vbox.addItem(vbox_dec);
		
		
		panel.addContent(vbox);
		this.getView().byId("id_test").addItem(panel);
		
		
	},
	onUserDetailsPress: function(oEvent)
	{
		var that = this;
		var Score = oEvent.getSource().getBindingContext("detailsModel").getObject().SCORE;
		if( Score === "-1")
		{
		var submit;
		var arr = ["A1","A2","A3","A4"];
		var marks = {};
		var results = oEvent.getSource().getBindingContext("detailsModel").getObject();
		that.getView().byId("quesAns").destroyContent();
		var info = new sap.m.ObjectStatus({
			text:"**Objective answers need not be evaluated as they are being evaluated automatically"
		});
		info.setState("Error");
		that.getView().byId("quesAns").addContent(info);
		this.oModel.read("/QuesSet?$filter=UKEY eq '"+results.UKEY+"'", null, null, false, function(oData, oResponse){ 
			var quesArray = oData.results;
			/*quesArray[3].A="";
			quesArray[3].ANS="fdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfe";
			quesArray[2].A="";
			quesArray[2].ANS="fdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfe";*/
			var totalScore = 0;
			that.oModel.read("AnswersSet?$filter=UKEY eq '"+results.UKEY+"' and USER_ID eq '"+results.USER_ID+"'", null, null, false, function(oData, oResponse){ 
				var ansArray = oData.results;
				/*ansArray[3].A="";
				ansArray[3].ANS="gfdgfdgfdgfdgfdgfdgfdgfdgdefefdgfdgfdgfdgfgfefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfe";
				ansArray[2].A="";
				ansArray[2].ANS="gfdgfdgfdgfdgfdgfdgfdgfdgdefefdgfdgfdgfdgfgfefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfefdefefefewfewfewfewfewfewfe";*/
				quesArray.forEach(function(temp,index){
					var vbox = new sap.m.VBox();
					var hbox = new sap.m.HBox();
					var quesNo = new sap.m.Label({
						text: "Q.no "+temp.QID+": "
					});
					var ques = new sap.m.Text({
						text: temp.QNAME+"? (Total Score: "+temp.MARKS+")"
					});
					quesNo.addStyleClass("ques");
					ques.addStyleClass("ques");
					var ans = new sap.m.Label({
						text: "Answer"
					});
					var cAns = new sap.m.Label({
						text: "Correct Answer"
					});
					if(temp.A)
						{
						var givenAnswer = new sap.m.ObjectStatus({
							text:temp[arr[ansArray[index].A]]
						});
						if(temp.A === ansArray[index].A)
							{
							totalScore=totalScore + parseInt(temp.MARKS);
							givenAnswer.setState("Success");
							}
						else
							{
							givenAnswer.setState("Error");
							}
						var correctAnswer = new sap.m.Text({
							text:temp[arr[temp.A]]
						});
						correctAnswer.addStyleClass("sapUiMediumMarginBottom");
						}
					else if(temp.ANS)
						{
						var givenAnswer = new sap.m.TextArea({
							value:ansArray[index].ANS,
							editable:false,
							growing:true,
							growingMaxLines:7
						});
						var correctAnswer = new sap.m.TextArea({
							value:temp.ANS,
							width:"50%",
							editable:false,
							growing:true,
							growingMaxLines:7
						});
						var giveMarks = new sap.m.Input({
							type:"Number",
							width:"40%",
							description:"/"+temp.MARKS,
							liveChange:function(oEvent)
							{
								if(parseInt(oEvent.getParameter("value")) <= parseInt(temp.MARKS))
									{
								marks[temp.QID]= oEvent.getParameter("value");
									}
								else
									{
									oEvent.getSource().setValue("");
									}
							}
						});
						correctAnswer.addStyleClass("sapUiMediumMarginBottom");
						}
					givenAnswer.addStyleClass("ans");
					correctAnswer.addStyleClass("ans");
					cAns.addStyleClass("ans");
					ans.addStyleClass("ans");
					if(temp.A)
						{
						that.getView().byId("quesAns").addContent(quesNo).addContent(ques)
						.addContent(ans).addContent(givenAnswer).addContent(cAns).addContent(correctAnswer);
						}
					else if (temp.ANS)
						{
						that.getView().byId("quesAns").addContent(quesNo).addContent(ques)
						.addContent(ans).addContent(givenAnswer).addContent(giveMarks).addContent(cAns).addContent(correctAnswer);
						}
					 submit = new sap.m.Button({
						text:"Submit",
						press:function(oEvent)
						{
							Object.values(marks).forEach(function(temp){
								totalScore +=parseInt(temp);
							});
							var oEntity = {};
							oEntity.SCORE = totalScore.toString();
							oEntity.USER_ID = results.USER_ID.toString(); 
							oEntity.UKEY = results.UKEY.toString();
							that.oModel.update("/ScoreSet(USER_ID='"+oEntity.USER_ID+"',UKEY='"+oEntity.UKEY+"')",oEntity, {
								success : function() {
									sap.m.MessageToast.show("Scores have been saved");
									that.onUserPress('',oEntity.USER_ID);
								},
								error:function(){
									sap.m.MessageToast.show("Error in Updating details");
									that.getView().getModel().refresh(true);
								}
							});
						}
					});
				});
				that.getView().byId("footerV").destroyItems();
				that.getView().byId("footerV").addItem(new sap.m.ToolbarSpacer());
				that.getView().byId("footerV").addItem(submit);
			});
		});
		this.getView().byId("navCon").to(this.getView().byId("testDisplay"));
		}
		else{
			sap.m.MessageToast.show("Test already Evaluated, Thankyou !!!");
		}
	},
	
	onSaveQues : function(){
		var that = this;
		
			var oEntity={};
			if(this.quesInput.getValue() != "")
			{
			oEntity.UKEY = this.UKEY.toString();
			oEntity.QID = Number(this.count);
			oEntity.QNAME = this.quesInput.getValue().toString();
			oEntity.A1 = this.mcqOpt1.getValue().toString();
			oEntity.A2 = this.mcqOpt2.getValue().toString();
			oEntity.A3 = this.mcqOpt3.getValue().toString();
			oEntity.A4 = this.mcqOpt4.getValue().toString();
			oEntity.A  = this.selected_answer;
			oEntity.MARKS = Number(this.marks.getValue())
			oEntity.ANS = this.desc_input.getValue().toString();
			that.items["Question no."+oEntity.QID]=oEntity;
				}
		if(Object.values(that.items).length > 0)
		{
		var batchChanges = [];
		Object.values(that.items).forEach(function(val){
			batchChanges.push(that.oModel.createBatchOperation(
					"QuesSet", "POST",
					val));
		});
		sap.ui.core.BusyIndicator.show();
		that.oModel.addBatchChangeOperations(batchChanges);
		that.oModel.submitBatch(function(oResponse) {
			sap.ui.core.BusyIndicator.hide();
			oEntity.UKEY = that.UKEY.toString();
			that.oModel.update("/QuesSet(UKEY='"+oEntity.UKEY+"',QID=1)",oEntity, {
				success : function() {
					that.getView().byId("navCon").to(that.getView().byId("p_testDetails"));
				},
				error:function(){
					sap.m.MessageToast.show("Error in Updating Total Marks, Please Update manually in Table");
					that.getView().byId("navCon").to(that.getView().byId("p_testDetails"));
				}
			});
		},function(oError)
		{
			sap.ui.core.BusyIndicator.hide();
		});
	}
	},
	
	onUploadQues : function(){
		var that = this;
		that.oDialog = that.getView().byId("AddQues");
		if (!that.oDialog) {
			that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.AddSet");
			that.getView().addDependent(that.oDialog);
		}
		that.oDialog.open();
	},
	onCancelQues : function(){
		
		this.oDialog.close();
	},
	
	onPressUpload: function(e) {
		var that = this;
		var json_object = {};
		if (e.getParameter("files") && e.getParameter("files")[0] && window.FileReader) {
			var reader = new FileReader();
			var result = {};
			var data;
			reader.onload = function(e) {
				var data = e.target.result;
				var workbook = XLSX.read(data, {
					type : 'binary'
				});
				workbook.SheetNames.forEach(function(sheetName) {
					// that is your object
					that.XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
					if(that.XL_row_object.length !== 0)
						{
						 json_object.names = JSON.stringify(that.XL_row_object);
						}
				});
				if(json_object.names === undefined)
				{
				that.getView().byId("Loadfile").setValue("");
				sap.m.MessageBox.error("Either File is empty or Template is wrong,  \n  Please select correct Template");
				}else
					{
					var batchChanges = [];
					var data = that.XL_row_object;
					if(data.length > 0)
						{
						for (var i = 0; i < data.length; i++) {
							data[i].UKEY = that.UKEY.toString();
							data[i].QID = parseInt(data[i].QID);
							batchChanges.push(that.oModel.createBatchOperation("QuesSet", "POST", data[i]));
						}
						}
					that.oModel.addBatchChangeOperations(batchChanges);
					that.oModel.submitBatch(function(oResponse) {
					that.oDialog.close();
					sap.m.MessageToast.show("Questionnaire Uploaded Successfully");
					that.getView().byId("navCon").to(that.getView().byId("p_testDetails"));
					});
					}
			};
			reader.readAsBinaryString(e.getParameter("files") && e.getParameter("files")[0]);
		}
	},
	
	onPressDownload : function(){
		var oUploadCollection = new sap.m.UploadCollection({
	        mimeType : ["application/msexcel"]
	      });
	var oCustomerHeaderAccept = new sap.m.UploadCollectionParameter({
	        name : "Accept",
	        value : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
	    });
	oUploadCollection.addHeaderParameter(oCustomerHeaderAccept);      

	var oUploadCollectionItem = new sap.m.UploadCollectionItem({
	      "fileName" : "QuesTemplate.xlsx",
	         "url" : "./Files/Ques.xlsx"
	     });
	oUploadCollection.downloadItem(oUploadCollectionItem, true);
	},
	
	onUploadTopics: function(){
		var that = this;
		that.oDialogTopics = that.getView().byId("AddTopics");
		if (!that.oDialogTopics) {
			that.oDialogTopics = sap.ui.xmlfragment(that.getView().getId(),"ztms.AddSet");
			that.getView().addDependent(that.oDialogTopics);
		}
		that.oDialogTopics.open();	
	},
	
	onPressUploadTopics: function(e){
		
		
	},
	
	onPressCancel: function(){
		this.oDialogTopics.close();	
	}
		});

});

