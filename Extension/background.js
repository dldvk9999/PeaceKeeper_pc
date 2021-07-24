var switches = [];
var changeList = [];
var tabid = 0;
var dest = "I LOVE YOU";
var color = "default";
var innerTextArray = [];
var ws = null;
var Sensitivity = 3;
var c = 0;
var interval;

var websocketCommunication = function(tabId) {
	if(ws == null) {
		try{
			ws = new WebSocket("ws://localhost:9998");
			localStorage["connectionStatus"] = true;
			localStorage["switches"] = [];
		} catch (e) {
			localStorage["connectionStatus"] = false;
		}
	}
	chrome.tabs.executeScript(tabId, {
		code: "document.body.innerText;"
	}, function(resultsArray){
		try {			
			var resultArray = resultsArray[0].split("\n");
		} catch (e) {
			return null;
		}
		if(Array.isArray(innerTextArray) && innerTextArray.length === 0)
			var difference = resultArray
		else
			var difference = resultArray.filter(x => !innerTextArray.includes(x));
		innerTextArray = resultArray;
		
		if(difference.length != 0 && difference[0] != "") {
			// alert(difference);
			try {				
				Sensitivity = localStorage.sensitivity;
			} catch (e) {
				Sensitivity = 3;
			}
			ws.send(JSON.stringify([difference, Sensitivity]));
			ws.onmessage = function (event) {
				if (event.data != "") {
					var src = event.data;
					if (src.indexOf("\"") >= 0) src = src.replace(/\"/gi, "\\\"");
					var scriptEXE = chrome.tabs.executeScript(tabId, {
						code: "var chooseText = function(parent) { 						"+
						"	if(parent.childElementCount == 0) {							"+
						"		if(parent.textContent.indexOf(\""+src+"\") >= 0) {		"+
						"			parent.textContent = \""+dest+"\";					"+
						"		}														"+
						"	} else {													"+
						"		for(var i=0; i<parent.childElementCount; i++) {			"+
						"			chooseText(parent.children[i]);						"+
						"		}														"+
						"	}															"+
						"};																"+
						"var Inner = document.querySelectorAll('div');					"+
						"for(var i=0; i<Inner.length;i++) {								"+
						"	chooseText(Inner[i]);										"+
						"}																"
					});
					
					var pair = new pairToSwitch(src, dest, color);
					switches.push(pair);
					changeList.push(src);
					localStorage["switches"] = changeList;
					document.getElementsByTagName("body")[0].focus();
				}
			};
			ws.onopen = () => ws.send('hello');
		}
	})
	
	class pairToSwitch {
		constructor(src, dest, color) {
			this.src = src;
			this.dest = dest;
			this.color = color;
		}
	}
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(changeInfo.status == 'complete' && tab.status == 'complete' && tab.url != undefined){
		websocketCommunication(tabId);
		innerTextArray = [];
		tabid = tabId;
	}
}); 

chrome.tabs.onReplaced.addListener(function(addedTabId, removedTabId) {
	websocketCommunication(addedTabId);
	tabid = tabId;
}); 

new function() {
    c = 0;
    interval = setInterval(function () {
        if (++c >= 3) {
            c = 0;
            websocketCommunication(tabid);
        }
    }, 1000);
}

chrome.browserAction.onClicked.addListener(function(tab) {
	var status = localStorage.connectionStatus;
	if (status) {
		var res = "These are the switches you have made: \n";
		for(var i=0; i<switches.length ;i++) {
			var strToInsert = "\""+switches[i].src +"\""+" -> " +"\""+switches[i].dest +"\""+"\n";
			res = res.concat(strToInsert);
		}
		alert(res);
	}
});