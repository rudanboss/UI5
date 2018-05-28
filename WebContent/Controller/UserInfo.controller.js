sap.ui.define([
        'sap/m/MessageBox',
		'jquery.sap.global',
		'sap/ui/core/mvc/Controller',
		'ztms/Controller/formatter'
	], function(MessageBox, jQuery, Controller, formatter) {
	
	"use strict"; 

	return Controller.extend("ztms.Controller.UserInfo", {formatter: formatter,
		
		onInit: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("UserInfo").attachPatternMatched(this._handleRouteMatched2, this);
			var oDataEditable={
					editable : false,
					visible : true,
					invisible : false
			}
			var oModelEditable = new sap.ui.model.json.JSONModel(oDataEditable);
			this.getView().setModel(oModelEditable,"oModelEditable");
			this.items = {};
		
//			var sampleDatajson = new sap.ui.model.json.JSONModel("http://dewdfcto021.wdf.sap.corp:1080/sap/bc/ui5_ui5/sap/ztmsys/i18n/Data.json");
//			this.getView().setModel(sampleDatajson,"sampleDatajson");
//			var visible = {
//					visible : false
//			}
//			var visibleModel = new sap.ui.model.json.JSONModel(visible );
//			this.getView().setModel(visibleModel,"visibleModel");
		},
		
		_handleRouteMatched2 : function(evt) {
			var that = this;
			//Active Login Starts here.
			var user_id;
			var auth;
			var tests_given;
			this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV",true);
			this.oModel.read("/User_dashSet?$filter=USER_ID eq '"+localStorage.user+"'", null, null, false, function(oData, oResponse){ 
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
				var t = new sap.ui.model.json.JSONModel();
				 t.setData(gData);
				 
	//unique values in drop down menu
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
				 that.getView().setModel(t,"sampleDatajson");
				 that.getView().setModel(t2,"sampleDatajson2");
				 that.getView().setModel(t,"sampleDatajson3");
				 
			});
			this.oModel.setDefaultBindingMode("TwoWay");
			this.getView().setModel(this.oModel);
			if(localStorage.flag=="true"){
			that.oModel.setHeaders({"X-Requested-With" : "X"});
			that.oModel.read("/UserSet?$filter=USER_ID eq '"+localStorage.user+"' and USER_PASS eq '"+localStorage.pass+"'", null, null, false, function(oData, oResponse){ 
					 if (oData.results.length == 1) {
						 user_id = oData.results[0].USER_ID;
						 auth = oData.results[0].AUTH;
						 tests_given = oData.results[0].TESTS_GIVEN
						 var t = new sap.ui.model.json.JSONModel();
						 t.setData(oData);
						 that.getView().setModel(t, "login_check");
						
//						that.getView().setModel(that.oModel);
						 that.getView().byId("smartForm").setModel(that.oModel);
						that.getView().byId("smartForm").bindElement("/UserSet(USER_ID='"+oData.results[0].USER_ID+"')");
						 that.getView().byId("smartForm22").setModel(that.oModel);
						 that.getView().byId("smartForm22").bindElement("/UserSet(USER_ID='"+oData.results[0].USER_ID+"')");
							
					 }
					 else{
						 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
							that.oRouter.navTo("Main", true);
							localStorage.clear();
					 }
						});	
			this.user_id = user_id;
			this.auth = auth;
			this.tests_given=tests_given;
			}
			 else{
				 if(localStorage.flag==undefined || localStorage.flag=="false"){
				 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
					that.oRouter.navTo("Main", true);
				 }
				 that.oRouter.navTo("Main", true);
			 }
			this.getView().byId("smartid").getModel().refresh(true);
			},
			onLogOutPress:function(){
				var that = this;
				localStorage.clear();
				localStorage.flag = false;
				that.oRouter.navTo("Main", true);
				
			},
			onSettingPress:function(){
				var that = this;
				var navCon = this.getView().byId("navCon");
				navCon.to(this.getView().byId("p5"), "fade");
			},
			onSelectUkeyChange:function(oEvent){
				var that=this;
				var selected = oEvent.getSource().getSelectedItem().getText();
				if(selected=="ALL"){
					this.oModel.read("/User_dashSet?$filter=USER_ID eq '"+localStorage.user+"'", null, null, false, function(oData, oResponse){ 
						var t = new sap.ui.model.json.JSONModel();
						 t.setData(oData);

						 that.getView().setModel(t,"sampleDatajson");
						 
					});
				}
				else{
					this.oModel.read("/User_dashSet?$filter=USER_ID eq '"+localStorage.user+"' and SET_NAME eq '"+selected+"'", null, null, false, function(oData, oResponse){ 
						var t = new sap.ui.model.json.JSONModel();
						 t.setData(oData);

						 that.getView().setModel(t,"sampleDatajson");
						 
					});
				}
				
				this.getView().getModel("sampleDatajson").refresh(true);
				
			},
		onCollapseExpandPress: function () {
			var oSideNavigation = this.getView().byId('sideNavigation');
			var bExpanded = oSideNavigation.getExpanded();
			oSideNavigation.setExpanded(!bExpanded);
			var viewId = this.getView().getId();
			var toolPage = sap.ui.getCore().byId(viewId + "--toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},
		onEdit:function(){
			this.getView().getModel("oModelEditable").getData().editable = true;
			this.getView().getModel("oModelEditable").getData().invisible = true;
			this.getView().getModel("oModelEditable").getData().visible = false;
			this.getView().getModel("oModelEditable").refresh(true);
		},
		onRefresh : function()
		{
			window.location.reload(false);
		},
		onSave:function(oEvent){
			
			var that=this;
			var formData
			if(oEvent.getSource().getTooltip()=='save'){
				formData = this.getView().byId("smartForm22").getBindingContext().getObject();
			}
			else{
				formData = this.getView().byId("smartForm").getBindingContext().getObject();
			}
			
			delete formData['__metadata'];
			this.oModel.setHeaders({"X-Requested-With" : "X"});
			this.oModel.update("/UserSet(USER_ID='"+formData.USER_ID+"')",formData, {
						success : function() {
							sap.m.MessageToast
									.show("Updated Successfully");
//							that.getView().getModel().refresh(true);
						},error:function(){
							sap.m.MessageToast
							.show("Error in Updating details");
						}
					});
			this.getView().getModel("oModelEditable").getData().editable = false;
			this.getView().getModel("oModelEditable").getData().invisible = false;
			this.getView().getModel("oModelEditable").getData().visible = true;
			this.getView().getModel("oModelEditable").refresh(true);
		},
		onCancel : function()
		{
			this.getView().getModel("oModelEditable").getData().editable = false;
			this.getView().getModel("oModelEditable").getData().invisible = false;
			this.getView().getModel("oModelEditable").getData().visible = true;
			this.getView().getModel("oModelEditable").refresh(true);
			this.getView().getModel().refresh(true);
		},
		
		onSelectProfile:function(evt){
			var that = this;
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("p2"), "fade");
//			var target = evt.getSource().data("target");
//			if (target) {
//				var animation = this.getView().byId("animationSelect").getSelectedKey();
//				navCon.to(this.getView().byId(target), animation);
//			} else {
//				navCon.back();
//			}
		}
		,
		onTakeTest:function(){
			var that=this;
			var auth_model ;
			if(this.auth)
			{
			var results_1 = [];
			var data = {'results':[]};
			var total_time;
			
				var Auth = this.auth.split(",");
				var tests_given = this.tests_given.split(",");
				Auth = Auth.filter(x => !tests_given.includes(x));
				if(Auth.length>0 && Auth[0]!== "")
					{

					var navCon = this.getView().byId("navCon");
					navCon.to(this.getView().byId("p3"), "fade");
					Auth.forEach(function(temp){
						if(temp){
						
						results_1.push({"AUTH":temp});
						}
						});
					data.results= results_1;
					 var t = new sap.ui.model.json.JSONModel();
					 t.setData(data);
					 this.getView().setModel(t, "auth_model");
						that.oModel.read("/SetSet?$filter=UKEY eq '"+data.results[0].AUTH+"'", null, null, false, function(oData, oResponse){ 
							 if (oData.results.length == 1) {
								 total_time = oData.results[0].MAX_TIME;
								 var t = new sap.ui.model.json.JSONModel();
								 t.setData(oData);
								 that.getView().setModel(t,"set_model");	
							 }
							 else{
								 MessageBox.error("Some error Occurred.Please try again");
							 }
								});	
					}
				else
					{
					var navCon = this.getView().byId("navCon");
					navCon.to(this.getView().byId("p4"), "fade");
					MessageBox.information("Currently there are no test assigned to you. Please contact Admin");
					}

				}
			else
				{
				MessageBox.information("Currently there are no test assigned to you. Please contact Admin");
				}
				/*var html_model = new sap.ui.model.json.JSONModel({
					HTML : "<p><em style=\"color:green; font-weight:600;\">Total Marks</em> .</p>",
					HTML2 : "<em style=\"color:green; font-weight:600;\">Total Time:&nbsp;</em>",
					HTML3 : "<p><strong><u>General Instructions:</u></strong></p> " +
							"<ol style=\"text-align: left; padding-top: 3px; padding-left: 4%; list-style-type: decimal;\"> " +
							"<li>Total duration of examination is <strong>"+total_time+"</strong> minutes .</li>" +
							" <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li> " +
							"<li><strong>Do not click outside the window.</strong>Test will automatically close if you do so.</li> </ol> </li> </ol> <p><strong><u>Answering a Question : </u></strong></p> <ol> <li value=\"8\">Procedure for answering a multiple choice type question:</li> </ol> <ol style=\"margin-left: 40px; list-style-type: lower-alpha;\"> <li>To select your answer, click on the button of one of the options</li>  <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button</li>  <li>Note that ONLY Questions for which answers are saved after answering will be considered for evaluation.</li> </ol>"});
				*/
			var html_model = new sap.ui.model.json.JSONModel({
				HTML : "<em style=\"color:green; font-weight:600;\">Total Marks: </em>",
				HTML2 : "<em style=\"color:green; font-weight:600;\">Total Time: </em>",
				HTML3 : "<p><strong><u>General Instructions:</u></strong></p> " +
				"<ol style=\"text-align: left; padding-top: 3px; padding-left: 4%; list-style-type: decimal;\"> " +
				"<li>Total duration of examination is <strong>"+total_time+"</strong> minutes .</li>" +
				" <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li> " +
				"<li><strong>Do not click outside the window.</strong>Test will automatically close if you do so.</li> </ol> </li> </ol> <p><strong><u>Answering a Question : </u></strong></p> <ol> <li value=\"8\">Procedure for answering a multiple choice type question:</li> </ol> <ol style=\"margin-left: 40px; list-style-type: lower-alpha;\"> <li>To select your answer, click on the button of one of the options</li>  <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button</li>  <li>Note that ONLY Questions for which answers are saved after answering will be considered for evaluation.</li> </ol>"+
						"<p><strong><u>Before beginning the exam:</u></strong></p>"+
						"<li>1. Only use Crome browser.</li>" +
						"<li>2. Maximize your browser window before starting the test.</li>" +
						"<li>3. Make sure you have a good internet connection.</li>" +
						"<li>4. Close all other irrelevant tabs of your browser.</li>" +
						"<p><strong><u>During the exam:</u></strong></p>"+
						"<li>1. Do not click outside the window.Test will automatically close if you do so.</li>" +
						"<li>2. Test will close automatically after the time is elapsed.</li>" +
						"<li>3. Save your test using submit button.</li>" +
						"<p><strong><u>Instructions for accessing the Exam:</u></strong></p>"+
						"<li>1. Contact your Admin or Instructor to authorize you for a test.</li>" +
						"<li>2. If you encounter any problems, click the help button at home page.</li>" 
						
				 });
				this.getView().setModel(html_model,"html_model");
//				var oFrame = this.getView().byId("html_link");
//				var oFrameContent = oFrame.$()[0];
//				
//				oFrameContent.setAttribute("src", marks);
//		          var selectedSource = evt.getSource().getBindingContext().getProperty("Source");
			
		},
		onSelectDashboard:function(){
			var that = this;
			this._handleRouteMatched2();
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("p4"), "fade");
		},
		onBeforeRebindTable: function(oEvent) {        
			var oBindingParams = oEvent.getParameter("bindingParams");       
			oBindingParams.filters.push(new sap.ui.model.Filter("USER_ID", "EQ", localStorage.user));
			this.getView().byId("smartid").getModel().refresh(true);
			
			},
		onProceedCheck:function(){
			var that = this;
			var tests_given="";
			var t_given = "";
			var ukey = this.getView().byId("test_ukey").getSelectedKey();
			localStorage.selected_ukey = ukey;
			var oEntity = {};
			var oEntity2 = {};
			that.oModel.read("/UserSet?$filter=USER_ID eq '"+localStorage.user+"' and USER_PASS eq '"+localStorage.pass+"'", null, null, false, function(oData, oResponse){ 
				 if (oData.results.length == 1 ) {
					 t_given = oData.results[0].TESTS_GIVEN;
					 tests_given=oData.results[0].TESTS_GIVEN.split(",");
					 if(tests_given.includes(localStorage.selected_ukey) == false || oData.results[0].TESTS_GIVEN=="")
						 {
						 
  							that.oDialogProceed = that.getView().byId("ProceedCheck");
							if (!that.oDialogProceed) {
								that.oDialogProceed = sap.ui.xmlfragment(that.getView().getId(),"ztms.login");
								that.getView().addDependent(that.oDialogProceed);
							}
							that.oDialogProceed.open();
						 }
					 else{
						 MessageBox.error("You have already given this test. Please wait for results.");
					 }
					 
					 
				 }
					});	
			this.tests_given=t_given;
			},
			onAccept : function(){
				var oEntity={};
				var oEntity2={};
				var that=this;
				var ukey = this.getView().byId("test_ukey").getSelectedKey();
				oEntity2.SCORE = "0";
				oEntity2.USER_ID=localStorage.user;
				oEntity2.UKEY=ukey;
				oEntity.USER_ID=localStorage.user;
				that.oModel.update("/ScoreSet(USER_ID='"+localStorage.user+"',UKEY='"+ukey+"')",oEntity2, {
					success : function() {
					},error:function(){
					}
				});
				if(that.tests_given=="")
				{
				oEntity.TESTS_GIVEN = localStorage.selected_ukey;
				that.oModel.update("/UserSet(USER_ID='"+localStorage.user+"')",oEntity, {
					success : function() {
					},error:function(){
					}
				});
				}
			else{
				
				that.tests_given = that.tests_given+","+localStorage.selected_ukey;
				oEntity.TESTS_GIVEN = that.tests_given;
				that.oModel.update("/UserSet(USER_ID='"+localStorage.user+"')",oEntity, {
					success : function() {
					},error:function(){
					}
				});
			}
					this.oDialogProceed.close();
					this.onTakeTest();
					window.open("http://dewdfcto021.wdf.sap.corp:1080/sap/bc/ui5_ui5/sap/ztmsys/index.html#/TakeTest", "_blank", "toolbar=no,titlebar=no,menubar=no,fullscreen=yes,width=1440,height=1440");
				},
		onSelectChange:function(oEvent){
			var ukey = oEvent.getSource().getSelectedKey();		
			
			var total_marks;
			var that=this;
			var total_time;
			that.oModel.read("/SetSet?$filter=UKEY eq '"+ukey+"'", null, null, false, function(oData, oResponse){ 
				 if (oData.results.length == 1) {
					 total_time = oData.results[0].MAX_TIME;
					 total_marks = oData.results[0].TOTAL_MARKS;
					 var t = new sap.ui.model.json.JSONModel();
					 t.setData(oData);
					 that.getView().setModel(t,"set_model");	
					
				 }
				 else{
					 MessageBox.error("Some error Occurred.Please try again");
				 }
					});	
			this.getView().getModel("set_model").refresh(true);
//			var html_model = new sap.ui.model.json.JSONModel({
//				HTML : "<em style=\"color:green; font-weight:600;\">Total Marks:&nbsp;</em>",
//				HTML2 : "<em style=\"color:green; font-weight:600;\">Total Time:&nbsp;</em>"
//			});
//			this.getView().setModel(html_model,"html_model");
		/*	var html_model = new sap.ui.model.json.JSONModel({
				HTML : "<p><em style=\"color:green; font-weight:600;\">Total Marks</em> .</p>",
				HTML2 : "<em style=\"color:green; font-weight:600;\">Total Time:&nbsp;</em>",
				HTML3 : "<p><strong><u>General Instructions:</u></strong></p> " +
						"<ol style=\"text-align: left; padding-top: 3px; padding-left: 4%; list-style-type: decimal;\"> " +
						"<li>Total duration of examination is <strong>"+total_time+"</strong> minutes .</li>" +
						" <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li> " +
						"<li><strong>Do not click outside the window.</strong>Test will automatically close if you do so.</li> </ol> </li> </ol> <p><strong><u>Answering a Question : </u></strong></p> <ol> <li value=\"8\">Procedure for answering a multiple choice type question:</li> </ol> <ol style=\"margin-left: 40px; list-style-type: lower-alpha;\"> <li>To select your answer, click on the button of one of the options</li>  <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button</li>  <li>Note that ONLY Questions for which answers are saved after answering will be considered for evaluation.</li> </ol>"});
			*/
			var html_model = new sap.ui.model.json.JSONModel({
				HTML : "<em style=\"color:green; font-weight:600;\">Total Marks:&nbsp;</em>",
				HTML2 : "<em style=\"color:green; font-weight:600;\">Total Time:&nbsp;</em>",
				HTML3 : "<p><strong><u>General Instructions:</u></strong></p> " +
				"<ol style=\"text-align: left; padding-top: 3px; padding-left: 4%; list-style-type: decimal;\"> " +
				"<li>Total duration of examination is <strong>"+total_time+"</strong> minutes .</li>" +
				" <li>The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available for you to complete the examination. When the timer reaches zero, the examination will end by itself. You will not be required to end or submit your examination.</li> " +
				"<li><strong>Do not click outside the window.</strong>Test will automatically close if you do so.</li> </ol> </li> </ol> <p><strong><u>Answering a Question : </u></strong></p> <ol> <li value=\"8\">Procedure for answering a multiple choice type question:</li> </ol> <ol style=\"margin-left: 40px; list-style-type: lower-alpha;\"> <li>To select your answer, click on the button of one of the options</li>  <li>To save your answer, you MUST click on the <strong>Save &amp; Next</strong> button</li>  <li>Note that ONLY Questions for which answers are saved after answering will be considered for evaluation.</li> </ol>"+
						"<p><strong><u>Before beginning the exam:</u></strong></p>"+
						"<li>1. Only use Crome browser.</li>" +
						"<li>2. Maximize your browser window before starting the test.</li>" +
						"<li>3. Make sure you have a good internet connection.</li>" +
						"<li>4. Close all other irrelevant tabs of your browser.</li>" +
						"<p><strong><u>During the exam:</u></strong></p>"+
						"<li>1. Do not click outside the window.Test will automatically close if you do so.</li>" +
						"<li>2. Test will close automatically after the time is elapsed.</li>" +
						"<li>3. Save your test using submit button.</li>" +
						"<p><strong><u>Instructions for accessing the Exam:</u></strong></p>"+
						"<li>1. Contact your Admin or Instructor to authorize you for a test.</li>" +
						"<li>2. If you encounter any problems, click the help button at home page.</li>" 
						
				 });
			this.getView().setModel(html_model,"html_model");
			
//			var oFrame = this.getView().byId("html_link");
//			var oFrameContent = oFrame.$()[0];	
//			oFrameContent.setAttribute("src", marks);
		},
	onSelect : function(oEvent){
		var selectedItem  = oEvent.getSource().getSelectedItem();
		if(selectedItem === "idZTMS1--Users" || selectedItem === "idtest--Users")
			{
		app.to("iduser_info");
			}
		else if ( selectedItem === "__item3" || selectedItem === "idtest--Test")
			{
			app.to("idtest");
			}
		else if ( selectedItem === "idZTMS1--Dashboard" || selectedItem === "idtest--Dashboard")
		{
			app.to("idZTMS1");
		}
	},
		onBackPress:function(){
			var that = this;
			that.oRouter.navTo("Main");
		},
		onDecline : function(){
			this.oDialogProceed.close();
		},
		onEditPassword : function(){
			var that = this;
			that.oDialogPassword = that.getView().byId("userPassword");
			if (!that.oDialogPassword) {
				that.oDialogPassword = sap.ui.xmlfragment(that.getView().getId(),"ztms.login");
				that.getView().addDependent(that.oDialogPassword);
			}
			that.oDialogPassword.open();
		},
		onSavePassword: function(){
			var that = this;
			var formData = this.getView().byId("smartForm22").getBindingContext().getObject();
			var oEntity= {};
			oEntity.USER_ID = formData.USER_ID;
			oEntity.USER_NAME = this.getView().byId("id1").getValue();
			oEntity.USER_PASS = this.getView().byId("id2").getValue();
			this.oModel.setHeaders({"X-Requested-With" : "X"});
			this.oModel.update("/UserSet(USER_ID='"+formData.USER_ID+"')",oEntity, {
			success : function() {
				sap.m.MessageToast
						.show("Updated Successfully");
				that.getView().byId("id1").setValue("");
				that.getView().byId("id2").setValue("");
				that.oDialogPassword.close();
			},error:function(){
				sap.m.MessageToast
				.show("Error in Updating Password, Contact Admin");
				that.oDialogPassword.close();
				that.getView().byId("id1").setValue("");
				that.getView().byId("id2").setValue("");
			}
		});
		},
		onCancelPassword : function(){
			this.oDialogPassword.close();
		},
		
		onShowPassword : function(){
			this.getView().byId("id2").setType("Text");
			this.getView().byId("id1").setType("Text");
		}
	});

});
