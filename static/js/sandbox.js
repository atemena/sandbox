// sandbox.js - creates a Kinetic stage for allowing the user to manipulate backgrounds, stickers, and text
(function(){
	"use strict";

	var Group = function(group){
		this.rect = {'x':0, 'y':0,'width': 0, 'height': 0};
		this.stroke = {'color': '#00000000', 'width':0};
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
		this.originalSize = {'width': 0, 'height':0};
		this.margins = {'left': 0, 'right': 0, 'top': 0, 'bottom': 0};

		//copys values from another group object
		this.copyValues = function(group){
			//shadow , rect , stroke, gradient-start and end point image and text
			_.extend(this.rect, group.rect);
			_.extend(this.shadow), group.shadow;
			_.extend(this.gradient, group.gradient);
			this.image.copyValues(group.image);
			this.text.copyValues(group.text);
			_.map(_.pairs(group), function(pair){
				var key = pair[0];
				var val = pair[1];
				if(typeof val !== 'object' && key !== 'subgrous'){
					this[key] = val;
				}
			}, this);
			console.log(group);
			console.log(this);

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
		}

		//updates values of group to match the kinetic object
		this.kineticToGroup = function(){
			this.updateRect();
			if(this.hasOwnProperty('shapeKO')){
				this.color = this.shapeKO.fill();
				this.rotation = this.shapeKO.rotation();
				this.stroke = {'color':this.shapeKO.stroke(), 'width':this.shapeKO.strokeWidth()};
				this.alpha = this.shapeKO.fillAlpha();
				this.shadow = {'horizontalOffset': this.shapeKO.shadowOffsetX(),
				 			   'verticalOffset': this.shapeKO.shadowOffsetY(), 
				 			   'blur': this.shapeKO.shadowBlur(), 
				 			   'color': this.shapeKO.shadowColor() 
				 			};	
				var colors = [];
				var stops = [];
				 if(this.shapeKO.fillPriority() === 'linear'){
					var colorStops = this.shapeKO.fillLinearGradientColorStops();
					for(var i = 0; i < this.shapeKO.fillLinearGradientColorStops().length; i++){
						if (i%2 == 1)
					 		colors.push(colorStops[i]);
					 	else
					 		stops.push(colorStops[i]);
					}
					this.gradient.colors = colors; 
					this.gradient.colorStops = stops; 
					this.gradient.startX = this.shapeKO.fillLinearGradientStartPoint().x;
					this.gradient.startY = this.shapeKO.fillLinearGradientStartPoint().y;
					this.gradient.endX = this.shapeKO.fillLinearGradientEndPoint().x;
					this.gradient.endY = this.shapeKO.fillLinearGradientEndPoint().y;
				}else if(this.shapeKO.fillPriority() === 'radial'){
					var colorStops = this.shapeKO.fillRadialGradientColorStops();
					for(var i = 0; i < this.shapeKO.fillRadialGradientColorStops().length; i++){
						if (i%2 == 1)
					 		colors.push(colorStops[i]);
					 	else
					 		stops.push(colorStops[i]);
					}
					this.gradient.colors = colors; 
					this.gradient.colorStops = stops; 
					this.gradient.startX = this.shapeKO.getWidth()/2;
					this.gradient.startY = this.shapeKO.getHeight()/2;
					this.gradient.endX = this.shapeKO.getWidth();
					this.gradient.endY = this.shapeKO.getHeight();
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
			this.shapeKO.setWidth(this.shapeWidth);
			this.shapeKO.setHeight(this.shapeHeight);
			this.shapeKO.setFill(this.color);
			this.rotate(this.rotation);
			this.shapeKO.stroke(this.stroke.color)
			this.shapeKO.strokeWidth(this.stroke.width);
			this.shapeKO.opacity(this.alpha);
			this.shapeKO.shadowColor(this.shadow.color); 
			this.shapeKO.shadowBlur(this.shadow.blur); 
			this.shapeKO.shadowOffsetX(this.shadow.horizontalOffset);
			this.shapeKO.shadowOffsetY(this.shadow.verticalOffset);  
		};

		this.rotate = function(rotation){
			if(this.ko.getParent().getClassName() === 'Group' ){
				if(!rotation)
					rotation = 0;
				if(this.getMainNode())
					this.getMainNode().setRotationDeg(parseFloat(rotation));
				if (this.hasOwnProperty('shapeKO'))
					this.shapeKO.setRotationDeg(parseFloat(rotation));
				this.rotation = rotation;
				for(var i = 0; i < this.subgroups.length; i++){
					this.subgroups[i].rotate(rotation);
				}
				canvas.mainLayer.batchDraw();
			}
			
		};
		this.resizeShape = function(){
			if(canvas.autoSize == true && this.hasOwnProperty('shapeKO') && this.getMainNode())
				this.editShape({'width': this.getMainNode().getWidth() + this.padding, 'height': this.getMainNode().getHeight()});
		};

		this.textColor = function(color){
			if(this.text.ko){
				this.text.ko.fill(color);
				this.text.color = color;
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

		this.shapeGradient = function(gradient){
			
			if(this.hasOwnProperty('shapeKO')){
				gradient = gradient || {}
				//use underscore to make better use defaults or extend?
				var direction = this.gradient.direction;
				var startPointX = this.gradient.startX;
				var startPointY = this.gradient.startY;
				var endPointX = this.gradient.endX;
				var endPointY = this.gradient.endY;
				var colors = this.gradient.colors;
				var stops = this.gradient.colorStops;
				// use extend or default?
				if(gradient.hasOwnProperty('direction'))
					direction = gradient.direction;
				if(gradient.hasOwnProperty('colors'))
					colors = gradient.colors;
				if(gradient.hasOwnProperty('colorStops'))
					stops = gradient.colorStops;
				var colorStops = []
				for(var i = 0; i < colors.length && i < stops.length; i++){
					colorStops.push(stops[i]);
					colorStops.push(colors[i]);
				}

				var startAndEndPoints = [
						[0, config.height/2, config.width, config.height/2], //linear horizontal rect
						[config.width/2, 0, config.width/2, config.height],  //linear vertical rect
						[-config.width/2, 0, config.width/2, 0], //linear horizontal ellipse
						[0, -config.height/2, 0, config.height/2], //linear vertical ellipse
						[config.width/2, config.height/2, config.width, config.height] //radial
					];
				//TODO: Fix this
				if(!group.gradient.hasOwnProperty('startX') || !group.gradient.hasOwnProperty('startY') || !group.gradient.hasOwnProperty('endX') || !group.gradient.hasOwnProperty('endY')){
					if(group.gradient.direction === 'linear-horizontal')
						gradientType = 0;
					if(group.gradient.direction === 'linear-vertical')
						gradientType = 1;
					if(config.curve === -1)
						gradientType = gradientType + 2;
					if(group.gradient.direction === 'radial')
						gradientType = 4;
					startPointX = startAndEndPoints[gradientType][0];
					startPointY = startAndEndPoints[gradientType][1];
					endPointX = startAndEndPoints[gradientType][2];
					endPointY = startAndEndPoints[gradientType][3];
				}
				if(direction === 'linear-vertical'){
					this.shapeKO.fillLinearGradientStartPointX({'x': startPointX, 'y':startPointY});
					this.shapeKO.fillLinearGradientEndPointX({'x': endPointX, 'y': endPointY});
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
			this.kineticToGroup();
		};

		this.shapeFill = function(color){
			var fill = this.color;
			if(color)
				fill = color;
			if(typeof color === 'string')
				this.shapeKO.fill(fill);
		};

		this.shapeShadow = function(){

			if(!config.hasOwnProperty('shadow')){
				config.shadowOffsetX = self.shadow.horizontalOffset;
				config.shadowOffsetY = self.shadow.verticalOffset;
				config.shadowBlur = self.shadow.blur;
				config.shadowColor = self.shadow.color;
			}else{
				if(!config.shadow.hasOwnProperty('shadowOffsetX'))
					config.shadowOffsetX = self.shadow.horizontalOffset;
				if(!config.shadow.hasOwnProperty('shadowOffsetY'))
					config.shadowOffsetY = self.shadow.verticalOffset;
				if(!config.shadow.hasOwnProperty('shadowBlur'))
					config.shadowBlur = self.shadow.blur;
				if(!config.shadow.hasOwnProperty('shadowColor'))
					config.shadowColor = self.shadow.color;
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


		this.shadowEdit = function(s){
			var node = false;
			if(this.hasOwnProperty('shapeKO')){
				node = this.shapeKO;
				if(this.getMainNode()){
					this.getMainNode().shadowOpacity(0);
					this.getMainNode().shadowOffsetX(0);
					this.getMainNode().shadowOffsetY(0);
				}	
			}else{
				node = this.getMainNode();
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
				this.shadow = {'horizontalOffset': node.shadowOffsetX(), 
							   'verticalOffset': node.shadowOffsetY(), 
							   'blur': node.shadowBlur(), 
							   'color': node.shadowColor()
							  };
			}
			canvas.mainLayer.batchDraw();
		};

		this.editImage=function(img){
			if(canvas.selectedGroup){
				if(this.image.ko){
					var image = new Image();
					if(config.url.substr(0, 5) !== 'data:')
						image.crossOrigin = "Anonymous";
					image.src = config.url;
					this.image.ko.setImage(image);
					canvas.mainLayer.batchDraw();
					this.resizeShape(); 
				}
			}
		};


		this.editShape=function(config){
			if(this.shapeKO){
				var newShape;
				var self = this;
				if (!config.hasOwnProperty('width'))
					config.width = self.shapeKO.getWidth();
				if(!config.hasOwnProperty('height'))
					config.height = self.shapeKO.getHeight();
				if(!config.hasOwnProperty('curve'))
					config.curve = self.curve;
				if(!config.hasOwnProperty('stroke')){
					config.stroke = self.stroke.color;
					config.strokeWidth = self.stroke.width;
				}
				if(!config.hasOwnProperty('fill')){
					config.fill = self.color;
				}
				
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
						x: self.shapeKO.getX(),
						y: self.shapeKO.getY(),
						draggable: false
					}, config));
					newShape.setOffsetX(newShape.getWidth()/2);
					newShape.setOffsetY(newShape.getHeight()/2);
				}else if (config.curve == -1){
					newShape = new Kinetic.Ellipse(canvas._extendConfig({
						radius: {x: config.width/2, y:config.height/2},
						x: self.shapeKO.getX(),
						y: self.shapeKO.getY(),
						draggable:false								
					}, config));
				}

				this.ko.add(newShape);
				var oldWidth = this.shapeKO.getWidth();
				var oldHeight = this.shapeKO.getHeight();
				var fillPriority = this.shapeKO.fillPriority();
				
				this.shapeKO.destroy();
				this.shapeKO = newShape;
				if(fillPriority === 'color'){
					this.shapeFill(config.fill);
				}else if(fillPriority === 'linear-gradient' || fillPriority === 'radial-gradient'){
					this.shapeGradient();
				}
				this.shapeKO.moveToBottom();
				this.scaleMainNode(newShape.getWidth()-oldWidth, newShape.getHeight()-oldHeight);

				this.shapeWidth = config.width;
				this.shapeHeight = config.height;
				this.color = config.fill;
				this.stroke.color = config.stroke;
				this.stroke.width = config.strokeWidth
				this.curve = config.curve;
				this.shadow = {'horizontalOffset': config.shadowOffsetX, 
									  'verticalOffset': config.shadowOffsetY, 
									  'blur': config.shadowBlur, 
									  'color': config.shadowColor
									 };
				canvas.mainLayer.batchDraw();
			}
		};

		this.updateRect = function(){
			this.rect.x = this.ko.x();
			this.rect.y = this.ko.y();
			var width;
			if (this.hasOwnProperty('shapeKO'))
				width = this.shapeKO.getWidth();
			if (this.getMainNode()){
				if (this.getMainNode().getWidth() > width)
					width = this.getMainNode().getWidth();
			}
			if(!width)
				width = this.rect.width;

			var height;
			if (this.hasOwnProperty('shapeKO'))
				height = this.shapeKO.getHeight();
			if (this.getMainNode()){
				if (this.getMainNode().getHeight() > height)
					height = this.getMainNode().getHeight();
			}
			if(!height)
				height = this.rect.height;
			if (this.rect.width != width || this.rect.height != height){
				this.rect.width = width;
				this.rect.height = height
			}
		};

		this.updateMargins = function(){
			this.margins.left = this.shapeKO.getAbsolutePosition().x - this.shapeKO.getWidth()/2;
			this.margins.top = this.shapeKO.getAbsolutePosition().y - this.shapeKO.getHeight()/2;
			this.margins.right = canvas.stage.getWidth()-(this.shapeKO.getAbsolutePosition().x + this.shapeKO.getWidth()/2);
			this.margins.bottom = canvas.stage.getHeight()-(this.shapeKO.getAbsolutePosition().y + this.shapeKO.getHeight()/2);
		};

		this.getMainNode=function(group){
			for(var i = 0; i<this.ko.getChildren().length; i++){
				if (this.ko.children[i].getClassName() === 'Image' || this.ko.children[i].getClassName() === 'Text'){
					return this.ko.children[i];
				}
			}
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

		this.scaleMainNode = function(diffX, diffY){
			if(this.getMainNode()){
				if (this.getMainNode().getClassName() === 'Image'){
					if(this.image.hasOwnProperty('mode')){
						var shapeWidth;
						var shapeHeight;
						if(this.hasOwnProperty('shapeKO')){
							if(this.shapeKO.getClassName() === 'Ellipse'){
								var degrees = 45;//Math.tan((this.image.ko.getHeight()/2) / (this.image.ko.getHeight()/2));
								shapeWidth = 2*(this.shapeKO.radiusX()*Math.cos((degrees*Math.PI)/180));
								shapeHeight = 2*(this.shapeKO.radiusY()*Math.sin((degrees*Math.PI)/180));
							}else{
								shapeHeight = this.shapeKO.getHeight();
								shapeWidth = this.shapeKO.getWidth();
							}
							if(this.image.mode === 'center'){
							}else if(this.image.mode === 'scaleToFill'){
								this.image.ko.setWidth(shapeWidth+diffX - 2*this.padding);
								this.image.ko.setHeight(shapeHeight+diffY);
								this.image.ko.setOffsetX(shapeWidth/2);
								this.image.ko.setOffsetY(shapeHeight/2);
								this.image.ko.setX(this.shapeKO.getX()+ this.padding);
								this.image.ko.setY(this.shapeKO.getY());
							}else if(this.image.mode === 'scaleAspectFit'){
								if(shapeHeight <= shapeWidth - 2*this.padding){
									var oldHeight = this.image.ko.getHeight();
									this.image.ko.setHeight(shapeHeight+diffY);
									this.image.ko.setOffsetY(this.image.ko.getHeight()/2);
									this.image.ko.setWidth(this.image.ko.getWidth() * (this.image.ko.getHeight()/oldHeight));
									this.image.ko.setOffsetX(this.image.ko.getWidth()/2);							
								}else{
									var oldWidth = this.image.ko.getWidth();
									this.image.ko.setWidth(shapeWidth+diffX - 2*this.padding);
									this.image.ko.setOffsetX(this.image.ko.getWidth()/2);
									this.image.ko.setHeight(this.image.ko.getHeight() * (this.image.ko.getWidth()/oldWidth));
									this.image.ko.setOffsetY(this.image.ko.getHeight()/2);							
								}
							}else if(this.image.mode === 'scaleAspectFill'){
								if(shapeHeight > shapeWidth - 2*this.padding){
									var oldHeight = this.image.ko.getHeight();
									this.image.ko.setHeight(shapeHeight+diffY);
									this.image.ko.setOffsetY(this.image.ko.getHeight()/2);
									this.image.ko.setWidth(this.image.ko.getWidth() * (this.image.ko.getHeight()/oldHeight));
									this.image.ko.setOffsetX(this.image.ko.getWidth()/2);							
								}else{
									var oldWidth = this.image.ko.getWidth();
									this.image.ko.setWidth(shapeWidth+diffX - 2*this.padding);
									this.image.ko.setOffsetX(this.image.ko.getWidth()/2);
									this.image.ko.setHeight(this.image.ko.getHeight() * (this.image.ko.getWidth()/oldWidth));
									this.image.ko.setOffsetY(this.image.ko.getHeight()/2);							
								}
							}
						}
					}

				}
			}

		}
	};


	// add defaults
	var Img = function(){
		this.ko;
		this.imageId;
		this.url;
		this.tint = 'none';
		this.mode = 'scaleAspectFit';
		this.copyValues = function(img){
			_.extend(this, img);
			
		};
		this.kineticToImg = function(){
			this.url = this.ko.getImage().src;
		};
	};

	// add defaults
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
	};

	var factory = function($, Kinetic){
		return function(container, width, height, config) {
			if(!config)
				config = {};
			config.container = container;
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
				return 'rgba(' + parseInt(hex.slice(0,2), 16) + ',' + parseInt(hex.slice(2,4), 16) + ','+ parseInt(hex.slice(4,6), 16)+ ',' + alpha + ')';
				
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
					if(self.selectedGroup.ko.getParent().getClassName() === 'Group'){ // why check for parent with kinetic instead of group
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

			this.onImageLoad = function(args) {
				var group = args[0];
				var newImage = args[1];
				var config = args[2];

				var imageKO = new Kinetic.Image(this._extendConfig({
					image: newImage,
					x: 0,
					y: 0,
					draggable: false,
				}, config));
				
				imageKO.offsetX(newImage.width/2);
				imageKO.offsetY(newImage.height/2);

				group.ko.add(imageKO);
				if(group.parent === 'root'){
					imageKO.setX(this.stage.getWidth()/2);
					imageKO.setY(this.stage.getHeight()/2);
				}else{
					if(!group.hasOwnProperty('shapeKO') && config.x === 'auto' && config.y === 'auto'){
							config = this.randomPos(imageKO);
					}else if(config.x === 'auto' && config.y === 'auto'){
							imageKO.setX(group.shapeKO.getWidth()/2);
							imageKO.setY(group.shapeKO.getHeight()/2);
					}
				}
				if(group.hasOwnProperty('shapeKO'))
					imageKO.shadowOpacity(0);

				//replace with one call to copy values and update rect
				//vvvv
					//group.updateRect();
					group.originalSize.width = imageKO.getWidth();
					group.originalSize.height = imageKO.getHeight();
					if(config.hasOwnProperty('mode'))
						group.image.mode = config.mode;
					group.image.url = newImage.src;
					group.image.ko = imageKO;
					group.kineticToGroup();
					//this.selectedGroup.applyGroupValues();

				this.relayer(group);
				this.mainLayer.batchDraw();
			}

			this.addImage = function(url, group){
				var self = this;
				var newImage = new Image();
				var config = { x : 'auto', y : 'auto' };
				if(group){
					if(group.hasOwnProperty('rect')){
						if(group.rect.hasOwnProperty('width'))
							config.x = group.rect.width/2;
						if(group.rect.hasOwnProperty('height'))
							config.y = group.rect.height/2;
					}
					if(group.hasOwnProperty('image')){
						if(group.image.hasOwnProperty('mode'))
							config.mode = group.image.mode;
					}
				}

				if(!self.selectedGroup || (self.selectedGroup.parent === 'root' && self.selectedGroup.getMainNode())){
					self.addSubgroup();
				}else if(self.selectedGroup.getMainNode() &&  self.selectedGroup.parent !== 'root'){
					self.addSiblingGroup();
				}
				// In case of an event object
				if(typeof url !== 'string')
					url = url.target.src;
				if(url.slice(-4) === '.svg' || url.substr(0, 26) === 'data:image/svg+xml;base64,') {
					newImage.onload = function() {
						if(url.substr(0, 26) === 'data:image/svg+xml;base64,')
							url = atob(url.slice(26));
						// The image is only required to get width/height of the picture
						var svgShape = new Kinetic.Shape(self._extendConfig({
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
						svgShape.on('mouseup dragstart', function() { self._selectNode(this); }); //call apply settings?
						svgShape.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						svgShape.on('mouseover', function() { document.body.style.cursor = 'move'; });
						self._selectNode(svgShape);
						self.scale(1);
						self.stickerLayer.add(svgShape);
						self.stickerLayer.batchDraw();
					};
				}
				else {
					newImage.onload = this.onImageLoad.bind(self, [self.selectedGroup, newImage, config]);
				}
				if(url.substr(0, 5) !== 'data:')
					newImage.crossOrigin = "Anonymous";
				newImage.src = url;
			};

			this.addText = function(group){
				var self = this;
				var config = {
					'x': 'auto',
					'y': 'auto',
					'text': "preview",
					'fill': 'rgba(0,0,0,1)',
					'fontSize': 32,
					'fontFamily': 'Arial'
				};
				if (group.hasOwnProperty('text')){
					if (group.text.hasOwnProperty('content'))
						config.text = group.text.content;
					if(group.text.hasOwnProperty('color'))
						config.fill = group.text.color;
					if(group.text.hasOwnProperty('size'))
						config.fontSize = group.text.size;
					if(group.text.hasOwnProperty('font'))
						config.fontFamily = group.text.font;
					if(group.text.hasOwnProperty('justification'))
						config.align = group.text.justification;
					if(group.text.hasOwnProperty('style'))
						config.style = group.text.style;
					if(group.hasOwnProperty('rect')){
						if(group.rect.hasOwnProperty('width'))
							config.x = group.rect.width/2;
						if(group.rect.hasOwnProperty('height'))
							config.y = group.rect.height/2;
					}
				}
				if(group.hasOwnProperty('shadow')){
					if(group.hasOwnProperty('horizontalOffsetX'))
						config.shadowOffsetX = group.shadow.horizontalOffsetX;
					if(group.hasOwnProperty('verticalOffsetY'))
						config.shadowOffsetY = group.shadow.verticalOffsetY;
					if(group.hasOwnProperty('blur'))
						config.shadowBlur = group.shadow.blur;
					if(group.hasOwnProperty('color'))
						config.shadowColor = group.shadow.color;
				}

				if(!self.selectedGroup  || (self.selectedGroup.parent === 'root' && self.selectedGroup.getMainNode())){
					self.addSubgroup();
				}else if(self.selectedGroup.getMainNode()){
					self.addSiblingGroup();
				}
				var textKO = new Kinetic.Text(self._extendConfig({
					x: 0,
					y: 0,
					textBaseline: 'middle',
					draggable: false
				}, config));

				self.selectedGroup.ko.add(textKO);
				textKO.setOffsetX(textKO.getWidth()/2);
				textKO.setOffsetY(textKO.getHeight()/2);
				if(self.selectedGroup.parent === 'root'){
					textKO.setX(self.stage.getWidth()/2);
					textKO.setY(self.stage.getHeight()/2);
				}else{
					if(!self.selectedGroup.hasOwnProperty('shapeKO') && config.x === 'auto' && config.y === 'auto'){
						self.randomPos(textKO);
					}else if(config.x === 'auto' && config.y === 'auto'){
						textKO.setX(self.selectedGroup.shapeKO.getWidth()/2);
						textKO.setY(self.selectedGroup.shapeKO.getHeight()/2);
					}
				}
				if(group.hasOwnProperty('shapeKO'))
					textKO.shadowOpacity(0);


				self.selectedGroup.originalSize.width = textKO.getWidth();
				self.selectedGroup.originalSize.height = textKO.getHeight();
				self.selectedGroup.text.ko = textKO;
				self.selectedGroup.kineticToGroup();
				//self.selectedGroup.applyGroupValues();
				self.mainLayer.batchDraw();
			};

			this.addShape = function(group){
				var shape;
				var self = this;
				//use underscore 
				var config = { 
					'x': 'auto',
					'y': 'auto',
					'width': 'auto',
					'height': 'auto',
					'curve': 0,
					'fill': '#000000ff',
					'stroke': '#ffffffff',
					'padding': 0,
					'resizingMask': 0
				};
				//if(group){
				if(group.hasOwnProperty('color'))
					config.fill = group.color;
				if(group.hasOwnProperty('curve'))
					config.curve = group.curve;
				if(group.hasOwnProperty('padding'))
					config.padding = group.padding;
				if(group.hasOwnProperty('rotation'))
					config.rotation = group.rotation;
				if (group.hasOwnProperty('resizingMask'))
					config.resizingMask = group.resizingMask;
				if(group.hasOwnProperty('alpha'))
					config.alpha = group.alpha;
				if(group.hasOwnProperty('stroke')){
					if (group.stroke.hasOwnProperty('color'))
						config.stroke = group.stroke.color;
					if (group.stroke.hasOwnProperty('width'))
						config.width = group.stroke.width;
				}
				if(group.hasOwnProperty('rect')){
					if(group.rect.hasOwnProperty('width')){
						config.width = group.rect.width;
						if(group.rect.width != 'auto') 
							config.x = group.rect.width/2;
					}
					if(group.rect.hasOwnProperty('height')){
						config.height = group.rect.height;
						if(group.rect.height != 'auto') 
							config.y = group.rect.height/2;
					}
				}
				if(group.hasOwnProperty('shadow')){
					if(group.shadow.hasOwnProperty('horizontalOffsetX'))
						config.shadowOffsetX = group.shadow.horizontalOffsetX;
					if(group.shadow.hasOwnProperty('verticalOffsetY'))
						config.shadowOffsetY = group.shadow.verticalOffsetY;
					if(group.shadow.hasOwnProperty('blur'))
						config.shadowBlur = group.shadow.blur;
					if(group.shadow.hasOwnProperty('color'))
						config.shadowColor = group.shadow.color;
				}



				if(!self.selectedGroup  || (self.selectedGroup.parent === 'root' && self.selectedGroup.shapeKO)){
					self.addSubgroup();
				}else if(self.selectedGroup.shapeKO){
					self.addSiblingGroup();
				}
				if(config.width === 'auto' || config.height === 'auto'){
					if(self.selectedGroup.getMainNode() ){
						config.width = self.selectedGroup.getMainNode().getWidth() + 2*self.selectedGroup.padding;
						config.height = self.selectedGroup.getMainNode().getHeight();
					}else{
						var max = self.stage.getWidth() * .75;
						var min = self.stage.getWidth() * .1;
						config.width = Math.floor(Math.random() * (max - min) + min);
						max = self.stage.getHeight() * .75;
						min = self.stage.getHeight() * .1;
						config.height = Math.floor(Math.random() * (max - min) + min);
					}
				}

				if(group.hasOwnProperty('gradient')){
					var colorStops = [0, 'gray', 1, 'black'];
					if(group.gradient.hasOwnProperty('colors') && group.gradient.hasOwnProperty('colorStops')){
						if(group.gradient.colors.length > 0 && group.gradient.colorStops.length > 0)
							colorStops = [];
						for(var i = 0; i < group.gradient.colors.length && i < group.gradient.colorStops.length; i++){
							colorStops.push(group.gradient.colorStops[i]);
							colorStops.push(group.gradient.colors[i]);
						}
					}

					var startPointX;
					var startPointY;
					var endPointX;
					var endPointY;
					var startAndEndPoints = [
						[0, config.height/2, config.width, config.height/2], //linear horizontal rect
						[config.width/2, 0, config.width/2, config.height],  //linear vertical rect
						[-config.width/2, 0, config.width/2, 0], //linear horizontal ellipse
						[0, -config.height/2, 0, config.height/2], //linear vertical ellipse
						[config.width/2, config.height/2, config.width, config.height] //radial
						];
					var gradientType = 0; 
					if(!group.gradient.hasOwnProperty('startX') || !group.gradient.hasOwnProperty('startY') || !group.gradient.hasOwnProperty('endX') || !group.gradient.hasOwnProperty('endY')){
							if(group.gradient.direction === 'linear-horizontal')
								gradientType = 0;
							if(group.gradient.direction === 'linear-vertical')
								gradientType = 1;
							if(config.curve === -1)
								gradientType = gradientType + 2;
							if(group.gradient.direction === 'radial')
								gradientType = 4;
							startPointX = startAndEndPoints[gradientType][0];
							startPointY = startAndEndPoints[gradientType][1];
							endPointX = startAndEndPoints[gradientType][2];
							endPointY = startAndEndPoints[gradientType][3];
					}else{
							startPointX = group.gradient.startX;
							startPointY = group.gradient.startY;
							endPointX = group.gradient.endX;
							endPointY = group.gradient.endY;
					}
					
					if (group.gradient.hasOwnProperty('direction')) {
						if(group.gradient.direction === 'linear-vertical' || group.gradient.direction === 'linear-horizontal'){
							config.fillLinearGradientStartPoint = {'x':startPointX, 'y': startPointY};
							config.fillLinearGradientEndPoint = {'x': endPointX, 'y':endPointY};
							config.fillLinearGradientColorStops = colorStops;
							config.fillPriority = 'linear-gradient';
						} else if(group.gradient.direction === 'radial'){
							var rad ;
							if(config.height > config.width)
								rad = config.height/2;
							else
								rad = config.width/2;
							config.fillRadialGradientStartRadius = 3;
							config.fillRadialGradientEndRadius = rad;
							if(config.curve >= 0){
								config.fillRadialGradientStartPoint = {'x':config.width/2, 'y': config.height/2};
								config.fillRadialGradientEndPoint = {'x': config.width/2, 'y':config.height/2};
							}
							config.fillRadialGradientColorStops = colorStops;
							config.fillPriority = 'radial-gradient';
						}else{
							config.fillPriority = 'color';
						}
					}
				}else{
					//fix later
					group.gradient = {};
					group.gradient.direction = 'none';
				}
				console.log(config.width, config.height);
				if (config.curve>=0){
					shape = new Kinetic.Shape(self._extendConfig({
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
					}, config));
					shape.setOffsetX(shape.getWidth()/2);
					shape.setOffsetY(shape.getHeight()/2);
				}else if (config.curve == -1){
					shape = new Kinetic.Ellipse(self._extendConfig({
						radius: {x: config.width/2, y:config.height/2},
						x: 0,
						y: 0,
						strokeWidth: 2,
						draggable:false								
					}, config));
				}

				self.selectedGroup.ko.add(shape);
				if(self.selectedGroup.parent === 'root'){
					shape.setX(self.stage.getWidth()/2);
					shape.setY(self.stage.getHeight()/2);
				}else{
					if(!self.selectedGroup.getMainNode() && config.x === 'auto' && config.y === 'auto'){
						self.randomPos(shape);
					}else if(config.x === 'auto' && config.y === 'auto'){
						shape.setX(self.selectedGroup.getMainNode().getWidth()/2);
						shape.setY(self.selectedGroup.getMainNode().getHeight()/2);
					}
				}

				if(self.selectedGroup.getMainNode()){
					var node = self.selectedGroup.getMainNode();
					if(node.hasShadow() && !shape.hasShadow()){
						shape.shadowOpacity(node.shadowOpacity());
						shape.shadowOffsetX(node.shadowOffsetX());
						shape.shadowOffsetY(node.shadowOffsetY());
						shape.shadowBlur(node.shadowBlur());
						shape.shadowColor(node.shadowColor());
					}
					node.shadowOpacity(0);
				}

				self.selectedGroup.copyValues(group);
				//shape.setOffsetY(height/2);
				
				self.selectedGroup.originalSize.width = shape.getWidth();
				self.selectedGroup.originalSize.height = shape.getHeight();

				self.selectedGroup.shapeKO = shape;
				/*
				self.selectedGroup.curve = config.curve;
				self.selectedGroup.resizingMask = config.resizingMask;
				self.selectedGroup.gradient.direction = group.gradient.direction;*/
				self.selectedGroup.kineticToGroup();
				self.selectedGroup.updateMargins();
				//apply shadow to group
				self.relayer(self.selectedGroup);
				self.mainLayer.batchDraw();			
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

			//EDIT
			this.reorder = function(newParent, group){
				if (newParent != 'root' && group != 'root'){
					//check if group is root group
					if(group.parent === 'root'){

					}else{
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
				if(this.hasOwnProperty('rootGroup'))
						this.groupScale(this.rootGroup, diffX, diffY);
			};

			this.groupScale = function(group, diffX, diffY){
				//group.resizingMask
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
							if(group.shapeKO.getWidth() + diffX > group.originalSize.width && (distanceRight >= group.margins.right || diffX < 0)){//&& distanceLeft <= group.margins.left && distanceRight >= group.margins.right 
								group.editShape({'width': group.shapeKO.getWidth() + diffX} );
								group.ko.setX(group.ko.x() + diffX/2 );	
							}
						}
						//3
						else if(flexLeft && flexWidth && !flexRight){
							if(group.shapeKO.getWidth() + diffX/2 > group.originalSize.width && (distanceRight >= group.margins.right || diffX < 0)){//&& distanceRight>group.margins.right
								group.editShape({'width': group.shapeKO.getWidth() + diffX/2} );
								group.ko.setX(group.ko.x() + diffX/2 );
							}
						}
						//4 = default behaviour				
						//5
						else if(flexLeft && !flexWidth && flexRight){
							group.ko.setX(group.ko.x() + diffX/2 );
						}
						//6
						else if(!flexLeft && flexWidth && flexRight){
							if(group.shapeKO.getWidth() + diffX/2 > group.originalSize.width ){//&& distanceLeft>group.margins.left
								group.editShape({'width': group.shapeKO.getWidth() + diffX/2} );
								group.ko.setX(group.ko.x() + diffX/4 );
							}
						}
						//7
						else if(flexLeft && flexWidth && flexRight){
							if(group.shapeKO.getWidth() + diffX/3 > group.originalSize.width){
								group.editShape({'width': group.shapeKO.getWidth() + diffX/3} );
								group.ko.setX(group.ko.x() + diffX/3 );
							}
						}

						//height
						//8
						if(flexTop && !flexHeight && !flexBottom ){//&& distanceBottom >group.margins.top
							group.ko.setY(group.ko.y() + diffY );
						}
						//16
						else if(!flexTop && flexHeight && !flexBottom ){
							if(group.shapeKO.getHeight() + diffY > group.originalSize.height && (distanceBottom >= group.margins.bottom || diffX < 0)){ // && distanceBottom > group.margins.bottom && distanceTop > group.margins.top
								group.editShape({'height': group.shapeKO.getHeight() + diffY} );
								group.ko.setY(group.ko.y() + diffY/2 );	
							}
						}
						//24
						else if(flexTop && flexHeight && !flexBottom ){//&& distanceBottom > group.margins.bottom
							if(group.shapeKO.getHeight() + diffY/2 > group.originalSize.height  && (distanceBottom >= group.margins.bottom || diffX < 0)){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/2} );
								group.ko.setY(group.ko.y() + diffY/2 );
							}
						}
						//32 = default behaviour				
						//40
						else if(flexTop && !flexHeight && flexBottom){
							group.ko.setY(group.ko.y() + diffY/2 );
						}
						//48
						else if(!flexTop && flexHeight && flexBottom ){//&& distanceTop > group.margins.top
							if(group.shapeKO.getHeight() + diffY/2 > group.originalSize.height){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/2} );
								group.ko.setY(group.ko.y() + diffY/4 );
							}
						}
						//56
						else if(flexTop && flexHeight && flexBottom){
							if(group.shapeKO.getHeight() + diffY/3 > group.originalSize.height){
								group.editShape({'height': group.shapeKO.getHeight() + diffY/3} );
								group.ko.setY(group.ko.y() + diffY/3 );
							}
						}
					};
					if(group.getMainNode())
					 	group.scaleMainNode(diffX, diffY);
					if (group.hasOwnProperty('subgroups')) {
						for(var i = 0; i < group.subgroups.length; i++){
							this.groupScale(group.subgroups[i], diffX, diffY);
						}
					}
				}
			};

			this.save=function(){
				//go through each node delete all kinetic objects
			};

			//takes in an array of groups and renders them into the canvas
			this.load=function(group){
				this.addSubgroup(group);
				var newGroup = this.selectedGroup;				
				if(group.hasOwnProperty('color')){
					//check if color is rgba or hex
					if(newGroup.color[0] == '#')
						newGroup.color = this.hexToRGBAString(newGroup.color, newGroup.alpha || 0);
					this.addShape(newGroup);
				}
				if(group.hasOwnProperty('image')){
					if(group.image.hasOwnProperty('imageId'))
						this.addImage(newGroup.image.imageId, newGroup);
					else if(group.image.hasOwnProperty('url'))
						this.addImage(newGroup.image.url, newGroup);
				}else if(group.hasOwnProperty('text')){
					this.addText(newGroup);
				}
				if (group.hasOwnProperty('subgroups') ) {
					for(var i = 0; i < group.subgroups.length; i++){
						this.load(group.subgroups[i]);
						this.selectedGroup = newGroup;
					}
				}
			}; 

			this.relayer = function(group){
				//used to fix image layers since load time takes it out of order
				if (group.hasOwnProperty('ko')) {
					if(group.ko.hasOwnProperty('children')){
						if(group.getMainNode())
							group.getMainNode().moveToBottom();
						if(group.hasOwnProperty('shapeKO'))
							group.shapeKO.moveToBottom();
					}
				};
			}

		};
	};



	
	// Requirements - jquery, kinetic.js, rgbcolor.js, canvg.js
	// rgbcolor and canvg need to be shimmed
	/* global define:false, $:false, Kinetic: false */
	if(typeof define === "function" && define.amd) {
		// AMD
		//"rgbcolor", "canvg"
		define("sandbox", ["jquery", "kinetic", "p", "underscore"], function($, Kinetic) { return factory($, Kinetic); });
	}
	else {
		// Global
		window.Sandbox = factory($, Kinetic);
	}
})();

