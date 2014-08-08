// sandbox.js - creates a Kinetic stage for allowing the user to manipulate backgrounds, stickers, and text
(function(){
	"use strict";

	var Group = function(group){
		this.rect = {'x':0, 'y':0,'width': 0, 'height': 0};
		this.stroke = {color: '#00000000', width:0};
		this.color='#00000000';
		this.gradient = {colors:[], direction:'vertical', colorStops:[]};
		this.padding = 0;
		this.curve = 0;
		this.alpha;
		this.rotation = 0;
		this.resizingMask = 0;
		this.shadow;
		this.image = new Img();
		this.text = new Txt();
		this.subgroups = []; //contains image text shape and sublayers
		this.name;

		//temp variables
		this.ko;
		this.shapeKO;
		this.parent;
		this.originalSize = {'width': 0, 'height':0};
		this.margins = {'left': 0, 'right': 0, 'top': 0, 'bottom': 0}; //necessary?

		//copys values from another group object
		this.copyValues = function(group){
			if(group.hasOwnProperty('name'))
				this.name = group.name;
			if(group.hasOwnProperty('rect')){
				if(group.rect.hasOwnProperty('x'))
					this.rect.x = group.rect.x;
				if(group.rect.hasOwnProperty('y'))
					this.rect.y = group.rect.y;
				if(group.rect.hasOwnProperty('width'))
					this.rect.width = group.rect.width;
				if(group.rect.hasOwnProperty('height'))
					this.rect.height = group.rect.height;
			}
			if(group.hasOwnProperty('color'))
				this.color = group.color;
			if(group.hasOwnProperty('padding'))
				this.padding = group.padding;
			if(group.hasOwnProperty('curve'))
				this.curve = group.curve;
			if(group.hasOwnProperty('rotation'))
				this.rotation = group.rotation;
			if(group.hasOwnProperty('resizingMask'))
				this.resizingMask = group.resizingMask;
			if(group.hasOwnProperty('stroke'))
				this.stroke = group.stroke;
			if(group.hasOwnProperty('gradient'))
				this.gradient = group.gradient;
			if(group.hasOwnProperty('alpha'))
				this.alpha = group.alpha;
			if(group.hasOwnProperty('shadow'))
				this.shadow = group.shadow;
			if(group.hasOwnProperty('image'))
				this.image.copyValues(group.image);
			if(group.hasOwnProperty('text'))
				this.text.copyValues(group.text);
		};

		//updates values of group to match the kinetic object
		this.kineticToGroup = function(){
			this.updateRect();
			if(this.hasOwnProperty('shapeKO')){
				this.color = this.shapeKO.fill();
				this.rotation = this.shapeKO.rotation();
				this.stroke = {'color':this.shapeKO.stroke(), 'width':this.shapeKO.strokeWidth()};
				this.alpha = this.shapeKO.fillAlpha();
				//shadow this. = this.ko.shapeKO.;
				//gradient this. = this.ko.shapeKO.;
			}
			if(this.getMainNode()){
				if(this.getMainNode().getClassName() === 'Image')
					this.image.kineticToImg();
				else if (this.getMainNode().getClassName() === 'Text')
					this.text.kineticToTxt();
			}
		};

		this.groupToKinetic = function(){
			this.shapeWidth = this.shapeKO.getWidth();
			this.shapeHeight =  this.shapeKO.getHeight();
			this.color = this.shapeKO.getFill();
			this.rotation = this.ko.rotation();
			this.stroke = {color: this.shapeKO.stroke, width:this.shapeKO.strokeWidth};
			this.alpha = this.shapeKO.getAlpha();
			this.shadow = {}; // TODO: filll in later
		};

		this.rotate = function(rotation){
			if(this.ko.getParent().getClassName() === 'Group' ){
				//this.ko.offset({'x': this.shapeKO.getWidth()/2, 'y': this.shapeKO.getHeight()/2})
				//make recursive and rotate by each child
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

		this.getGroupCenter = function(){
			return {'x': 0, 'y':0};
		};

		this.textColor = function(color){
			if(this.text.ko){
				this.text.ko.fill(color);
				this.color = color;
				canvas.mainLayer.batchDraw();
			}
		}
		this.textFont = function(font){
			if(this.text.ko){
				this.text.ko.fontFamily(font);
				this.text.font = font;
				if(canvas.autoSize == true && this.hasOwnProperty('shapeKO'))
					this.editShape({'width': this.text.ko.getWidth() + this.padding, 'height': this.text.ko.getHeight()});
				canvas.mainLayer.batchDraw();
			}
		}
		this.textContent = function(text){
			if(this.text.ko){
				this.text.ko.text(text);
				this.text.content = text;
				if(canvas.autoSize == true && this.hasOwnProperty('shapeKO'))
					this.editShape({'width': this.text.ko.getWidth() + this.padding, 'height': this.text.ko.getHeight()});
				canvas.mainLayer.batchDraw();
			}
		}
		this.textAlign = function(align){
			if(this.text.ko){
				this.text.ko.align(align);
				this.text.justification = align;
				canvas.mainLayer.batchDraw();
			}
		}
		this.textSize = function(size){
			if(this.text.ko){
				this.text.ko.fontSize(size);
				this.text.size = size;
				if(canvas.autoSize == true && this.hasOwnProperty('shapeKO'))
					this.editShape({'width': this.text.ko.getWidth() + this.padding, 'height': this.text.ko.getHeight()});
				canvas.mainLayer.batchDraw();
			}
		}
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


		this.shadow=function(s){
			var node;
			if(this.shapeKO){
				node = this.shapeKO;
				if(this.getMainNode()){
					this.getMainNode().shadowAlpha = 0;
					this.getMainNode().shadowOffsetX = 0;
					this.getMainNode().shadowOffsetY = 0;
				}	
			}else{
				node = this.getMainNode();
			}
			if(s.hasOwnProperty('color'))
				node.shadowColor(s.color);
			if(s.hasOwnProperty('blur'))
				node.shadowBlur(s.blur);
			if(s.hasOwnProperty('offsetX'))
				node.shadowOffsetX(s.offsetX);
			if(s.hasOwnProperty('offsetY'))
				node.shadowOffsetY(s.offsetY);
			if(s.hasOwnProperty('opacity'))
				node.shadowOpacity(s.opacity);
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
				}
			}/*
			if(this.parent === 'root'){
				canvas.scale(this.image.ko.getWidth(), this.image.ko.getHeight());
			};*/
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
				if(!config.hasOwnProperty('fill'))
					config.fill = self.color;
				if(!config.hasOwnProperty('stroke')){
					config.stroke = self.stroke.color;
					config.strokeWidth = self.stroke.width;
				}
				//add new shape
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
						fill: config.fill,
						stroke: config.stroke,
						strokeWidth: config.strokeWidth,
						draggable: false,
						width: config.width,
						height: config.height
					}));
					newShape.setOffsetX(newShape.getWidth()/2);
					newShape.setOffsetY(newShape.getHeight()/2);
				}else if (config.curve == -1){
					newShape = new Kinetic.Ellipse(canvas._extendConfig({
						radius: {x: config.width/2, y:config.height/2},
						x: self.shapeKO.getX(),
						y: self.shapeKO.getY(),
						fill: config.fill,
						stroke: config.stroke,
						strokeWidth: config.strokeWidth,
						draggable:false								
					}));
				}

				this.ko.add(newShape);
				//delete and remove ko object
				var oldWidth = this.shapeKO.getWidth();
				var oldHeight = this.shapeKO.getHeight();
				this.shapeKO.destroy();
				this.shapeKO = newShape;
				this.shapeKO.moveToBottom();
				this.scaleMainNode(newShape.getWidth()-oldWidth, newShape.getHeight()-oldHeight);

				this.shapeWidth = config.width;
				this.shapeHeight = config.height;
				this.color = config.fill;
				this.stroke.color = config.stroke;
				this.stroke.width = config.strokeWidth
				this.curve = config.curve;
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
				//this.resizeShape();
			}
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
	};


	// add defaults
	var Img = function(){
		this.ko;
		this.imageId;
		this.url;
		this.tint;
		this.mode;
		this.copyValues = function(img){
			if(img.hasOwnProperty('imageId'))
				this.imageId = img.imageId;
			if(img.hasOwnProperty('url'))
				this.url = img.url;
			if(img.hasOwnProperty('tint'))
				this.tint = img.tint;
			if(img.hasOwnProperty('mode'))
				this.mode = img.mode;
		};
		this.kineticToImg = function(){
			this.url = this.ko.getImage().src;
			//how am i going to do tint?
		};
	};

	// add defaults
	var Txt = function(){
		this.ko;
		this.content;
		this.color;
		this.size;
		this.font;
		this.justification;
		this.style;
		this.copyValues = function(txt){
			if(txt.hasOwnProperty('content'))
				this.content = txt.content;
			if(txt.hasOwnProperty('color'))
				this.color = txt.color;
			if(txt.hasOwnProperty('size'))
				this.size = txt.size;
			if(txt.hasOwnProperty('font'))
				this.font = txt.font;
			if(txt.hasOwnProperty('justification'))
				this.justification = txt.justification;
			if(txt.hasOwnProperty('style'))
				this.style = txt.style;
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
						newGroup.ko.setHeight(this.stage.getWidth);
						newGroup.rect.height = this.stage.getWidth;
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
				if(group.hasOwnProperty('alpha'))
					config.alpha = group.alpha;
					config.resizingMask = group.resizingMask;
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


				//shape.setOffsetY(height/2);
				self.selectedGroup.originalSize.width = shape.getWidth();
				self.selectedGroup.originalSize.height = shape.getHeight();
				self.selectedGroup.shapeKO = shape;
				self.selectedGroup.curve = config.curve;
				self.selectedGroup.resizingMask = config.resizingMask;
				self.selectedGroup.kineticToGroup();
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

						var zIndex = parent.ko.getZIndex();
						group.ko.remove();
						newParent.ko.add(group.ko);
						group.ko.setZIndex(zIndex + 1);
						//get absolute position of both new parent and child and 
						var newOrigin = newParent.ko.getAbsolutePosition();
						var childPos = group.ko.getAbsolutePosition();
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

			this.delete=function(){
				//get subchildren and parents
				var subgroups = this.selectedGroup.children;
				var parent = this.selectedGroup.parent;
				if(parent === 'root')
					//parent = this.selectedGroup.children[0]
				for(var i = 0; i < subgroups.length; i++){
					this.reorder(parent, subgroups[i])
				}
				//remove from parents group and this.selectedGroup.ko.remove()

			};
			
			this.scale=function(newWidth, newHeight){
				//scale whole canvas and recursively go through trees and scale each node
				var diffX = newWidth - this.stage.getWidth();
				var diffY = newHeight - this.stage.getHeight();
				this.border.setWidth(newWidth);
				this.border.setHeight(newHeight);
				this.stage.setWidth(newWidth);
				this.stage.setHeight(newHeight);
				this.groupScale(this.rootGroup, diffX, diffY);
			};

			this.groupScale = function(group, diffX, diffY){
				//group.resizingMask
				var flexLeft = (group.resizingMask & 1) === 1;
				var flexWidth = (group.resizingMask & 2)=== 2;
				var flexRight = (group.resizingMask & 4)=== 4;
				var flexTop = (group.resizingMask & 8)=== 8;
				var flexHeight = (group.resizingMask & 16) === 16;
				var flexBottom = (group.resizingMask & 32) === 32;
				if (group.resizingMask != 0) {
					//1
					if(flexLeft && !flexWidth && !flexRight){
						group.ko.setX(group.ko.x() + diffX );
					}
					//2
					else if(!flexLeft && flexWidth && !flexRight){
						if(group.shapeKO.getWidth() + diffX > group.originalSize.width){
							group.editShape({'width': group.shapeKO.getWidth() + diffX} );
							group.ko.setX(group.ko.x() + diffX/2 );	
						}
					}
					//3
					else if(flexLeft && flexWidth && !flexRight){
						if(group.shapeKO.getWidth() + diffX/2 > group.originalSize.width){
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
						if(group.shapeKO.getWidth() + diffX/2 > group.originalSize.width){
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
					if(flexTop && !flexHeight && !flexBottom){
						group.ko.setY(group.ko.y() + diffY );
					}
					//16
					else if(!flexTop && flexHeight && !flexBottom){
						if(group.shapeKO.getHeight() + diffY > group.originalSize.height){
							group.editShape({'height': group.shapeKO.getHeight() + diffY} );
							group.ko.setY(group.ko.y() + diffY/2 );	
						}
					}
					//24
					else if(flexTop && flexHeight && !flexBottom){
						if(group.shapeKO.getHeight() + diffY/2 > group.originalSize.height){
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
					else if(!flexTop && flexHeight && flexBottom){
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
			};

			this.save=function(){
				//go through each node delete all kinetic objects
			};

			//takes in an array of groups and renders them into the canvas
			this.load=function(group){
				this.addSubgroup(group);
				var newGroup = this.selectedGroup;				
				if(group.hasOwnProperty('color')){
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
				if (group.hasOwnProperty('subgroups')) {
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
		define("sandbox", ["jquery", "kinetic", "p"], function($, Kinetic) { return factory($, Kinetic); });
	}
	else {
		// Global
		window.Sandbox = factory($, Kinetic);
	}
})();

