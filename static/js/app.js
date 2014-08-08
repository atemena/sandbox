require.config({
    baseUrl: '/static/js/',
    paths: {
    	jquery: 'jquery'
    }
});
require([ 'sandbox', "kinetic", "bootstrapCP", "bootstrapS", "jqueryKnob", "p", "recentPins"],
function( sandbox, kinetic, bootstrapCP, bootstrapS, jqueryKnob, p, recentPins){
	

	var canvas = null;
	var font = 'News Cycle';
	var text = 'Preview';
	var background_src = '';
	var currTint = '0';
	var currTemplate = '1';
	var templateConfig = [];
	var fontSelected = new Array();
	fontSelected = [
		{name:'News Cycle', family:'News+Cycle:400,700:latin'},
		{name:'Cinzel Decorative',family:'Cinzel:400,700:latin'},
		{name:'Roboto',family:'Roboto:400,700:latin'},
		{name:'Rosario',family:'Rosario:400,700:latin'},
		{name:'Pathway Gothic One',family:'Pathway+Gothic+One::latin'}];
	canvas = new sandbox("canvasSB", 400, 300);
	canvas.loadFonts("fontSelect", fontSelected);
	//canvas.setBackgroundBorder('black', 4);
	window.canvas = canvas;
	canvas.load(image2);
	//canvas.hideButtons();

	

	//color picker and slider configuration
	$(function() {
		var toRGBAString = function(c){
				return ("rgba("+c.r+","+c.g+","+c.b+","+c.a+")");
		};

		//text and image
		$('#rotation').knob({'change' : function (v) {
			canvas.selectedGroup.rotate(v);
		}});

		//canvas
		var canvasH= $('#height').slider({
			min: 70,
			max: 1000,
			orientation: 'horizontal',
			value: 400
		}).on('slide', function(ev){
			canvas.scale(ev.value, canvas.stage.getHeight());
		}).data('slider');

		var canvasW= $('#width').slider({
			min: 70,
			max: 780,
			orientation: 'horizontal',
			value: 300
		}).on('slide', function(ev){
			canvas.scale(canvas.stage.getWidth(), ev.value);
		}).data('slider');

		$('#bgColor').colorpicker({format:"rgba"}).on('changeColor', function(ev){
		  canvas.setBackgroundColor(ev.color.toRGB());
		});

		//shadows
		var sShift= $('#sShift').slider({
			min: -50,
			max: 50,
			value: 0,
			orientation: 'horizontal'
		}).on('slide', function(ev){
			canvas.shadow({'color':'black', 'offsetX': ev.value, 'offsetY': ev.value})
			}).data('slider'); 

		var sAlpha= $('#sAlpha').slider({
			min: 0,
			max: 100,
			orientation: 'horizontal',
			value: 0
		}).on('slide', function(ev){
			if(ev.value>0)
				canvas.shadow({'color':'black', 'opacity': ev.value/100});
			else
				canvas.shadow({'color':'black', 'opacity': 0});
		}).data('slider'); 

		//shapes
		var shapeH= $('#shapeH').slider({
			min: 10,
			max: 1000,
			orientation: 'horizontal',
		}).on('slide', function(ev){
			canvas.selectedGroup.editShape({'height':ev.value});
		}).data('slider');

		var shapeW= $('#shapeW').slider({
			min: 10,
			max: 780,
			orientation: 'horizontal',
		}).on('slide', function(ev){
			canvas.selectedGroup.editShape({'width':ev.value});
		}).data('slider');


		$('#fillColor').colorpicker({format:"rgba", color:'rgba(0,0,0,1)'}).on('changeColor', function(ev){
		  canvas.selectedGroup.editShape({'fill': toRGBAString(ev.color.toRGB())});
		});
		$('#strokeColor').colorpicker({format:"rgba", color:'rgba(255,255,255,1)'}).on('changeColor', function(ev){
		  canvas.selectedGroup.editShape({'stroke': toRGBAString(ev.color.toRGB())});
		});

		//text
		var fontSize= $('#fontSize').slider({
			min: 2,
			max: 100,
			orientation: 'horizontal',
		}).on('slide', function(ev){
			canvas.selectedGroup.textSize(ev.value);
		}).data('slider');

		$('#textColor').colorpicker({format:"rgba", color:'rgba(255,255,255,0.5)'}).on('changeColor', function(ev){
		  canvas.selectedGroup.textColor(toRGBAString(ev.color.toRGB()));
		});

		
	});

	
	//drag and drop
	var con = canvas.stage.getContainer();        
	con.addEventListener('dragover',function(e){
	    e.preventDefault();
	});
	//insert image to stage
	con.addEventListener('drop',function(e){
		if (window.dragSrcEl) {
	    	recentPins.sendToCanvas(window.dragSrcEl.src, window.dragSrcEl.type);
	    }
	    window.dragSrcEl = null;
	});

	/*$('#preview')[0].addEventListener('dragover',function(e){
	    e.preventDefault();
	});
	$('#preview')[0].addEventListener('drop',function(e){
		if (window.dragSrcEl) {
			if(window.dragSrcEl.type === 'sticker')
	    		canvas.editImage({'url': window.dragSrcEl.src})
	    }
	    window.dragSrcEl = null;
	    e.preventDefault();
	});   */

	function saveAndPin(){
		var popup = window.open(null, null, 'height=500,width=750');
		canvas.download(popup);
	}
	
	$("#addText").click(function() {
		text = $('#textarea-overlay').val();
		font = $('#fontSelect').val();
	    canvas.addText({'text': {'content': text, 'font': font}} );
	});

	$("#fontEdit").change(function(){
		canvas.selectedGroup.textFont($(this).val());
	});

	$("#textEdit").keyup(function(){
		canvas.selectedGroup.textContent( $(this).val());
	});

	$(".align").click(function(){
		canvas.selectedGroup.textAlign($(this).val());
	});

	$(".shadowApplyAll").click(function() {
		var shadowOptions = [
			{'opacity': 0, 'offsetX': 0, 'offsetY': 0},
			{'opacity': .25, 'offsetX': 20, 'offsetY': 20},
			{'opacity': .50, 'offsetX': 20, 'offsetY': 20, 'blur': 3},
			{'opacity': .75, 'offsetX': 20, 'offsetY': 20, 'blur': 3},
		];
		canvas.selectedGroup.shadow(shadowOptions[parseInt($(this).val())]);
	});

	$("#pinLoad").click(function() {
		recentPins.getRecentPins('input-url-1', 'c1', '400x300', 'background');
		recentPins.getRecentPins('input-url-2', 'c2', '150x150', 'sticker');
	});
	$("#ellipse").click(function() {
		if(canvas.selectedGroup){
			canvas.selectedGroup.curve = -1;
			canvas.selectedGroup.color = 'rgba(0,0,0,0.5)';
			canvas.selectedGroup.rect = { 'width' : 'auto', 'height' : 'auto', 'x' : 'auto', 'y' : 'auto'};
			canvas.addShape(canvas.selectedGroup);
		}else{
			canvas.addShape({'curve': -1, 'color':'rgba(0,0,0,0.5', 'rect': {'width': canvas.stage.getWidth(), 'height': canvas.stage.getHeight(), 'x': 0, 'y':0}, 'resizingMask': 18});
		}
	});
	$("#addSubgroup").click(function() {
	    canvas.addSubgroup();
	});
	$("#rectangle").click(function() {
		if(canvas.selectedGroup){
			canvas.selectedGroup.curve = 0;
			canvas.selectedGroup.color = 'rgba(0,0,0,0.5)';
			canvas.selectedGroup.rect = { 'width' : 'auto', 'height' : 'auto', 'x' : 'auto', 'y' : 'auto'};
			canvas.addShape(canvas.selectedGroup);
		}else{
			canvas.addShape({'curve': 0, 'color':'rgba(0,0,0,0.5', 'rect': {'width': canvas.stage.getWidth(), 'height': canvas.stage.getHeight(), 'x': 0, 'y': 0}, 'resizingMask': 18});
		}
	});
	$("#resize").click(function() {
		canvas.resize(1000, 1000);
	});
	$("#moveUp").click(function(){
		canvas.selectedGroup.moveUp();
	})
	$("#moveDown").click(function(){
		canvas.selectedGroup.moveDown();
	})
	$("#vcenter").click(function(){
		canvas.selectedGroup.vcenter();
	})
	$("#hcenter").click(function(){
		canvas.selectedGroup.hcenter();
	})
	$("#delete").click(function(){
		canvas.selectedGroup.delete();
	})

	
})