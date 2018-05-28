sap.ui.define([
	"sap/m/MessageBox",
	"jquery.sap.global",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/NumberFormat"
], function(MessageBox, jQuery, Controller, JSONModel, NumberFormat) {
	"use strict"; 

	return Controller.extend("ztms.Controller.TakeTest", {
		onInit: function() {
		
			jQuery('<div/>', {
			    id: 'foo',
			    text: 'Ooops'
			}).appendTo('body');
			
			$('#foo').css({
				position: 'absolute',
		    width: '60px',
		    height: '60px',
		    top:'0',
		    background: '#ff1800',
		    color: 'white',
		    display:'none'
			});
			window.addEventListener("mouseover",function(event){
				if(event.clientX > window.outerHeight)
					{
					$('#foo').css({
				    top:event.clientX,
				    display:'block'
					});
					}
			});
		   /*  window.onbeforeunload = function(evt) {
		            var message = 'Are you sure you want to leave?';
		            if (typeof evt == 'undefined') {
		                evt = window.event;
		            }       
		            if (evt) {
		                evt.returnValue = message;
		            }
		            return message;
		        }*/ 
			this.selected_answer_subj = "None";
			this.selected_answer = 0; 
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getRoute("TakeTest").attachPatternMatched(this._handleRouteMatched, this);
			this.count = 0;
			this.count2 = 0;
			this.obj = {};
			this.items = {};
			var oDataVisible={			
					visible : true,
					invisible : false
			}
			var visibleModel = new sap.ui.model.json.JSONModel(oDataVisible);
			this.getView().setModel(visibleModel,"visibleModel");
			var counter = 0;
		},
		

		_handleRouteMatched : function(evt) {
			var that=this;
			
			
				//Active Login Starts here.
				var user_id;
				var auth;
				var userDetails;
			

				this.oModel = new sap.ui.model.odata.ODataModel("http://dewdfcto021.wdf.sap.corp:1080/sap/opu/odata/sap/ZTMS_SRV",true);
				this.oModel.setDefaultBindingMode("TwoWay");
				this.oModel.setHeaders({"X-Requested-With" : "X"});

//				this.getView().setModel(this.oModel);
				if(localStorage.flag=="true"){
				
				that.oModel.read("/UserSet?$filter=USER_ID eq '"+localStorage.user+"' and USER_PASS eq '"+localStorage.pass+"'", null, null, false, function(oData, oResponse){ 
						 if (oData.results.length == 1 ) {
							 userDetails= oData.results[0];
							 var tests_given=oData.results[0].TESTS_GIVEN.split(",");
							 if(tests_given.includes(localStorage.selected_ukey) == false || oData.results[0].TESTS_GIVEN=="")
								 {
								 that.readQuestions();
								 that.onCreateQues();
//								 that.handleMouseOut();
								 
								 
								 }
							 else{
								 MessageBox.error("You have already given this test. Please wait for results.");
							 }
							 
							 
						 }
						 else{
							 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
								that.oRouter.navTo("Main", true);
								localStorage.clear();
						 }
							});	
				this.userDetails = userDetails;
				}
				 else{
					 if(localStorage.flag==undefined || localStorage.flag=="false"){
					 MessageBox.error("You are not authorized to view this page. Please login & come back again.");
						that.oRouter.navTo("Main", true);
					 }
					 that.oRouter.navTo("Main", true);
				 }
				
				var vbox_buton = new sap.m.VBox();
				var counter = 1;
				var vbox_ques = this.getView().byId("id_ques");
				for(var i =0; i<this.total_quest; i=i+4){
					var hbox = new sap.m.HBox();
					for(var j=i; j< i+4 && j < this.total_quest; j++){
						var button = new sap.m.Button("id"+(j+1),{
							text : j+1,
							press : function (oEvent){
								that.selected_button = oEvent.getSource().getText();
//								that.count = that.selected_button - 1;
								that.onSaveNext();
								that.getView().byId("navCon").to("page"+that.selected_button);
							}
						});
						hbox.addItem(button);
					}
				vbox_ques.addItem(hbox);
				
				};
				sap.ui.getCore().byId("id1").setType("Accept");
				this.countTime();	
				this.onTestTimer();
			
		},
		readQuestions:function(){
			var total_quest;
			var questions = [];
			this.oModel.read("/QuesSet?$filter=UKEY eq '"+localStorage.selected_ukey+"'", null, null, false, function(oData, oResponse){ 
				 if (oData.results.length >= 1) {
					 questions = oData.results;
					 total_quest = oData.results.length;
//					 var t = new sap.ui.model.json.JSONModel();
//					 t.setData(oData);
//					 that.getView().setModel(t,"quest_model");	
				 }
				 else{
					 MessageBox.error("Some error Occurred.Please try again");
				 }
					});
			this.total_quest = total_quest;
			this.questions = questions;
		},
		
/*		handleNav: function(evt) {	
			this.onCreateQues();
			var navCon = this.getView().byId("navCon");
			navCon.to(this.getView().byId("page"+this.count), "fade");
			var nextPage = "page"+this.count;
			this.getView().byId("navCon").to(this.getView().byId(nextPage));
//			var target = evt.getSource().data("target");
//			if (target) {
//				navCon.to(this.getView().byId(target), "fade");
//			} else {
//				navCon.back();
//			}
		},*/
		handleMouseOut:function(){
			//handle mouse out event
			var that=this;
			
			var mytimeout, i;
			var timeleft;
		
			var attempts_left = 3;
			i = 1;
	    	var data = {"attempts":"You have 2 attempts left",
					"text" : "Your window will close in 10 seconds"}
	    	 var t = new sap.ui.model.json.JSONModel();
			 t.setData(data);
			 that.getView().setModel(t, "dialogModel");
			
			$(document).on('mouseenter', function() {
			    if(mytimeout) {  
			    	that.getView().byId("timer_text").setText("Your window will close in 10 seconds");
			        clearInterval(mytimeout);
			        if(that.oDialog){
			        that.oDialog.close();
			        }
			    }
			    
			}).on('mouseleave', function() {
				
				timeleft = 10;
				attempts_left = attempts_left-1;
				if(attempts_left==0)
					{
					window.close();		
					}
				else{
				that.oDialog = that.getView().byId("timer");
				if (!that.oDialog) {
					that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.timer");
					that.getView().addDependent(that.oDialog);
				}

		    	data.attempts = "You have "+attempts_left+" attempts left";
			    mytimeout = setInterval(function() {
			    	data.text = "Your window will close in "+timeleft--+" seconds";
			    	that.getView().getModel("dialogModel").refresh(true);
					  if(timeleft == 0){
					    clearInterval(mytimeout);
					    window.close();
					    
					  }
					  
			    },1000);
			    that.getView().getModel("dialogModel").refresh(true);
				that.oDialog.open();
	 
				}
			});
			
			
		},
		onTestTimer:function(){
			var that = this;
			var date = new Date();
			var deadline = Number(this.total_time);
			var added_date = date.setMinutes ( date.getMinutes() + deadline );
			
			var data = {
					"text" : "<p><em style=\"color:red; font-weight:600;\">Time Left "+deadline+" minutes</em> .</p>"}
	    	 var t = new sap.ui.model.json.JSONModel();
			 t.setData(data);
			 that.getView().setModel(t, "dialogModel2");
			 
		     var mytimeout = setInterval(function() {
		    	 var now = new Date().getTime();
		    	 var t = added_date - now;
		    	 var days = Math.floor(t / (1000 * 60 * 60 * 24));
		    	 var hours = Math.floor((t%(1000 * 60 * 60 * 24))/(1000 * 60 * 60));
		    	 var minutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
		    	 var seconds = Math.floor((t % (1000 * 60)) / 1000);
		    	data.text = "<p><em style=\"color:red; font-weight:600;\">Time Left: "+minutes--+" Minutes "+seconds--+" Seconds</em> .</p><br>";
		    	that.getView().getModel("dialogModel2").refresh(true);
				  if(minutes == 0){
				    clearInterval(mytimeout);
				    that.onSubmitTest();
				    window.close();
				    
				  }
				  
		    },1000);
		    that.getView().getModel("dialogModel2").refresh(true);
		},
		onSubmitTest:function(){
			var that=this;
			var batchChanges = [];
			var oEntity={};
			var oEntity2={};
			var subjective;
			var navId = this.getView().byId("navCon");
			var currentQues = navId.getCurrentPage().getId().replace('page','');
			oEntity2.USER_ID=localStorage.user;
			oEntity2.UKEY=localStorage.selected_ukey;
			oEntity.USER_ID=localStorage.user;
			oEntity.UKEY=localStorage.selected_ukey;
			oEntity.QID=Number(currentQues);
//			if(this.selected_answer_subj=="None"  && this.selected_answer_subj!=undefined){
			if(this.questions[that.total_quest-1].ANS!=""){
					oEntity.ANS=this.selected_answer_subj.toString();
					this.selected_answer_subj = "None";
			}
			else{
				oEntity.A=this.selected_answer.toString();
			}
			
			
			that.items["Question"+oEntity.QID]=oEntity;
//			that.items.push(oEntity);
			this.selected_answer = 0;
			if(Object.values(that.items).length === that.total_quest)
				{
			Object.values(that.items).forEach(function(val){
//				if(val.ANS != "")
				if(val.ANS)
					{
					subjective = "1";
					}
					
				batchChanges.push(that.oModel.createBatchOperation(
						"AnswersSet", "POST",
						val));
			});
			that.oModel.addBatchChangeOperations(batchChanges);
			// submit changes and refresh the table and display
			// message
			that.oModel.submitBatch(function(data) {
				
				if(subjective == "1"){
					that.oModel.create("/ScoreSet",oEntity2,
							{success : function(oData,
										oResponse) {
								},
								error : function() {
									
								}
							})
					that.oDialog = that.getView().byId("subjective");
					if (!that.oDialog) {
						that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.subjective");
						that.getView().addDependent(that.oDialog);
					}
					that.oDialog.open();
					
				}
				else{
					that.oModel.create("/ScoreSet",oEntity2,
							{success : function(oData,
										oResponse) {
								
								
								
								var scoreModel = new sap.ui.model.json.JSONModel({
									HTML : "<em style=\"color:green; font-weight:600;\">You have scored: </em> ",
									TEXT : Number(oData.SCORE)+" marks",
								});
								
								that.getView().setModel(scoreModel,"scoreModel");
								that.oDialog = that.getView().byId("score");
								if (!that.oDialog) {
									that.oDialog = sap.ui.xmlfragment(that.getView().getId(),"ztms.score");
									that.getView().addDependent(that.oDialog);
								}
								that.oDialog.open();
								
									
								},
								error : function() {
									
								}
							});
				}
				that.onTestGiven();
				
			}, function(err) {
				MessageBox.error("Server Error");
				
			});
				}
			else
				{
				MessageBox.error("You need to answer all the questions to submit the test");
				}
			
			
		},
		onTestGiven : function(){
			var tests_given = this.userDetails.TESTS_GIVEN;
			var oEntity = {};
			oEntity.USER_ID = this.userDetails.USER_ID;
//			oEntity.AUTH = this.userDetails.AUTH;
			
			if(tests_given=="")
				{
				oEntity.TESTS_GIVEN = localStorage.selected_ukey;
				this.oModel.update("/UserSet(USER_ID='"+this.userDetails.USER_ID+"')",oEntity, {
					success : function() {
					},error:function(){
						sap.m.MessageToast
						.show("Some Error Occured");
					}
				});
				}
			else{
				tests_given = tests_given+","+localStorage.selected_ukey;
				oEntity.TESTS_GIVEN = tests_given;
				this.oModel.update("/UserSet(USER_ID='"+this.userDetails.USER_ID+"')",oEntity, {
					success : function() {
					},error:function(){
						sap.m.MessageToast
						.show("Some Error Occured");
					}
				});
			}
		},
		countTime:function(){
			var total_time;
			this.oModel.read("/SetSet?$filter=UKEY eq '"+localStorage.selected_ukey+"'", null, null, false, function(oData, oResponse){ 
				 if (oData.results.length == 1) {
					 total_time = oData.results[0].MAX_TIME;
				 }
				 else{
					 MessageBox.error("Some error Occurred.Please try again");
				 }
					});	
			this.total_time=total_time;
		},
		onOk : function(){
			this.oDialog.close();
			window.close();
		},
		onPreviousQues:function(){
		
			if(this.newPage == this.total_quest)
			{
		this.getView().getModel("visibleModel").getData().visible = true;
		this.getView().getModel("visibleModel").getData().invisible = true;

			}
			else if(this.newPage == "1"){
				this.getView().getModel("visibleModel").getData().visible = true;
				this.getView().getModel("visibleModel").getData().invisible = false;
				
			}
			else{
				this.getView().getModel("visibleModel").getData().visible = true;
				this.getView().getModel("visibleModel").getData().invisible = true;
			}
			this.getView().getModel("visibleModel").refresh(true);
			this.getView().byId("navCon").back();

		},
		onCreateQues: function()
		{
			var that=this;
			var vbox = new sap.m.VBox();
			var vbox2 = new sap.m.VBox();
			var hbox = new sap.m.HBox();
			var page = new sap.m.Page({
				id : "page1",
				title : "Question no.1"
			});
			
			var quesLabel = new sap.m.Label({
				text : "Question no.1"
			});
			var ques = new sap.m.Text({
				text : this.questions[0].QNAME
			});
//			var radio = new sap.m.RadioButtonGroup({
//				buttons:[new sap.m.RadioButton({text:this.questions[0].A1}),
//		                 new sap.m.RadioButton({text:this.questions[0].A2}),
//		                 new sap.m.RadioButton({text:this.questions[0].A3}),
//		                 new sap.m.RadioButton({text:this.questions[0].A4})
//		                 ],
//		        select: function (oEvent){
//					that.selected_answer = oEvent.getParameter('selectedIndex');	
//				}
//				
//		          });
			if(this.questions[0].ANS!=""){
				var ques_text = new sap.m.Text({
					text : "Your Answer:"
				});
				var text_box = new sap.m.TextArea({
					value : "",
					growing : true,
					width : "100%",
					placeholder:"Write your anwer here",
					liveChange : function (oEvent){
						that.selected_answer_subj = oEvent.getSource().getValue();	
					}
				});
//				vbox.addItem(quesLabel).addItem(ques).addItem(ques_text).addItem(text_box);
				vbox.addItem(quesLabel).addItem(ques).addItem(text_box);
			}
			else{
				var radio = new sap.m.RadioButtonGroup({
					buttons:[new sap.m.RadioButton({text:this.questions[0].A1}),
			                 new sap.m.RadioButton({text:this.questions[0].A2}),
			                 new sap.m.RadioButton({text:this.questions[0].A3}),
			                 new sap.m.RadioButton({text:this.questions[0].A4})
			                 ],
			        select: function (oEvent){
						that.selected_answer = oEvent.getParameter('selectedIndex');	
					}
					
			          });
				vbox.addItem(quesLabel).addItem(ques).addItem(radio);
			}
			
			page.addContent(vbox);
			this.getView().byId("navCon").addPage(page);
			this.getView().byId("navCon").to(page);
		},
		onSaveNext: function(oEvent){
			this.newPage;
			var arrayVal;
			var that=this;
			var navId = this.getView().byId("navCon");
			var currentQues = navId.getCurrentPage().getId().replace('page','');
//			if(currentQues < this.total_quest)
//				{
			this.newPage = Number(currentQues)+1;

			this.getView().getModel("visibleModel").refresh(true);
			if(oEvent === undefined)
			{
				this.newPage = that.selected_button;
				
			}
			if(this.newPage == this.total_quest)
			{
		this.getView().getModel("visibleModel").getData().visible = false;
		this.getView().getModel("visibleModel").getData().invisible = true;

			}
			else if(this.newPage == "1"){
				this.getView().getModel("visibleModel").getData().visible = true;
				this.getView().getModel("visibleModel").getData().invisible = false;
				
			}
			else{
				this.getView().getModel("visibleModel").getData().visible = true;
				this.getView().getModel("visibleModel").getData().invisible = true;
			}
			this.getView().getModel("visibleModel").refresh(true);
			
			sap.ui.getCore().byId("id"+this.newPage).setType("Accept");
			arrayVal =  Number(this.newPage)-1;
			if(currentQues > 0)
				{
			var oEntity={};
			oEntity.USER_ID=localStorage.user;
			oEntity.UKEY=localStorage.selected_ukey;
			oEntity.QID=Number(currentQues);
//			oEntity.A=this.selected_answer.toString();
//			if(this.selected_answer_subj=="None" && this.selected_answer_subj!=undefined){
				if(this.questions[oEntity.QID-1].ANS!=""){
					oEntity.ANS=this.selected_answer_subj.toString();
					this.selected_answer_subj = "None";
					
				}
				else{
					oEntity.A=this.selected_answer.toString();
				}
			
			
			that.items["Question"+oEntity.QID]=oEntity;
			this.selected_answer = 0;
				}
//			this.count++;
			that.obj["QID"] = currentQues;
			that.obj["A"] = 0;
			
//			if(currentQues = "1")
//			{
//				this.getView().getModel("visibleModel").getData().visible = true;
//				this.getView().getModel("visibleModel").getData().invisible = true;
//			}
			


//copied from here
			if(navId.getPage("page"+this.newPage)== null)
			{
				var vbox = new sap.m.VBox();
				var vbox2 = new sap.m.VBox();
				var hbox = new sap.m.HBox();
				var page = new sap.m.Page({
					id : "page"+this.newPage,
					title : "Question no." + this.newPage
				});
				
				var quesLabel = new sap.m.Label({
					text : "Question no." + this.newPage
				});
				var ques = new sap.m.Text({
					text : this.questions[arrayVal].QNAME
				});
				
				if(this.questions[arrayVal].ANS!=""){
					var text_box = new sap.m.TextArea({
						value : "",
						growing : true,
						width : "100%",
						placeholder:"Write your anwer here",
						liveChange : function (oEvent){
							that.selected_answer_subj = oEvent.getSource().getValue();	
						}
					});
					vbox.addItem(quesLabel).addItem(ques).addItem(text_box);
				}
				else{
					var radio = new sap.m.RadioButtonGroup({
						buttons:[new sap.m.RadioButton({text:this.questions[arrayVal].A1}),
				                 new sap.m.RadioButton({text:this.questions[arrayVal].A2}),
				                 new sap.m.RadioButton({text:this.questions[arrayVal].A3}),
				                 new sap.m.RadioButton({text:this.questions[arrayVal].A4})
				                 ],
				        select: function (oEvent){
							that.selected_answer = oEvent.getParameter('selectedIndex');	
						}
						
				          });
					vbox.addItem(quesLabel).addItem(ques).addItem(radio);
				}
				
				
				
				page.addContent(vbox);
				this.getView().byId("navCon").addPage(page);
				this.getView().byId("navCon").to(page);
					}
			
			else{
				this.getView().byId("navCon").to("page"+this.newPage);
			}
			
			/*var butt = that.getView().byId("id_ques").getItems();
			
			butt.forEach(function(button){
				button.getItems().forEach(function(buttn){
					if(buttn.getText() == newPage)
						{
						 buttn.setType("Accept");
						}
				});
				
			});*/
			
//				}
		},
		onExit:function()
		{
			console.log("ftd");
		}
	});
});
