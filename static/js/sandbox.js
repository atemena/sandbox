// sandbox.js - creates a Kinetic stage for allowing the user to manipulate backgrounds, stickers, and text
(function(){
	"use strict";
	var Img = function(){
		this.ko;
		this.imageId;
		this.url;
		this.tint = 'none';
		this.mode = 'scaleAspectFill';
		this.defaultSize;
		//?this.scale;

		this.copyValues = function(img){
			_.extend(this, img);
		};

		this.kineticToImg = function(){
			this.url = this.ko.getImage().src;
		};

		this.deleteSelf = function(){
			this.ko.destroy();
			delete this.imageId;
			delete this.url;
			this.tint = 'none';
			this.mode = 'scaleAspectFit';
		};

		this.setPreviewImage = function(width, height){
			this.url = 'http://placehold.it/'+width+'x'+height;
			return this.url;
		}
	};

	var Txt = function(){
		this.ko;
		this.content = 'preview';
		this.color = 'rgba(0,0,0,1)';
		this.size = 32;
		this.font = 'News Cycle';
		this.justification = 'center';
		this.style;

		this.copyValues = function(txt){
			var before;
			_.extend(this, txt);
			var after;
		};

		this.kineticToTxt = function(){
			this.content = this.ko.getText();
			this.color = this.ko.fill();
			this.size = this.ko.fontSize();
			this.font = this.ko.fontFamily();
			this.justification = this.ko.align();
			this.style = this.ko.fontStyle();
		};

		this.deleteSelf = function(){
			this.ko.destroy();
			this.content = 'preview';
			this.color = 'rgba(0,0,0,1)';
			this.size = 32;
			this.font = 'News Cycle';
			this.justification = 'center';
		}
	};

	var Group = function(group){
		this.rect = {'x':0, 'y':0,'width': 0, 'height': 0};
		this.stroke = {'color': '#00000000', 'width':0, 'alpha': 0};
		this.color='#00000000';
		this.gradient = {'colors':[], 'direction':'none', 'colorStops':[], 'startX':0, 'startY':0, 'endX':0, 'endY':0};
		this.padding = 0;
		this.curve = 0;
		this.alpha = 0;
		this.rotation = 0;
		this.resizingMask = 0;
		this.shadow = {'horizontalOffset': 0, 'verticalOffset': 0, 'blur': 0, 'color': 'rgba(0,0,0,1)'};
		this.image = new Img();
		this.text = new Txt();
		this.subgroups = [];
		this.name;

		//temp variables
		this.ko;
		this.shapeKO;
		this.parent;
		this.minimumSize = {'width': 0, 'height':0};
		this.margins = {'left': 0, 'right': 0, 'top': 0, 'bottom': 0};

		this.follow = function(){
			if(canvas.mouseDown){
				//canvas.mouseOffset.x
				if(this.parent !== 'root'){
					console.log(canvas.mousePos.x, canvas.mousePos.y);
					this.ko.setX(canvas.mousePos.x - canvas.mouseOffset.x ); //- this.ko.getX()
					this.ko.setY(canvas.mousePos.y - canvas.mouseOffset.y); // - this.ko.getY()
					canvas.mainLayer.draw();
				}
				//this.follow(mouseOffset);
			}
		}

		//copys values from another group object
		this.copyValues = function(group){
			//shadow , rect , stroke, gradient-start and end point image and text
			_.extend(this.rect, group.rect);
			_.extend(this.shadow, group.shadow);
			_.extend(this.gradient, group.gradient);
			console.log(this.gradient);
			this.image.copyValues(group.image);
			this.text.copyValues(group.text);
			_.map(_.pairs(group), function(pair){
				var key = pair[0];
				var val = pair[1];
				if(typeof val !== 'object' && key !== 'subgroups'){
					this[key] = val;
				}
			}, this);
		};
		
		this.setName = function(name){
			if(typeof name === 'string')
				this.name = name;
		};

		this.setPadding = function(padding){
			if(padding >= 0){
				this.padding = padding;
				this.resizeShape();
			}
		};

		this.setResizingMask = function(mask){
			if( mask >= 0 && mask < 64)
				this.resizingMask = mask;
		};

		this.setImageMode = function(imageMode){
			if (imageMode === 'center' || imageMode === 'scaleToFill' || imageMode === 'scaleAspectFit') // support for scaleAspectFill coming soon
				this.image.mode = imageMode;
			//resizeMainNode
		}

		//updates values of group to match the kinetic object
		this.kineticToGroup = function(){
			this.updateRect();
			if(this.hasOwnProperty('shapeKO')){
				this.color = this.shapeKO.fill();
				this.rotation = this.shapeKO.rotation();
				this.stroke = {'color':this.shapeKO.stroke(), 'width':this.shapeKO.strokeWidth(), 'stroke': this.shapeKO.strokeAlpha()};
				this.alpha = this.shapeKO.opacity();
				this.shadow = {'horizontalOffset': this.shapeKO.shadowOffsetX(), 'verticalOffset': this.shapeKO.shadowOffsetY(), 'blur': this.shapeKO.shadowBlur(), 'color': this.shapeKO.shadowColor() };	
				var colors = [];
				var stops = [];
				if(this.shapeKO.fillPriority() !== 'color'){
					var colorStops = this.shapeKO.fillLinearGradientColorStops();
					for(var i = 0; i < this.shapeKO.fillLinearGradientColorStops().length; i++){
						if (i%2 == 1)
					 		colors.push(colorStops[i]);
					 	else
					 		stops.push(colorStops[i]);
					}
					this.gradient.colors = colors; 
					this.gradient.colorStops = stops; 
					if(this.shapeKO.fillPriority() === 'linear'){
						this.gradient.startX = this.shapeKO.fillLinearGradientStartPoint().x;
						this.gradient.startY = this.shapeKO.fillLinearGradientStartPoint().y;
						this.gradient.endX = this.shapeKO.fillLinearGradientEndPoint().x;
						this.gradient.endY = this.shapeKO.fillLinearGradientEndPoint().y;
					}else if(this.shapeKO.fillPriority() === 'radial'){
						this.gradient.startX = this.shapeKO.getWidth()/2;
						this.gradient.startY = this.shapeKO.getHeight()/2;
						this.gradient.endX = this.shapeKO.getWidth();
						this.gradient.endY = this.shapeKO.getHeight();
					}
				}
			}
			if(this.getMainNode()){
				if(this.getMainNode().getClassName() === 'Image')
					this.image.kineticToImg();
				else if (this.getMainNode().getClassName() === 'Text')
					this.text.kineticToTxt();
			}
		};

		this.groupToKinetic = function(){
			this.shapeKO.setWidth(this.rect.width);
			this.shapeKO.setHeight(this.rect.height);
			this.shapeKO.setFill(this.color);
			this.rotate(this.rotation);
			this.shapeKO.stroke(this.stroke.color)
			this.shapeKO.strokeWidth(this.stroke.width);
			this.shapeKO.strokeAlpha(this.stroke.alpha);
			this.shapeKO.opacity(this.alpha);
			this.shapeKO.shadowColor(this.shadow.color); 
			this.shapeKO.shadowBlur(this.shadow.blur); 
			this.shapeKO.shadowOffset({'x': this.shadow.horizontalOffset, 'y': this.shadow.verticalOffset});
		};


		this.groupToConfig = function(){

			var config = { 
				'x': 'auto',
				'y': 'auto',
				'width': 'auto',
				'height': 'auto',
				'curve': 0,
				'fill': '#000000ff',
				'stroke': '#ffffffff',
				'strokeWidth': 1,
				'strokeAlpha': 1,
				'padding': 30,
				'resizingMask': 0,
				'opacity': 1
			};
			_.map(_.pairs(this), function(pair){
				var key = pair[0];
				var val = pair[1];
				if(typeof val !== 'object' && key !== 'subgroups' && typeof val !== 'function' && typeof val !== 'undefined'){
					if(key === 'color')
						key = 'fill';
					if(key === 'alpha')
						key = 'opacity'
					config[key] = val;
				}
			});
			
			if(this.hasOwnProperty('stroke')){
					config.stroke = this.stroke.color || config.stroke;
					config.strokeWidth = this.stroke.width || config.strokeWidth;
					config.strokeAlpha = this.stroke.alpha || config.strokeAlpha;
			}

			if(this.hasOwnProperty('rect')){
					config.width = this.rect.width || config.width;
					if(this.rect.width != 'auto') 
						config.x = this.rect.width/2;
					config.height = this.rect.height || config.height;
					if(this.rect.height != 'auto') 
						config.y = this.rect.height/2;
			}

			if(this.hasOwnProperty('shadow')){
					config.shadowOffsetX = this.shadow.horizontalOffsetX || 0;
					config.shadowOffsetY = this.shadow.verticalOffsetY || 0;
					config.shadowBlur = this.shadow.blur || 0;
					config.shadowColor = this.shadow.color || "rgba(0,0,0,0)";
			}

			if(config.width === 'auto' || config.height === 'auto'){
				if(this.getMainNode() ){
					config.width = this.getMainNode().getWidth() + 2*this.padding;
					config.height = this.getMainNode().getHeight();
				}else{
					config.width = Math.floor(Math.random() * ((canvas.stage.getWidth() * .75) - (canvas.stage.getWidth() * .1)) + (canvas.stage.getWidth() * .1));
					config.height = Math.floor(Math.random() * ((canvas.stage.getHeight() * .75) - (canvas.stage.getHeight() * .1)) + (canvas.stage.getHeight() * .1));
				}
			}

			return config;
		}


		this.updateRect = function(){
			this.rect.x = this.ko.x();
			this.rect.y = this.ko.y();
			if (this.hasOwnProperty('shapeKO')){
				this.rect.width = this.shapeKO.getWidth();
			}else if (this.getMainNode()){
				this.rect.width = this.getMainNode().getWidth();
			}

			if (this.hasOwnProperty('shapeKO')){
				this.rect.height = this.shapeKO.getHeight();
			}else if (this.getMainNode()){
				this.rect.height = this.getMainNode().getHeight();
			}
		};

		this.updateMargins = function(){
			this.margins.left = this.shapeKO.getAbsolutePosition().x - this.shapeKO.getWidth()/2;
			this.margins.top = this.shapeKO.getAbsolutePosition().y - this.shapeKO.getHeight()/2;
			this.margins.right = canvas.stage.getWidth()-(this.shapeKO.getAbsolutePosition().x + this.shapeKO.getWidth()/2);
			this.margins.bottom = canvas.stage.getHeight()-(this.shapeKO.getAbsolutePosition().y + this.shapeKO.getHeight()/2);
		};

		this.shapeHeight = function(change){
			this.rect.height = change;
			this.editShape();
		}
		this.shapeWidth = function(change){
			this.rect.width = change;
			this.editShape();
		}
		this.shapeFill = function(change){
			this.color = change;
			this.shapeKO.fillPriority('color');
			this.editShape();
		}
		this.shapeStroke = function(change){
			this.stroke.color = change;
			this.editShape();
		}


		this.textColor = function(color){
			if(this.text.ko){
				this.text.color = color;
				this.text.ko.fill(color);
				canvas.mainLayer.batchDraw();
			}
		};
		this.textFont = function(font){
			if(this.text.ko){
				this.text.ko.fontFamily(font);
				this.text.font = font;
				this.text.ko.setOffsetX(this.text.ko.getWidth()/2);
				this.text.ko.setOffsetY(this.text.ko.getHeight()/2);
				this.resizeShape();
				canvas.mainLayer.batchDraw();
			}
		};
		this.textContent = function(text){
			if(this.text.ko){
				this.text.ko.text(text);
				this.text.content = text;
				this.text.ko.setOffsetX(this.text.ko.getWidth()/2);
				this.text.ko.setOffsetY(this.text.ko.getHeight()/2);
				this.resizeShape();
				canvas.mainLayer.batchDraw();
			}
		};
		this.textAlign = function(align){
			if(this.text.ko){
				this.text.ko.align(align);
				this.text.ko.setOffsetX(this.text.ko.getWidth()/2);
				this.text.ko.setOffsetY(this.text.ko.getHeight()/2);
				this.text.justification = align;
				canvas.mainLayer.batchDraw();
			}
		};
		this.textSize = function(size){
			if(this.text.ko){
				this.text.ko.fontSize(size);
				this.text.size = size;
				this.text.ko.setOffsetX(this.text.ko.getWidth()/2);
				this.text.ko.setOffsetY(this.text.ko.getHeight()/2);
				this.resizeShape();
				canvas.mainLayer.batchDraw();
			}
		};

		this.resizeShape = function(){
			if(canvas.autoSize == true && this.hasOwnProperty('shapeKO') && this.getMainNode()){
				this.rect.width = this.getMainNode().getWidth();
				this.rect.height = this.getMainNode().getHeight();
				this.editShape();
			}
		};

		this.deleteShape = function(){
			if(this.hasOwnProperty('shapeKO')){
				this.shapeKO.destroy();
				this.rect = {'x':0, 'y':0,'width': 0, 'height': 0};
				this.stroke = {'color': '#00000000', 'width':0, 'alpha': 0};
				this.color='#00000000';
				this.gradient = {'colors':[], 'direction':'none', 'colorStops':[], 'startX':0, 'startY':0, 'endX':0, 'endY':0};
				this.padding = 0;
				this.curve = 0;
				this.alpha = 0;
				this.rotation = 0;
				this.resizingMask = 0;
				this.shadow = {'horizontalOffset': 0, 'verticalOffset': 0, 'blur': 0, 'color': 'rgba(0,0,0,1)'};

			}
		}

		this.shapeGradient = function(gradient){
			gradient = gradient || {};
			console.log('gradient');
			if(this.hasOwnProperty('shapeKO')){
				_.extend(this, gradient);
				var direction = this.gradient.direction;
				var startPointX = this.gradient.startX;
				var startPointY = this.gradient.startY;
				var endPointX = this.gradient.endX;
				var endPointY = this.gradient.endY;
				var colors = this.gradient.colors;
				var stops = this.gradient.colorStops;
				var colorStops = []
				for(var i = 0; i < colors.length && i < stops.length; i++){
					colorStops.push(stops[i]);
					colorStops.push(colors[i]);
				}

				var startAndEndPoints = {
					'linear-horizontal' : [0, this.shapeKO.getHeight()/2, this.shapeKO.getWidth(), this.shapeKO.getHeight()/2], //linear horizontal rect
					'linear-vertical' : [this.shapeKO.getWidth()/2, 0, this.shapeKO.getWidth()/2, this.shapeKO.getHeight()],  //linear vertical rect
					'linear-horizontal-circle' : [-this.shapeKO.getWidth()/2, 0, this.shapeKO.getWidth()/2, 0], //linear horizontal ellipse
					'linear-vertical-circle' : [0, -this.shapeKO.getHeight()/2, 0, this.shapeKO.getHeight()/2], //linear vertical ellipse
					'radial' : [this.shapeKO.getWidth()/2, this.shapeKO.getHeight()/2, this.shapeKO.getWidth(), this.shapeKO.getHeight()] //radial
				};
				
				if(!gradient.hasOwnProperty('startX') || !gradient.hasOwnProperty('startY') || !gradient.hasOwnProperty('endX') || !gradient.hasOwnProperty('endY')){
					var gradientType = direction;
					if(this.curve === -1 && gradientType != 'radial')
						gradientType = gradientType + "-circle";
					startPointX = startAndEndPoints[gradientType][0];
					startPointY = startAndEndPoints[gradientType][1];
					endPointX = startAndEndPoints[gradientType][2];
					endPointY = startAndEndPoints[gradientType][3];
				}
				if(direction === 'linear-vertical' || direction === 'linear-horizontal'){
					this.shapeKO.fillLinearGradientStartPoint({'x': startPointX, 'y':startPointY});
					this.shapeKO.fillLinearGradientEndPoint({'x': endPointX, 'y': endPointY});
					this.shapeKO.fillLinearGradientColorStops(colorStops);
					this.shapeKO.fillPriority('linear-gradient');
				}else if (direction === 'radial') {
					var rad = Math.sqrt((endPointX-startPointX)*(endPointX-startPointX) + (endPointY-startPointY)*(endPointY-startPointY));
					this.shapeKO.fillRadialGradientStartRadius(3);
					this.shapeKO.fillRadialGradientEndRadius(rad);
					if(this.curve >= 0){
						this.shapeKO.fillRadialGradientStartPoint({'x':this.shapeKO.width/2, 'y': this.shapeKO.height/2});
						this.shapeKO.fillRadialGradientEndPoint({'x': this.shapeKO.width/2, 'y':this.shapeKO.height/2});
					}
					this.shapeKO.fillRadialGradientColorStops(colorStops);
					this.shapeKO.fillPriority('radial-gradient');
				}
		
			}
			canvas.mainLayer.batchDraw();
		};

		this.shapeFill = function(color){
			var fill = this.color;
			if(color)
				fill = color;
			if(typeof color === 'string'){
				this.color = fill;
				this.shapeKO.fill(fill);
				this.shapeKO.fillPriority('color');
				canvas.mainLayer.batchDraw();
			}
		};

		this.shadowEdit = function(s){
			var node = this.getMainNode();
			if(this.hasOwnProperty('shapeKO')){
				if(node){
					node.shadowOpacity(0);
					node.shadowOffset({'x':0, 'y':0});
				}
				node = this.shapeKO;	
			}
			if(node){
				if(s.hasOwnProperty('color'))
					node.shadowColor(s.color);
				if(s.hasOwnProperty('blur'))
					node.shadowBlur(s.blur);
				if(s.hasOwnProperty('horizontalOffsetX'))
					node.shadowOffsetX(s.horizontalOffsetX);
				if(s.hasOwnProperty('verticalOffsetY'))
					node.shadowOffsetY(s.verticalOffsetY);
				if(s.hasOwnProperty('opacity'))
					node.shadowOpacity(s.opacity);
				this.shadow = {'horizontalOffset': node.shadowOffsetX(), 'verticalOffset': node.shadowOffsetY(), 'blur': node.shadowBlur(), 'color': node.shadowColor()};
			}
			canvas.mainLayer.batchDraw();
		};

		this.editShape=function(){
			//change to be able to create a new object as well
			var newShape;
			var self = this;

			var config = this.groupToConfig();
			
			var fillPriority = 'color';
			if(this.gradient.colors.length>0)
				fillPriority = 'gradient';
			if(this.hasOwnProperty('shapeKO'))
				fillPriority = this.shapeKO.getFillPriority();
			if(this.hasOwnProperty('shapeKO')){
				this.shapeKO.destroy();
			}

			//this.shapeKO.fillPriority(); //Todo check for gradient fill?
			
			if (config.curve>=0){
				newShape = new Kinetic.Shape(canvas._extendConfig({
					sceneFunc: function(context){
						context.beginPath();
						context.moveTo(config.curve, 0);
						context.lineTo(config.width-config.curve, 0);
						context.quadraticCurveTo(config.width, 0, config.width, config.curve);
						context.lineTo(config.width, config.height-config.curve);
						context.quadraticCurveTo(config.width, config.height, config.width-config.curve, config.height);
						context.lineTo(config.curve, config.height);
						context.quadraticCurveTo(0, config.height, 0, config.height-config.curve);
						context.lineTo(0, config.curve);
						context.quadraticCurveTo(0, 0, config.curve,0);
						context.fillStrokeShape(this); //for fill and stroke
					},
					x: 0,
					y: 0,
					draggable: false
				}, config));
				newShape.setOffsetX(newShape.getWidth()/2);
				newShape.setOffsetY(newShape.getHeight()/2);
			}else if (config.curve == -1){
				newShape = new Kinetic.Ellipse(canvas._extendConfig({
					radius: {x: config.width/2, y:config.height/2},
					x: 0,
					y: 0,
					draggable:false								
				}, config));
			}
			this.ko.add(newShape);
			this.shapeKO = newShape;
			this.shapeKO._useBufferCanvas = function () {
				return false;
			};
			if(this.parent === 'root'){
				this.shapeKO.setX(canvas.stage.getWidth()/2);
				this.shapeKO.setY(canvas.stage.getHeight()/2);
			}else{
				if(!this.getMainNode() && config.x === 'auto' && config.y === 'auto'){
					canvas.randomPos(newShape);
				}else if(config.x === 'auto' && config.y === 'auto'){
					this.shapeKO.setX(this.getMainNode().getWidth()/2);
					this.shapeKO.setY(this.getMainNode().getHeight()/2);
				}
			}
			if(fillPriority === 'color'){
				this.shapeFill(config.fill);
			}else if(fillPriority === 'gradient' || fillPriority === 'linear-gradient' || fillPriority === 'radial-gradient' ){
				this.shapeGradient(config.gradient);
			}
			this.shapeKO.moveToBottom();
			if(this.getMainNode())
				this.scaleMainNode();
			if(this.getMainNode()){
				var node = this.getMainNode();
				if(node.hasShadow() && !shape.hasShadow()){
					newShape.shadowOpacity(node.shadowOpacity());
					newShape.shadowOffsetX(node.shadowOffsetX());
					newShape.shadowOffsetY(node.shadowOffsetY());
					newShape.shadowBlur(node.shadowBlur());
					newShape.shadowColor(node.shadowColor());
				}
				node.shadowOpacity(0);
			}
			this.rect.width = config.width;
			this.rect.height = config.height;
			console.log(config.width, config.height);
			this.color = config.fill;
			this.stroke.color = config.stroke;
			this.stroke.width = config.strokeWidth;
			this.stroke.alpha = config.strokeAlpha;
			this.curve = config.curve;
			this.shadow = {'horizontalOffset': config.shadowOffsetX, 
							'verticalOffset': config.shadowOffsetY, 
							'blur': config.shadowBlur, 
							'color': config.shadowColor
							}; 

			this.kineticToGroup();
			this.updateMargins();
			canvas.relayer(this);
			canvas.mainLayer.batchDraw();
			canvas.subPixelRender();
		};

		this.onImageLoad = function(args) {
			var newImage = args[0];
			var config = args[1];
			var url = newImage.src;
			var imageKO;
			if(url.slice(-4) === '.svg' || url.substr(0, 26) === 'data:image/svg+xml;base64,') {
				if(url.substr(0, 26) === 'data:image/svg+xml;base64,')
					url = atob(url.slice(26));
				// The image is only required to get width/height of the picture
				imageKO = new Kinetic.Shape(canvas._extendConfig({
					drawFunc: function (context) {
						// Use the specific context, not the global one which doesn't have the drawSvg function
						context = context._context;
						context.shadowBlur = 4;
						context.shadowOffsetY = 6;
						context.shadowOffsetX = 6;
						context.shadowColor = "rgba(0,0,0,0.3)";
						context.drawSvg(url, 0, 0, newImage.width, newImage.height);
					},
					x: Math.floor(Math.random() * (325 - 75 + 1)) + 75,
					y: Math.floor(Math.random() * (225 - 75 + 1)) + 75,
					offset: {x: newImage.width/2, y: newImage.height/2 },
					width: newImage.width,
					height: newImage.height,
					draggable: true,
					drawHitFunc: function(context) {
						context.beginPath();
						context.moveTo(0, 0);
						context.lineTo(newImage.width, 0);
						context.lineTo(newImage.width, newImage.height);
						context.lineTo(0, newImage.height);
						context.lineTo(0, 0);
						context.closePath();
						context.fillStrokeShape(this);
					}
				}, config)); 

			}else{
				imageKO = new Kinetic.Image(canvas._extendConfig({
					image: newImage,
					x: 0,
					y: 0,
					draggable: false,
				}, config));
				
				imageKO.offsetX(newImage.width/2);
				imageKO.offsetY(newImage.height/2);

			}

			this.ko.add(imageKO);
			if(this.parent === 'root'){
				imageKO.setX(canvas.stage.getWidth()/2);
				imageKO.setY(canvas.stage.getHeight()/2);
			}else{
				if(!this.hasOwnProperty('shapeKO') && config.x === 'auto' && config.y === 'auto'){
					config = canvas.randomPos(imageKO);
				}else if(config.x === 'auto' && config.y === 'auto'){
					imageKO.setX(this.shapeKO.getWidth()/2);
					imageKO.setY(this.shapeKO.getHeight()/2);
				}
			}
			
			this.updateRect();
			if(this.hasOwnProperty('shapeKO'))
				imageKO.shadowOpacity(0);
			this.image.ko = imageKO;
			this.kineticToGroup();
			canvas.relayer(this);
			canvas.mainLayer.batchDraw();
			canvas.subPixelRender();
			//this.resizeShape();
		}

		this.editImage = function(url){
			if(!this.image.hasOwnProperty('ko')){
				var self = this;
				var newImage = new Image();
				var config = {};
				config.x = this.rect.width/2 || 'auto';
				config.y = this.rect.height/2 || 'auto';
				url = url || this.image.url;

				if(typeof url !== 'string')
					url = url.target.src;
				newImage.onload = this.onImageLoad.bind(self, [newImage, config]);
				if(url.substr(0, 5) !== 'data:')
					newImage.crossOrigin = "Anonymous";
				newImage.src = url;
			}else{
				var width = 500;
				var height = 500;
				if (this.hasOwnProperty('shapeKO')){
					width = this.rect.width;
					height = this.rect.height; //TODO: Change to image height? and save image height?
				}
				var image = new Image();
				if(url.substr(0, 5) !== 'data:')
					image.crossOrigin = "Anonymous";
				image.src = url || this.image.setPreviewImage(width, height);
				this.image.ko.setImage(image);
				canvas.mainLayer.batchDraw();
				//this.resizeShape();
			} 
		};

		this.editText = function(){
			var self = this;
			var config = {};
			
			var syntaxSwitch = {'content': 'text', 'color': 'fill', 'size': 'fontSize', 'font' : 'fontFamily', 'justification': 'align', 'style': 'style' };
			_.map(_.pairs(this.text), function(pair){
				var key = pair[0];
				var val = pair[1];
				if(typeof val !== 'object' && key !== 'subgroups'){
					config[syntaxSwitch[key]] = val;
				}
			});
			config.x = this.rect.width/2 || 'auto';
			config.y = this.rect.height/2 || 'auto';
			config.shadowOffsetX = this.shadow.horizontalOffsetX || 0;
			config.shadowOffsetY = this.shadow.verticalOffsetY || 0;
			config.shadowBlur = this.shadow.blur || 0;
			config.shadowColor = this.shadow.color || 0;

			var textKO = new Kinetic.Text(canvas._extendConfig({
				x: 0,
				y: 0,
				textBaseline: 'middle',
				draggable: false
			}, config));

			this.ko.add(textKO);
			textKO.setOffsetX(textKO.getWidth()/2);
			textKO.setOffsetY(textKO.getHeight()/2);
			if(this.parent === 'root'){
				textKO.setX(canvas.stage.getWidth()/2);
				textKO.setY(canvas.stage.getHeight()/2);
			}else{
				if(!this.hasOwnProperty('shapeKO') && config.x === 'auto' && config.y === 'auto'){
					canvas.randomPos(textKO);
				}else if(config.x === 'auto' && config.y === 'auto'){
					textKO.setX(this.selectedGroup.shapeKO.getWidth()/2);
					textKO.setY(this.selectedGroup.shapeKO.getHeight()/2);
				}
			}
			if(this.hasOwnProperty('shapeKO'))
				textKO.shadowOpacity(0);
			//this.updateRect();
			this.text.ko = textKO;
			this.kineticToGroup();
			canvas.mainLayer.batchDraw();
			this.resizeShape();
		};


		this.rotate = function(rotation){
			if(this.ko.getParent().getClassName() === 'Group' ){
				if(!rotation)
					rotation = 0;
				if(this.getMainNode())
					this.getMainNode().setRotationDeg(parseFloat(rotation));
				if (this.hasOwnProperty('shapeKO'))
					this.shapeKO.setRotationDeg(parseFloat(rotation));
				for(var i = 0; i < this.subgroups.length; i++){ this.subgroups[i].rotate(rotation); }
				this.rotation = rotation;
				canvas.mainLayer.batchDraw();
			}
		};

		this.vcenter = function() {
			if(this.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				var stageHeight = canvas.stage.getHeight();
				this.ko.setY(stageHeight/2);
				this.rect.y = this.ko.y();
				canvas.mainLayer.batchDraw();
			}
		};

		this.hcenter = function() {
			if(this.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				var stageWidth = canvas.stage.getWidth();
				this.ko.setX(stageWidth/2);
				this.rect.x = this.ko.x();
				canvas.mainLayer.batchDraw();
			}
		};

		this.moveUp = function() {
			if(this.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				this.ko.moveUp();
				canvas.mainLayer.batchDraw();
			}
		};

		this.moveDown = function() {
			if(this.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				this.ko.moveDown();
				canvas.mainLayer.batchDraw();
			}
		};

		this.getMainNode=function(group){
			if(this.text.hasOwnProperty('ko') || this.image.hasOwnProperty('ko'))
				return this.text.ko || this.image.ko
			else
				return false;
		};

		this.ungroup=function(){
			var self = this;
			if (self.parent != 'root'){
				var parent = self.parent;
				if (parent.parent != 'root'){
					var newParent = parent.parent;
					newParent.subgroups.push(self);
					if(parent.subgroups.indexOf(self) > -1)
						parent.subgroups.splice(parent.subgroups.indexOf(self), 1);
					self.rect.x = self.rect.x + parent.rect.x;
					self.rect.y =  self.rect.y + parent.rect.y;

					var zIndex = parent.ko.getZIndex();
					self.ko.remove();
					newParent.ko.add(self.ko);
					self.ko.setZIndex(zIndex + 1);
					self.ko.setX(self.ko.x() + parent.rect.x);
					self.ko.setY(self.ko.y() + parent.rect.y);
					canvas.mainLayer.batchDraw();
				}
			}
		};	

		this.scaleMainNode = function(){
			if(this.getMainNode()){
				var mNode = this.getMainNode();
				if (mNode.getClassName() === 'Image'){
					if(this.image.hasOwnProperty('mode')){
						var shapeW;
						var shapeH;
						if(this.hasOwnProperty('shapeKO')){
							if(this.shapeKO.getClassName() === 'Ellipse'){
								var degrees = 45;//Math.tan((this.image.ko.getHeight()/2) / (this.image.ko.getHeight()/2));
								shapeW = 2*(this.shapeKO.radiusX()*Math.cos((degrees*Math.PI)/180));
								shapeH = 2*(this.shapeKO.radiusY()*Math.sin((degrees*Math.PI)/180));
							}else{
								shapeH = this.shapeKO.getHeight();
								shapeW = this.shapeKO.getWidth();
							}
							if(this.image.mode === 'center'){
							}else if(this.image.mode === 'scaleToFill'){
								mNode.setWidth(shapeW - 2*this.padding);
								mNode.setHeight(shapeH);
							}else if(this.image.mode === 'scaleAspectFit'){
								if(shapeH <= shapeW - 2*this.padding){
									var oldHeight = mNode.getHeight();
									mNode.setHeight(shapeH);
									mNode.setWidth(mNode.getWidth() * (mNode.getHeight()/oldHeight));						
								}else{
									var oldWidth = mNode.getWidth();
									mNode.setWidth(shapeW - 2*this.padding);
									mNode.setHeight(mNode.getHeight() * (mNode.getWidth()/oldWidth));					
								}
							}else if(this.image.mode === 'scaleAspectFill'){
								if(shapeH > shapeW - 2*this.padding){
									var oldHeight = mNode.getHeight();
									mNode.setHeight(shapeH);
									mNode.setWidth(mNode.getHeight() * (mNode.getWidth()/oldHeight));
									console.log("height is bigger");
								}else{
									var oldWidth = mNode.getWidth();
									mNode.setWidth(shapeW - 2*this.padding);
									mNode.setHeight(mNode.getWidth() * (mNode.getHeight()/oldWidth));
									console.log("width is bigger");
								}
							}	
							mNode.setX(this.shapeKO.getX()+ this.padding);
							mNode.setY(this.shapeKO.getY());
							mNode.setOffsetY(mNode.getHeight()/2);
							mNode.setOffsetX(mNode.getWidth()/2);	
						}
					}
				}else if(mNode.getClassName() === 'Text'){
					mNode.setX(this.shapeKO.getX());
					mNode.setY(this.shapeKO.getY());
				}
			}
		}
	};

	var factory = function($, Kinetic){
		return function(container, width, height, config) {
			if(!config)
				config = {};
			config.container = container;
			console.log(container);
			config.width = width;
			config.height = height;
			this.stage = new Kinetic.Stage(config);
			this.mainLayer = new Kinetic.Layer();
			this.border = new Kinetic.Rect({
				x: 0,
				y: 0,
				width: this.stage.attrs.width,
				height: this.stage.attrs.height,
				stroke: 'black',
				strokeWidth: 1
			})
			this.rootGroup;
			this.mainLayer.add(this.border);
			this.stage.add(this.mainLayer);
			this.mainLayer.batchDraw();
			this.selectedGroup;
			this.secondaryGroups = [];
			this.autoSize = true;
			this.mouseDown = false;
			this.mousePos = {};
			this.mouseOffset = {};

			this.groupClicked = function(group, mousePos, highestGroupClicked){
				if(mousePos.x > group.ko.getAbsolutePosition().x && mousePos.x < group.ko.getAbsolutePosition().x + group.rect.width && mousePos.y > group.ko.getAbsolutePosition().y && mousePos.y < group.ko.getAbsolutePosition().y + group.rect.height){
					canvas.mouseOffset = {'x':mousePos.x - group.ko.getX(), 'y': mousePos.y-group.ko.getY()};
					if(highestGroupClicked.hasOwnProperty('ko')){
						if(group.ko.getAbsoluteZIndex() > highestGroupClicked.ko.getAbsoluteZIndex()){
							highestGroupClicked = group;
						}
					}else{
						highestGroupClicked = group;
					}
				}
				if (group.hasOwnProperty('subgroups') ) {
					for(var i = 0; i < group.subgroups.length; i++){
						highestGroupClicked = this.groupClicked(group.subgroups[i], mousePos, highestGroupClicked);
					}
				}
				return highestGroupClicked;

			}

			//var context = $("#"+config.container)[0].childNodes[0].childNodes[0].getContext("2d");
			//console.log(context);
			//context.scale(3,1);

			this.rgbaStringToHex = function(rgbaString){
				var a = rgbaString.split("(")[1].split(")")[0];
				a = a.split(",");
				var b = a.map(function(x){
			    	x = parseInt(x).toString(16);
			    	return (x.length==1) ? "0"+x : x;
				});
				return "#"+b.join(""); 
			}

			this.hexToRGBAString = function(hex, alpha){
				if(hex[0] === '#'){
					hex = hex.slice(1, hex.length);
				}
				return 'rgba(' + parseInt(hex.slice(0,2), 16) + ',' + parseInt(hex.slice(2,4), 16) + ','+ parseInt(hex.slice(4,6), 16)+ ',' + parseInt(hex.slice(6,8), 16) + ')';
				
			}

			this.loadImages = function(container, imageArray, click, format) {
				var i;
				if(typeof container === 'string')
					container = document.getElementById(container);
				for(i = 0; i < imageArray.length; i++) {
					if(format) {
						var div = document.createElement('div');
						var code = format.replace(/%url/g, imageArray[i].url).replace(/%caption/g, imageArray[i].caption);
						div.innerHTML = code;
						var len = div.childNodes.length;
						for(var j = 0; j < len; ++j)
							container.appendChild(div.childNodes[0]);
					}
					else {
						var img = document.createElement("img");
						var br = document.createElement('br');
						var br2 = document.createElement('br');
						img.src = imageArray[i].url;
						img.style.width = width/2 + 'px';
						img.style.cursor = "pointer";
						container.appendChild(img);
						container.appendChild(br);
						container.appendChild(br2);
					}
				}
				var images = container.getElementsByTagName('img');
				for(i = 0; i < images.length; ++i)
					images[i].addEventListener('click', this._createEventListener(click));
			};

			this.loadFonts = function(selectContainer, fontArray) {
				if(typeof selectContainer === 'string')
					selectContainer = document.getElementById(selectContainer);
				var families = [];
				for(var i = 0; i < fontArray.length; ++i)
					families.push(fontArray[i].family);
				window.WebFontConfig = {
					google: { families: families },
					loading: function() { if(selectContainer) { selectContainer.disabled = true; $(selectContainer).html('<option>Loading...</option>'); } },
					active: function() {
						if(selectContainer) {
							$(selectContainer).empty();
							for(var i = 0; i < fontArray.length; ++i) {
								var option = document.createElement('option');
								option.value = fontArray[i].name;
								option.textContent = fontArray[i].name;
								option.style.fontFamily = fontArray[i].name;
								$(selectContainer).append(option);
							}
							selectContainer.disabled = false;
						}
					}
					//inactive: function() {},
					//fontloading: function(familyName, fvd) {},
					//fontactive: function(familyName, fvd) {},
					//fontinactive: function(familyName, fvd) {}
				};
				(function() {
					var wf = document.createElement('script');
					wf.src = ('https:' === document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
					wf.type = 'text/javascript';
					var s = document.getElementsByTagName('script')[0];
					s.parentNode.insertBefore(wf, s);
				})();
			};
			
			this.randomPos = function(ko){
				var max = this.stage.getWidth() - (ko.getWidth()/2);
				var min = ko.getWidth()/2;
				var absX = Math.floor(Math.random() * (max - min) + min);
				max = this.stage.getHeight() - ko.getHeight()/2;
				min = ko.getHeight()/2
				var absY = Math.floor(Math.random() * (max - min) + min);
				config.x = absX - ko.getWidth()/2;
				config.y = absY - ko.getHeight()/2;
				ko.setX(ko.getWidth()/2);
				ko.setY(ko.getHeight()/2);
				ko.getParent().setAbsolutePosition({'x': config.x, 'y': config.y});
				return config
			}

			this._selectGroup = function(group){
				if(this.selectedGroup !== group) {
					this.selectedGroup = group;
					//this.updateContext();
				}
			};

			this._addToSelected = function(group){
				for(var i=0; i< secondaryGroups.length; i++){
					if(secondaryGroups[i] !== group){
						secondaryGroups.append(group);
						break;
						//this.updateContext();
					}
				}
			};

			this._extendConfig = function(config, userConfig) {
				if(userConfig) {
					for(var property in userConfig) {
						if(userConfig.hasOwnProperty(property))
							config[property] = userConfig[property];
					}
				}
				return config;
			};

			this.addSubgroup = function(group){
				var self = this;
				var newGroup = new Group();
				if(group){
					newGroup.copyValues(group);
				}
				newGroup.ko = new Kinetic.Group({
					draggable: true,
					x: newGroup.rect.x,
					y: newGroup.rect.y
				});
				if(self.hasOwnProperty('selectedGroup')){
					self.selectedGroup.ko.add(newGroup.ko);
					newGroup.parent = self.selectedGroup;
					self.selectedGroup.subgroups.push(newGroup);
					newGroup.ko.on('mouseup dragstart', function() { 
						self._selectGroup(newGroup); 
						newGroup.kineticToGroup();
					});
					newGroup.ko.on('mouseout', function() { document.body.style.cursor = 'auto'; });
					newGroup.ko.on('mouseover', function() { document.body.style.cursor = 'move'; });
				}else{
					self.rootGroup = newGroup;
					newGroup.ko.draggable(false);
					if(newGroup.rect.width === 0){
						newGroup.ko.setWidth(this.stage.getWidth()); 
						newGroup.rect.width = this.stage.getWidth();
					}
					if(newGroup.rect.height === 0){
						newGroup.ko.setHeight(this.stage.getHeight());
						newGroup.rect.height = this.stage.getHeight();
					}
					self.mainLayer.add(newGroup.ko);
					self.scale(newGroup.rect.width, newGroup.rect.height);
					newGroup.parent = 'root';
				}
				self._selectGroup(newGroup);
			};


			this.addSiblingGroup = function(group){
				var self = this;
				var newGroup = new Group();
				if(group){
					newGroup.copyValues(group);
				}
				if(self.hasOwnProperty('selectedGroup')){
					if(self.selectedGroup.parent !== 'root'){
						newGroup.ko = new Kinetic.Group({
							draggable: true,
							x: newGroup.rect.x,
							y: newGroup.rect.y
						});
						self.selectedGroup.ko.getParent().add(newGroup.ko);
						self.selectedGroup.parent.subgroups.push(newGroup);
						newGroup.parent = self.selectedGroup.parent;
						newGroup.ko.on('mouseup dragstart', function() { 
							self._selectGroup(newGroup); 
							newGroup.kineticToGroup();
						});
						newGroup.ko.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						newGroup.ko.on('mouseover', function() { document.body.style.cursor = 'move'; });
						self._selectGroup(newGroup);
					}
				}
			};

			this.checkLayer = function(){
				if(this.hasOwnProperty("selectedGroup")){
					if((this.selectedGroup.parent === 'root' && this.selectedGroup.getMainNode())){
						this.addSubgroup();
					}else if(this.selectedGroup.getMainNode() &&  this.selectedGroup.parent !== 'root'){
						this.addSiblingGroup();
					}
				}else{
					this.addSubgroup();
				}
			}
			this.addImage = function(url){
				this.checkLayer();
				//this.selectedGroup.image.copyValues(url);
				url = url || this.selectedGroup.image.setPreviewImage(500,500);
				this.selectedGroup.editImage(url);
			}
			this.addText = function(textOptions){
				this.checkLayer();
				this.selectedGroup.text.copyValues(textOptions);
				this.selectedGroup.editText();
			}
			this.addShape = function(group){
				if(!this.selectedGroup  || (this.selectedGroup.parent === 'root' && this.selectedGroup.hasOwnProperty('shapeKO'))){
					this.addSubgroup();
				}else if(this.selectedGroup.hasOwnProperty('shapeKO')){
					this.addSiblingGroup();
				}
				this.selectedGroup.copyValues(group);
				this.selectedGroup.editShape();
			}

			//EDIT
			this.reorder = function(newParent, group){
				if (newParent != 'root' && group != 'root'){
					//check if group is root group
					if(group.parent != 'root'){
						var parent = group.parent;
						newParent.subgroups.push(group);
						if(parent.subgroups.indexOf(group) > -1)
							parent.subgroups.splice(parent.subgroups.indexOf(group), 1);
						//group.rect.x = group.rect.x + parent.rect.x;
						//group.rect.y =  group.rect.y + parent.rect.y;
						//get absolute position of both new parent and child and 
						var newOrigin = newParent.ko.getAbsolutePosition();
						var childPos = group.ko.getAbsolutePosition();
						var zIndex = parent.ko.getZIndex();
						group.ko.remove();
						newParent.ko.add(group.ko);
						group.ko.setZIndex(zIndex + 1);
						
						group.ko.setX(childPos.x - newOrigin.x);
						group.ko.setY(childPos.y - newOrigin.y);
						group.rect.x = childPos.x - newOrigin.x;
						group.rect.y = childPos.y - newOrigin.y;
						canvas.mainLayer.batchDraw();
					}
				}
			};

			this.group = function(newParent, group){
				for(var i=0; i < this.secondaryGroups.length; i++){
					this.reorder(newParent, this.secondaryGroups[i]);
				}

			};

			this.dismantle=function(group){
				var childrenArray = [];
				var i = 0;
				group.remove()
				while(group.subgroups.length > 0){
					childrenArray.append(dismantle(group.subgroups[i]));
				}
				childrenArray.append(group);
				return childrenArray;
			}

			this.delete=function(group){
				//get subchildren and parents
				if(!group)
					group = this.selectedGroup
				var subgroups = group.subgroups;
				var parent = group.parent;
				var i = 0;
				if(parent === 'root'){
					parent = subgroups[0];
					i = 1;
				}
				while( i < subgroups.length){
					this.reorder(parent, subgroups[i]);
					i++;
				}
				group.ko.destroy();
				parent.subgroups.splice(parent.subgroups.indexOf(group), 1);

			};
			
			this.scale=function(newWidth, newHeight){
				//scale whole canvas and recursively go through trees and scale each node
				//recursively check each node to see if any of them are below minimum width ?
				
				var changeWidth = true;
				var changeHeight = true;
				/*if(this.hasOwnProperty('rootGroup')){
					changeWidth = this.checkForMinWidth(this.rootGroup);
					changeHeight = this.checkForMinHeight(this.rootGroup);
				}*/

				if(newWidth === undefined && this.hasOwnProperty('rootGroup'))
					newWidth = this.rootGroup.rect.width;
				if(newHeight === undefined && this.hasOwnProperty('rootGroup'))
					newHeight = this.rootGroup.rect.height;

				var diffX = newWidth - this.stage.getWidth();
				var diffY = newHeight - this.stage.getHeight();
				this.border.setWidth(newWidth);
				this.border.setHeight(newHeight);
				this.stage.setWidth(newWidth);
				this.stage.setHeight(newHeight);
				if(this.hasOwnProperty('rootGroup')){
						this.rootGroup.ko.setX(newWidth/2 - this.rootGroup.rect.width/2);
						this.rootGroup.ko.setY(newHeight/2 - this.rootGroup.rect.height/2);
						this.groupScale(this.rootGroup, diffX, diffY);
				}
			};

			this.checkForMinWidth=function(group){
				var changeWidth = true
				if(group.hasOwnProperty('shapeKO')){
					if(group.shapeKO.getWidth() <= 20 || group.shapeKO.getWidth() <= group.curve*2){
						return false;
					}else{
						if(group.hasOwnProperty('subgroups')) {
							for(var i = 0; i < group.subgroups.length; i++){
								if(!this.checkForMinWidth(group.subgroups[i]))
									return false;
							}
						}
						return true;
					}
				}
			}

			this.checkForMinHeight=function(height){

			}

			this.calculateReachMin=function(height){

			}

			this.groupScale = function(group, diffX, diffY){
				if(group.hasOwnProperty('resizingMask')){
					var flexLeft = (group.resizingMask & 1) === 1;
					var flexWidth = (group.resizingMask & 2)=== 2;
					var flexRight = (group.resizingMask & 4)=== 4;
					var flexTop = (group.resizingMask & 8)=== 8;
					var flexHeight = (group.resizingMask & 16) === 16;
					var flexBottom = (group.resizingMask & 32) === 32;
					if(group.hasOwnProperty('shapeKO')){
						var distanceLeft = group.shapeKO.getAbsolutePosition().x + group.shapeKO.getWidth()/2;
						var distanceRight = this.stage.getWidth() - (group.shapeKO.getAbsolutePosition().x + group.shapeKO.getWidth()/2);
						var distanceTop = group.shapeKO.getAbsolutePosition().y + group.shapeKO.getHeight()/2;
						var distanceBottom = this.stage.getHeight() - (group.shapeKO.getAbsolutePosition().y + group.shapeKO.getHeight()/2);
					}
					if (group.resizingMask != 0) {
						//1
						if(flexLeft && !flexWidth && !flexRight){
							group.ko.setX(group.ko.x() + diffX );
						}
						//2
						else if(!flexLeft && flexWidth && !flexRight){
								group.editShape({'width': group.shapeKO.getWidth() + diffX} );
								group.ko.setX(group.ko.x() + diffX/2 );	
						}
						//3
						else if(flexLeft && flexWidth && !flexRight){
								group.editShape({'width': group.shapeKO.getWidth() + diffX/2} );
								group.ko.setX(group.ko.x() + diffX );
						}
						//4 = default behaviour				
						//5
						else if(flexLeft && !flexWidth && flexRight){
							group.ko.setX(group.ko.x() + diffX/2 );
						}
						//6
						else if(!flexLeft && flexWidth && flexRight){ 
								group.editShape({'width': group.shapeKO.getWidth() + diffX/2} );
								group.ko.setX(group.ko.x() + diffX/4 );
						}
						//7
						else if(flexLeft && flexWidth && flexRight){
							//if(group.shapeKO.getWidth() + diffX/3 > group.minimumSize.width ){
								group.editShape({'width': group.shapeKO.getWidth() + diffX/3} );
								group.ko.setX(group.ko.x() + diffX/3 );
							//}
						}

						//height
						//8
						if(flexTop && !flexHeight && !flexBottom ){
							group.ko.setY(group.ko.y() + diffY );
						}
						//16
						else if(!flexTop && flexHeight && !flexBottom ){
								group.editShape({'height': group.shapeKO.getHeight() + diffY} );
								group.ko.setY(group.ko.y() + diffY/2 );	
						}
						//24
						else if(flexTop && flexHeight && !flexBottom ){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/2} );
								group.ko.setY(group.ko.y() + diffY/2 );
						}
						//32 = default behaviour				
						//40
						else if(flexTop && !flexHeight && flexBottom){
							group.ko.setY(group.ko.y() + diffY/2 );
						}
						//48
						else if(!flexTop && flexHeight && flexBottom ){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/2} );
								group.ko.setY(group.ko.y() + diffY/4 );
						}
						//56
						else if(flexTop && flexHeight && flexBottom){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/3} );
								group.ko.setY(group.ko.y() + diffY/3 );
						}
					};
					if(group.getMainNode())
					 	group.scaleMainNode();
					if (group.hasOwnProperty('subgroups')) {
						for(var i = 0; i < group.subgroups.length; i++){
							this.groupScale(group.subgroups[i], diffX, diffY);
						}
					}
				}
			};

			this.scaleWidth = function(group){
				if(group.getMainNode())
					 	group.getMainNode().scaleX(3);
				if(group.hasOwnProperty('shapeKO'))
					 	group.shapeWidth(group.rect.width*3);
				if (group.hasOwnProperty('subgroups')) {
					for(var i = 0; i < group.subgroups.length; i++){
						this.scaleWidth(group.subgroups[i]);
					}
				}
				canvas.mainLayer.batchDraw();
			}

			this.save=function(group){
				//go through each node, delete all temporary variables, convert colors to rgba hex and send as a json

				var groupClone = jQuery.extend(true, {}, group);
				groupClone.text = jQuery.extend({}, group.text);
				groupClone.image = jQuery.extend({}, group.image);
				this.deleteTemp(groupClone);
				console.log(JSON.stringify(groupClone));
			};

			this.deleteTemp = function(groupClone){
				if(groupClone.hasOwnProperty('shapeKO'))
					delete groupClone.shapeKO;
				if(groupClone.hasOwnProperty('ko'))
					delete groupClone.ko;
				if(groupClone.hasOwnProperty('parent'))
					delete groupClone.parent;
				if(groupClone.hasOwnProperty('minimumSize'))
					delete groupClone.minimumSize;
				if(groupClone.hasOwnProperty('margins'))
					delete groupClone.margins;
				if(groupClone.hasOwnProperty('text')){
					if(groupClone.text.hasOwnProperty('ko'))
						delete groupClone.text.ko;
				}
				if(groupClone.hasOwnProperty('image')){
					if(groupClone.image.hasOwnProperty('ko'))
						delete groupClone.image.ko;
				}
				if (groupClone.hasOwnProperty('subgroups') ) {
					for(var i = 0; i < groupClone.subgroups.length; i++){
						groupClone.subgroups[i].text = jQuery.extend({}, groupClone.subgroups[i].text);
						groupClone.subgroups[i].image = jQuery.extend({}, groupClone.subgroups[i].image);
						groupClone.subgroups[i] = jQuery.extend({}, groupClone.subgroups[i]);
						this.deleteTemp(groupClone.subgroups[i]);
					}
				}
			}
			//takes in an array of groups and renders them into the canvas
			this.load=function(group){
				this.addSubgroup(group);
				var newGroup = this.selectedGroup;				
				if(group.hasOwnProperty('color')){
					if(newGroup.color[0] == '#')
						newGroup.color = this.hexToRGBAString(newGroup.color, newGroup.alpha || 0);
					this.addShape(newGroup);
				}
				if(group.hasOwnProperty('image')){
					if(group.image.hasOwnProperty('imageId'))
						this.addImage(newGroup.image.imageId);
					else if(group.image.hasOwnProperty('url'))
						this.addImage(newGroup.image.url);
				}else if(group.hasOwnProperty('text')){
					this.addText(newGroup.text);
				}
				if (group.hasOwnProperty('subgroups') ) {
					for(var i = 0; i < group.subgroups.length; i++){
						this.load(group.subgroups[i]);
						this.selectedGroup = newGroup;
					}
				}
			}; 

			this.relayer = function(group){
				if (group.hasOwnProperty('ko')) {
					if(group.ko.hasOwnProperty('children')){
						if(group.getMainNode())
							group.getMainNode().moveToBottom();
						if(group.hasOwnProperty('shapeKO'))
							group.shapeKO.moveToBottom();
					}
				};
			}

			this.subPixelRender = function(){
				this.stage.setWidth(this.stage.getWidth()*3);
				var con = $("#"+config.container)[0].childNodes[0].childNodes[0].getContext('2d');
				con.scale(3,1);
				this.mainLayer.draw();
				var id = con.getImageData(0,0,this.stage.getWidth()*3+40,this.stage.getHeight()+40);
				con.putImageData(id,0,0);
				this.copyPix_LCD($('#canvasSB')[0].childNodes[0].childNodes[0], $('#destCanvas')[0], 0.34);
				con.scale(1/3,1);
				this.stage.setWidth(this.stage.getWidth()/3);
				this.mainLayer.draw();
			}

			//$('#canvasSB')[0].childNodes[0].childNodes[0]
			//$('#destCanvas')[0]
			this.copyPix_LCD = function( source, dest, w1 ) {
				// copies a 3:1 image to a 1:1 image, using LCD stripes	
				// w1 = centre weighting for sampling. e.g. 0.6
				
				var sc = source.getContext('2d');
				var sw = source.width;
				var sh = source.height;
				var sp = sc.getImageData(0, 0, sw, sh);
				
				var dc = dest.getContext('2d');
				var dw = dest.width;
				var dh = dest.height;
				var dp = dc.getImageData(0, 0, dw, dh);		
				
				var readIndex, writeIndex, r, g, b, a, x, y;
				
				// sampling weightings. w1 = weight for sub-pixel; w2 = weight for 
				var w2 = (1-w1) * 0.5;
				var w21 = w1 + w2;
				var w211 = w2 + w2 + w1;
				
				// copy. we cheat, by ignoring the width edges.
				// todo: check extents of source reads, e.g. to use 0..dw, and then prevent index error (too slow?)
				for( y = 0; y < dh; y++ ) {
				
					for( x = 1; x < (dw-1); x++ ) {
					
						readIndex  = (y * sw + x * 3) * 4;
						writeIndex = (y * dw + x) * 4;
						
						// r
						dp.data[writeIndex + 0] = Math.round(
								w1 *   sp.data[ readIndex + 0 ]
							+	w2 * ( sp.data[ readIndex - 4 ] + sp.data[ readIndex +  4 ] )
						);
						
						// g
						dp.data[writeIndex + 1] = Math.round(
								w1 *   sp.data[ readIndex + 5 ]
							+	w2 * ( sp.data[ readIndex + 1 ] + sp.data[ readIndex +  9 ] )
						);
						
						// b
						dp.data[writeIndex + 2] = Math.round(
								w1 *   sp.data[ readIndex + 10 ]
							+	w2 * ( sp.data[ readIndex + 6 ] + sp.data[ readIndex + 14 ] )
						);
						
						// a
						dp.data[writeIndex + 3] = Math.round(
							0.3333 * (
									w211 *   sp.data[ readIndex + 7 ]
								+	w21  * ( sp.data[ readIndex + 3 ] + sp.data[ readIndex + 11 ] )
								+	w2   * ( sp.data[ readIndex - 1 ] + sp.data[ readIndex + 15 ] )
							)
						);
						
					}
					
				}
				
				dc.putImageData(dp,0,0);
			}

		};
	};



	
	// Requirements - jquery, kinetic.js, rgbcolor.js, canvg.js
	// rgbcolor and canvg need to be shimmed
	/* global define:false, $:false, Kinetic: false */
	if(typeof define === "function" && define.amd) {
		// AMD
		//"rgbcolor", "canvg"
		define("sandbox", ["jquery", "kinetic", "p", "underscore", "canvg"], function($, Kinetic) { return factory($, Kinetic); });
	}
	else {
		// Global
		window.Sandbox = factory($, Kinetic);
	}
})();

