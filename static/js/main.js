WebFontConfig = {
	google: { families: [ 'Libre+Baskerville::latin', 'Bigelow+Rules::latin', 'Cinzel:400,700:latin', 'Roboto+Slab::latin', 'Parisienne::latin', 'Life+Savers::latin', 'Rationale::latin', 'Indie+Flower::latin' ] },
	loading: function() {$("#loading-message").css("display", "inline-block");},
	active: function() {$("#loading-message").css("display", "none"); preloadFonts();},
	inactive: function() {},
	fontloading: function(familyName, fvd) {},
	fontactive: function(familyName, fvd) {},
	fontinactive: function(familyName, fvd) {}
};
(function() {
	var wf = document.createElement('script');
	wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
	  '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
	wf.type = 'text/javascript';
	wf.async = 'false';
	var s = document.getElementsByTagName('script')[0];
	s.parentNode.insertBefore(wf, s);
})();

var main_canvas=document.getElementById("myCanvas");
var background_canvas=document.getElementById("backgroundCanvas");
var tint_canvas=document.getElementById("tintCanvas");
var final_canvas=document.getElementById("endCanvas");
var main_context=main_canvas.getContext("2d");
var tint_context = tint_canvas.getContext("2d");
var background_context=background_canvas.getContext("2d");
var final_context=final_canvas.getContext("2d");
var background=new Image();
background.crossOrigin = "Anonymous";

$("#fontSelect").change(function() {
	addText();
});
$("#textarea-overlay").keyup(function() {
	addText();
});

$(".tint").click(function() {
	$(".tint").removeClass("p-tab-active");
	$(this).addClass("p-tab-active");
	changeTint(this.value);
});
function fontLoading(){
	$("#loading-message").css("display", "inline-block");
}
function fontLoaded(){
	$("#loading-message").css("display", "none");
}
function preloadFonts(){
	main_context.clearRect(0, 0, main_canvas.width, main_canvas.height);
	main_context.fillStyle = "white";
	main_context.textAlign = 'center';
	var fontSelected = new Array();
	fontSelected = ['Libre Baskerville', 'Bigelow Rules', 'Cinzel Decorative','Roboto Slab','Parisienne','Life Savers','Rationale','Indie Flower'];
	for(var i = 0; i < fontSelected.length; i++) {
		main_context.font = "bold 30px '" + fontSelected[i] + "'";
		main_context.fillText('Loading...', background_canvas.width/2, background_canvas.height/2);
	}
	main_context.clearRect(0, 0, main_canvas.width, main_canvas.height);
}
function addText(){
	main_context.clearRect(0, 0, main_canvas.width, main_canvas.height);
	var text = document.getElementById('textarea-overlay').value;
	var textArr=text.split("\n");
	var numberOfLines = textArr.length;
	var fontSelected = fontSelect.options[fontSelect.selectedIndex].value;
	main_context.fillStyle = "white";
	main_context.textAlign = 'center';
	if(numberOfLines == 1){
			textArr[0] = textArr[0].slice(0,12);
			main_context.font = "bold 30px '" + fontSelected + "'";
			main_context.fillText(textArr[0], background_canvas.width/2, background_canvas.height/2);
		}
		else if(numberOfLines == 2){
			textArr[0] = textArr[0].slice(0,12);
			textArr[1] = textArr[1].slice(0,12);
			main_context.font = "bold 26px '" + fontSelected + "'";
			main_context.fillText(textArr[0], background_canvas.width/2, background_canvas.height/4 + 25);
			main_context.fillText(textArr[1], background_canvas.width/2, 3*background_canvas.height/4 - 25);

		}
		else if(numberOfLines == 3){
			textArr[0] = textArr[0].slice(0,12);
			textArr[1] = textArr[1].slice(0,12);
			textArr[2] = textArr[2].slice(0,12);
			main_context.font = "bold 24px '" + fontSelected + "'";
			main_context.fillText(textArr[0], background_canvas.width/2, background_canvas.height/4);
			main_context.fillText(textArr[1], background_canvas.width/2, background_canvas.height/2);
			main_context.fillText(textArr[2], background_canvas.width/2, 3*background_canvas.height/4);

		}
}
function sendToCanvas(clicked_src, type) {
	background.src = clicked_src;
	background.onload = function(){
		background_context.clearRect(0, 0, background_canvas.width, background_canvas.height);
		width = background_canvas.width;
		height =  this.height * (background_canvas.width/this.width);
		background_context.drawImage(background,((background_canvas.width/2)-(width/2)),((background_canvas.height/2)-(height/2)), width, height);
		if($(".tint.p-tab-active")[0].value == 'auto')
			changeTint('auto');
	}
}

function changeTint(intensity){
	var red = 0;
	var green = 0;
	var blue = 0;
	if(intensity == 'auto'){
		var domColor = findDomColor(background_context, tint_canvas.width, tint_canvas.height);
		red=domColor.r;
		green=domColor.g;
		blue=domColor.b;
		intensity='.5';
	}
	tint_context.clearRect(0, 0, background_canvas.width, background_canvas.height);
	tint_context.beginPath();
 	tint_context.rect(0, 0, 220, 145);
 	tint_context.fillStyle = 'rgba('+ red +',' + green + ',' + blue + ','+ intensity+')';
 	tint_context.fill();
}


function saveToFinalCanvasAndPin(){
	final_context.drawImage(background_canvas, 0, 0);
	final_context.drawImage(tint_canvas, 0, 0);
	final_context.drawImage(main_canvas, 0, 0);
	var popup = window.open(null, null, 'height=500,width=750');
	saveViaAJAX('board-cover', dataURItoBlob(final_canvas.toDataURL()), popup);
}

