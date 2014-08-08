function Sandbox(divId, width, height) {
	//must have div with Id downloadLink
	var currStage = new Kinetic.Stage({container: divId, width: width,height: height});
	//layer that holds the background image
	var backgroundLayer = new Kinetic.Layer();
	//layer where the text is added
	var titleLayer = new Kinetic.Layer();
	//layer where all the stickers are added 
	var stickerLayer = new Kinetic.Layer();
	//currsticker is the most recently clicked/added sticker
	var currSticker = null;
	//haven't had to use this yet, but could be used to limit the amount of sticker or something
	var stickerCount = 0;
	//used to access the download link
	var dataUrl = "";
	



	this.setBorder = function(){
		var border = new Kinetic.Rect({
				x: 0, y: 0,
				width: currStage.attrs.width, height: currStage.attrs.height,
				stroke: "black", strokeWidth: 1
			});
		backgroundLayer.add(border);
		currStage.add(backgroundLayer);
		currStage.add(stickerLayer);
	}

	this.addText = function(font, text){
		var complexText = new Kinetic.Text({
			x: currStage.getWidth()/2,
			y: currStage.getHeight()/2,
			text: text,
			fontSize: 32,
			fontFamily: font,
			fill: 'white',
			align: 'center',
			draggable: true
		});
		complexText.on('mouseout', function() {
			document.body.style.cursor = 'auto';
		});
		complexText.on('mouseover', function() {
			document.body.style.cursor = 'move';
		});
		complexText.on('mouseup', function() {
			titleLayer.draw();
			currStage.showSettings("text");
			currSticker = this;
			updatePreview("selected-sticker", currSticker, text, "text");
		});
		complexText.on('dragstart', function() {
			titleLayer.draw();
			currSticker = this;
			updatePreview("selected-sticker", currSticker, text, "text");
		});
		complexText.on('click tap', function(e) {
			if (e.which == 0) {
				currSticker = this;
				updatePreview("selected-sticker", currSticker, text, "text"); //TODO: create a preview for editing text.
				titleLayer.draw();
			}
		});
		complexText.prevAngle = 0;
		titleLayer.removeChildren();
		complexText.offsetX(complexText.width()/2);
		complexText.offsetY(complexText.height()/2);
		titleLayer.add(complexText);
		currStage.add(titleLayer);
	}

	this.showSettings = function(name){
		if (name === "sticker") {
		}else if (name === "text"){
		}
	}

	this.setTint = function(r,g,b,a){
		var tint = new Kinetic.Rect({
					x: 0, y: 0,
					width: currStage.attrs.width, height: currStage.attrs.height,
					fillRed: r, fillGreen: g, fillBlue:b, fillAlpha: a
				});
		backgroundLayer.removeChildren();
		backgroundLayer.add(backgroundImg);
		backgroundLayer.add(tint);
		//change to draw? instead of reading all layers?
		currStage.add(backgroundLayer);
		currStage.add(stickerLayer);
		currStage.add(titleLayer);
	};

	this.setBackground = function(url,r,g,b,a) {
		//var tintPreset = [ ['black', .3], ['black', .8], ['white', .3],['white', .8] ];
		var imageObj = new Image();
		imageObj.crossOrigin = "Anonymous";
		if (url != ''){
			imageObj.onload = function() {
				var backgroundImg = new Kinetic.Image({
					image: imageObj,
					x: 0,
					y: 0,
				});
				var tint = new Kinetic.Rect({
					x: 0, y: 0,
					width: currStage.attrs.width, height: currStage.attrs.height,
					fillRed: r, fillGreen: g, fillBlue:b, fillAlpha: a
				});
				backgroundLayer.on('mousedown', function() {
					titleLayer.draw();
				});
				backgroundLayer.removeChildren();
				backgroundLayer.add(backgroundImg);
				backgroundLayer.add(tint);
				//change to draw? instead of reading all layers?
				currStage.add(backgroundLayer);
				currStage.add(stickerLayer);
				currStage.add(titleLayer);
			};
		}else{
			var tint = new Kinetic.Rect({
					x: 0, y: 0,
					width: currStage.attrs.width, height: currStage.attrs.height,
					stroke: tintPreset[tintStyle][0], strokeWidth: 1, fill: tintPreset[tintStyle][0], opacity: tintPreset[tintStyle][1]
				});
				backgroundLayer.on('mousedown', function() {
					titleLayer.draw();
				});
				backgroundLayer.removeChildren();
				backgroundLayer.add(tint);

				currStage.add(backgroundLayer);
				currStage.add(stickerLayer);
				currStage.add(titleLayer);
		}
		imageObj.src = url;
	};

	this.addSticker = function(url) {
		var imageObj = new Image();
		imageObj.crossOrigin = "Anonymous";
		//function to check  what a string ends with
		if (typeof String.prototype.endsWith != 'function') {
			String.prototype.endsWith = function (str){
				return this.slice(-str.length) == str;
			};
		};
		imageObj.src = url;
		imageObj.onload = function(){
			if(url.endsWith('.svg'))
				//TODO: fix .svg function and add click functions 
				var sticker = drawSvg(imageObj, url);
			else{
				var sticker = createImage(imageObj, titleLayer, currSticker);
				//TODO: add a function that changes currsticker so we can move mouse functions to createImage functino
				sticker.on('mousedown', function() {
					if(currSticker != this){
						currSticker = this;
						currStage.showSettings("sticker");
						updatePreview("selected-sticker",currSticker, imageObj.src, "img");
						titleLayer.draw();
					}
				});
				sticker.on('click tap', function(e) {
					if (e.which == 0) {
						currSticker = this;
						currStage.showSettings("sticker");
						updatePreview("selected-sticker", currSticker, imageObj.src, "img");
						titleLayer.draw();
					}
				});
				sticker.on('mouseout', function() {
					document.body.style.cursor = 'auto';
				});
				sticker.on('mouseover', function() {
					document.body.style.cursor = 'move';
				});
				sticker.on('dragstart', function() {
					currSticker = this
						updatePreview("selected-sticker", currSticker, imageObj.src, "img");
				});
				sticker.offsetX(imageObj.width/4);
				sticker.offsetY(imageObj.height/4);
				sticker.prevAngle = 0
			}
			currSticker = sticker;
			//TODO: move update curr sticker to index?
			updatePreview("selected-sticker", currSticker, imageObj.src, "img");
			stickerCount++;
			stickerLayer.add(sticker);
	 		currStage.add(stickerLayer);
	 		currStage.add(titleLayer);
		};	
	};

	this.clearStage = function() {
		var res=confirm('Clear the whole canvas?');
		var currSB = this;
		if(res == true){
			stickerLayer.removeChildren();
			stickerLayer.draw();
			stickerCount=0;
			var src = document.getElementById("selected-sticker");
			src.innerHTML=""
			currSticker = null
		}
	};
	
	this.removeSticker = function() {
		if(currSticker == null){
			alert("No sticker selected.");
		}else{
			currSticker.remove();
			stickerLayer.draw();
			stickerCount--;
			var src = document.getElementById("selected-sticker");
			src.innerHTML=""
			currSticker = null
		}
	};


	this.moveStickerUpOrDown= function(upOrDown) {
		if(currSticker == null){
			alert("No sticker selected.");
		}else{
			if(upOrDown == 'up'){
				currSticker.moveUp();
			}if(upOrDown == 'down'){
				currSticker.moveDown();
			}
			stickerLayer.draw();
			titleLayer.draw();
		}
	};

	this.center = function(vertOrHoriz) {
		if(currSticker == null){
			alert("No sticker selected.");
		}else{
			if(vertOrHoriz == 'vert' || vertOrHoriz == 'both'){
				var stageHeight = currStage.getHeight();
				currSticker.setY(stageHeight/2);
			}
			if(vertOrHoriz == 'horiz' || vertOrHoriz == 'both'){
				var stageWidth = currStage.getWidth();
				currSticker.setX(stageWidth/2);
			}	
			stickerLayer.draw();
			titleLayer.draw();
		}
	};
	
	//scales in regards to a 150px width
	this.scale = function(scaleBy){
		if(currSticker == null){
			alert("No sticker selected.");
		}else if(scaleBy == ""){
			alert("Value is empty.");
		}
		else{
			currSticker.setScale(parseFloat(scaleBy)*150/currSticker.getWidth());
			stickerLayer.draw();
			titleLayer.draw();
		}
	};

	this.rotate = function(targetAngle){
		if(currSticker == null){
			alert("No sticker selected.");
		}else{ 
			if(targetAngle == ""){
				targetAngle = "0"
			}
			//var angleDiff = (targetAngle*(Math.PI/180))-currSticker.prevAngle;
			currSticker.rotation(parseFloat(targetAngle));
			//currSticker.prevAngle = prevAngle+angleDiff
			stickerLayer.draw();
			titleLayer.draw();
		}
		
	};
	
	//adds a download link to a div with id downloadLink
	this.download = function(popup) {
		this.stage.toDataURL({
			callback: function(dataURL) {
				saveViaAJAX('cross-promote', dataURItoBlob(dataURL), popup);
			}
		});
	};

	this.preset = function(presetNum, overlap, yOverlap, shift, yshift){
		//TODO: Figure out a way to re-do this system??
		var stickers = stickerLayer.getChildren();
		var text = titleLayer.getChildren();
		var overlap = -overlap;
		//var length = (75 * stickers.length) + (overlap*(stickers.length - 1));
		var currX = 200;
		var currY = 100 + yshift;
		var yoverlap = -yOverlap;
		titleLayer.draw();
		/*while (length >= 400){
			overlap -= 1;
			length = (75 * stickers.length) + (overlap*(stickers.length - 1));
		}*/
		if(stickers.length%2 == 0){
				var leftPosX = currX - 37.5 - (overlap/2);
				var rightPosX = leftPosX;
				var leftIndex = stickers.length/2 -1;
				var rightIndex = stickers.length/2;
		}else{
			var leftPosX = currX;
			var rightPosX = currX;
			var leftIndex = Math.floor(stickers.length/2);
			var rightIndex = Math.ceil(stickers.length/2);
		}
		leftPosX += shift;
		rightPosX += shift;
		if(presetNum == 1){
			preset1(stickers, text, overlap, yoverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, 200, currStage.getWidth());

		}
		if(presetNum == 2){
			preset2(stickers, text, overlap, currY, yoverlap, leftIndex, rightIndex, leftPosX, rightPosX, currStage.getWidth());
			
		}
		if(presetNum == 3){
			preset3(stickers, text, overlap, yoverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, currStage.getWidth());
		}
		if(presetNum == 4){
			preset4(stickers, text, overlap, yoverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, currStage.getWidth(), shift, yshift);
		}
		stickerLayer.draw();
		titleLayer.draw();
	}
};


//divId for where the images will be loaded, from the imageArray
function loadAssets(divId, imageArray){
	var src = document.getElementById(divId);
	for(var i=0; i<imageArray.length; i++) {
		var img = document.createElement("img"); 
		var br=document.createElement('br');
		var br2=document.createElement('br');
		img.src = imageArray[i].url;
		img.style.width = "150px";
		img.classList.add(divId + "Option");
		src.appendChild(img);
		src.appendChild(br);
		src.appendChild(br2);
	}
};

//presets for sticker layout
function preset1( stickers, text, overlap, yoverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, currX, stageWidth){
	for (var i = leftIndex, j = rightIndex; i >= 0 || j < stickers.length; i--, j++) {
		if(i>=0){
			stickers[i].setX(leftPosX);
			stickers[i].setY(currY);
		}
		leftPosX -= overlap;
		leftPosX -= 75;
		rightPosX += overlap;
		rightPosX += 75;
		if(i%2 ==1){
			currY += yoverlap;
		}else{
			currY -= yoverlap;
		}
		if(j < stickers.length){
			stickers[j].setX(rightPosX);
			stickers[j].setY(currY);
		}
	}
	text[0].setX(stageWidth/2);
	text[0].setY(110);
}

function preset2(stickers, text, overlap, currY, yOverlap, leftIndex, rightIndex, leftPosX, rightPosX, stageWidth){
	
	for (var i = leftIndex, j = rightIndex; i >= 0 || j < stickers.length; i--, j++) {
		if(i>=0){
			stickers[i].setX(leftPosX);
			stickers[i].setY(currY);
		}
		leftPosX -= overlap;
		leftPosX -= 75;
		rightPosX += overlap;
		rightPosX += 75;
		//find a simpler way to do this.... only subtract from currY after the second sticker
		if(stickers.length%2 != 0){
			currY -= 75 + yOverlap;
		}
		if(j < stickers.length){
			stickers[j].setX(rightPosX);
			stickers[j].setY(currY);
		}
		if(stickers.length%2 == 0){
			currY -= 75 + yOverlap;
		}

	}
	text[0].setX(stageWidth/2);
	text[0].setY(110);
}

function preset3(stickers, text, overlap, yOverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, stageWidth){
	var currYLeft = currY;
	var currYRight = currY;

	for (var i = leftIndex, j = rightIndex; i >= 0 || j < stickers.length; i--, j++) {
			if(i>=0){
				stickers[i].setX(leftPosX);
				stickers[i].setY(currYLeft);
			}
			leftPosX -= overlap;
			leftPosX -= 75;
			rightPosX += overlap;
			rightPosX += 75;
			currYLeft-=75-yOverlap;
			currYRight+=75-yOverlap;
			if(j < stickers.length){
				stickers[j].setX(rightPosX);
				stickers[j].setY(currYRight);
			}
	}
	text[0].setX(stageWidth/2 +90);
	text[0].setY(45);
}

function preset4(stickers, text, overlap, yoverlap, currY, leftIndex, rightIndex, leftPosX, rightPosX, stageWidth, shift, yshift){

	//TODO: redo this one
	var currX = 200
	currY -= yshift
	currY += shift
	if(stickers.length%2 == 0){
		leftPosX = currX - 37.5;
		rightPosX = leftPosX;
		leftIndex = stickers.length/2 -1;
		rightIndex = stickers.length/2;
	}else{
		leftPosX = currX;
		rightPosX = currX;
		leftIndex = Math.floor(stickers.length/2);
		rightIndex = Math.ceil(stickers.length/2);
	}
	leftPosX += yshift;
	rightPosX += yshift;
	for (var i = leftIndex, j = rightIndex; i >= 0 || j < stickers.length; i--, j++) {
			if(i>=0){
				stickers[i].setY(leftPosX);
				stickers[i].setX(currY);
			}
			leftPosX -= yoverlap;
			leftPosX -= 75;
			rightPosX += yoverlap;
			rightPosX += 75;
			if(i%2 ==1){
				currY += overlap;
			}else{
				currY -= overlap;
			}
			if(j < stickers.length){
				stickers[j].setY(rightPosX);
				stickers[j].setX(currY);
			}
		}

	text[0].setX(stageWidth/2);
	text[0].setY(110);
}

//used to add an svg sticker
function drawSvg(imageObj, url){
	//once imageObj required to get width of the picture
	var drawSvg = new Kinetic.Shape ({
		drawFunc: function (canvas) {
			var ctx=canvas.getContext("2d");
			ctx.shadowBlur=4;
			ctx.shadowOffsetY=4.24;
			ctx.shadowOffsetX=4.24;
			ctx.shadowColor= "rgba(0,0,0,0.3)";
			//uses drawSVG from canvg
			ctx.drawSvg (url, 0, 0, imageObj.width, imageObj.height);
			canvas.fillStroke(this);
		},
		x: currStage.getWidth()/2,
		y: currStage.getHeight()/2,
		offset: {x: imageObj.width/2, y: imageObj.height/2 },
		width: imageObj.width/2,
		height: imageObj.height/2,
		draggable: true,
		drawHitFunc: function(canvas) {
				var context = canvas.getContext();
				context.beginPath();
				context.moveTo(0,0);
				context.lineTo(imageObj.width,0);
				context.lineTo(imageObj.width, imageObj.height);
				context.lineTo(0,imageObj.height);
				context.lineTo(0,0);
				context.closePath();
				canvas.fillStroke(this);
		}
	}); 
	drawSvg.on('mouseup', function() {
		currSticker = drawSvg;
		updateCurrSticker(imageObj);
		});
		drawSvg.on('mouseout', function() {
		document.body.style.cursor = 'auto';
	});
	drawSvg.on('mouseover', function() {
		document.body.style.cursor = 'move';
	});
	return drawSvg;
}

//used for jpg sickers
function createImage(imageObj, titleLayer){
	var sticker = new Kinetic.Image({
		image: imageObj,
		x: Math.floor(Math.random() * (325 - 75 + 1)) + 75,
		y: Math.floor(Math.random() * (225 - 75 + 1)) + 75,
		draggable: true,
		shadowColor: 'black',
		shadowBlur: 4,
		shadowOffset: 6,
		shadowOpacity: 0.3,
		width: imageObj.width/2,
		height: imageObj.height/2
	});
	
	return sticker;
}

function updatePreview(container, currSticker, src, imgOrText){
	var container = document.getElementById(container);
	var br = document.createElement('br');
	container.innerHTML = ""
	if (imgOrText == "img"){
		var img = document.createElement("img"); 
		img.src = src;
		img.style.width = "50px";
		container.appendChild(img);
		container.appendChild(br);
		$("#rotation").val(currSticker.rotation())
		$('#rotation').trigger('change');
	}
	else if(imgOrText == "text"){
		var textDiv = document.createElement("div");
		textDiv.innerHTML = src;
		container.appendChild(textDiv)
		container.appendChild(br);
	}
}



