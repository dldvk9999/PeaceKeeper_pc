var Sensitivity = 3;

$(document).ready(function(){
	$("input:radio[name=sensitivity]").click(function(){
		Sensitivity = $("input[name=sensitivity]:checked").val();
	});
	var radios = document.getElementsByName("sensitivity");
	var val = localStorage.getItem('sensitivity');
	Sensitivity = val;
	for(var i=0;i<radios.length;i++){
		if(radios[i].value == val){
			radios[i].checked = true;
		}
	}
});

function save_options() {
	localStorage["sensitivity"] = Sensitivity;
	chrome.extension.getBackgroundPage().alert("Options Saved : " + Sensitivity);
}

document.querySelector('#submitButton').addEventListener('click', save_options);