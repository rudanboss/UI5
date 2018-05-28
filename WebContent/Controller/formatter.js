sap.ui.define([], function () {
	return {
		testName: function (id,name) {
			if(id && name)
				{
					return name+"-"+id;
				}
		},
ukeyChange:function(ukey){
	if(ukey){
		 var set_name1=ukey.split("-");
		 set_name1.shift();
		 var set_name=set_name1.join("-");
		return set_name;
	}
	 
},
setnameChange:function(setname){
	debugger;
},
		
	};
});