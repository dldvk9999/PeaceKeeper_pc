var Status = localStorage["connectionStatus"];
if(Status){
	var switches = localStorage["switches"];
	$('#connectionStatus').text("OPENED");
	var res = "These are the switches you have made: \n";
	if(switches.length == 1 && switches != "" && switches != null){
		var strToInsert = "\""+switches+"\" -> \"I LOVE YOU\" in default color\n";
		res = res.concat(strToInsert);
	} else {
		switches = switches.split(',');
		for(var i=0; i<switches.length ;i++) {
			var strToInsert = "\""+switches[i] +"\" -> \"I LOVE YOU\" in default color\n";
			res = res.concat(strToInsert);
		}
	}
	$('#messages').append(res);
}