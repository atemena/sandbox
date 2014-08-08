// sandbox.js - creates a Kinetic stage for allowing the user to manipulate backgrounds, stickers, and text
(function(){
	"use strict";

	var Group = function(x,y,width,height, config){
		this.ko;
		this.shapeKO;
		this.shapeWidth;
		this.shapeHeight;
		this.rect = {'x':x, 'y':y,'width':width, 'height':height};
		this.parent;
		this.color='#00000000';
		this.padding = 60;
		this.curve = 0;
		this.rotation = 0;
		this.resizingMask = 0;
		this.stroke = {color: '#00000000', width:0};
		this.gradient = {colors:[], direction:'vertical', colorStops:[]};
		this.alpha;
		this.shadow;
		this.image = new Img();
		this.text = new Txt();
		this.subgroups = []; //contains image text shape and sublayers

		this.rotate = function(rotation){
			if(this.ko.getParent().getClassName() === 'Group' ){
				if(!rotation)
					rotation = 0;
				this.ko.setRotationDeg(parseFloat(rotation));
				canvas.mainLayer.batchDraw();
			}
			
		};
		this.textColor = function(color){
			if(this.text.ko){
				this.text.ko.fill(color);
				canvas.mainLayer.batchDraw();
			}
		}
		this.textFont = function(font){
			if(this.text.ko){
				this.text.ko.fontFamily(font);
				canvas.mainLayer.batchDraw();
			}
		}
		this.textContent = function(text){
			if(this.text.ko){
				this.text.ko.text(text);
				canvas.mainLayer.batchDraw();
			}
		}
		this.textAlign = function(align){
			if(this.text.ko){
				this.text.ko.align(align);
				canvas.mainLayer.batchDraw();
			}
		}
		this.textSize = function(size){
			if(this.text.ko){
				this.text.ko.fontSize(size);
				canvas.mainLayer.batchDraw();
			}
		}
		this.vcenter = function() {
			if(self.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				var stageHeight = canvas.stage.getHeight();
				this.ko.setY(stageHeight/2);
				canvas.mainLayer.batchDraw();
			}
		};

		this.hcenter = function() {
			if(self.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				var stageWidth = canvas.stage.getWidth();
				this.ko.setX(stageWidth/2);
				canvas.mainLayer.batchDraw();
			}
		};

		this.moveUp = function() {
			if(self.selectedGroup.ko.getParent().getClassName() === 'Group' ){
				this.ko.moveUp();
				canvas.mainLayer.batchDraw();
			}
		};

		this.moveDown = function() {
			if(self.selectedGroup.ko.getParent().getClassName() === 'Group' ){
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
			}
		};
		this.editShape=function(config){
			if(this.shapeKO){
				var newShape;
				if (!config.hasOwnProperty('width'))
					config.width = this.shapeWidth;
				if(!config.hasOwnProperty('height'))
					config.height = this.shapeHeight;
				if(!config.hasOwnProperty('curve'))
					config.curve = this.curve;
				if(!config.hasOwnProperty('fill'))
					config.fill = this.fill;
				if(!config.hasOwnProperty('stroke'))
					config.stroke = this.stroke;
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
						x: 0,
						y: 0,
						fill: config.fill,
						stroke: config.stroke,
						strokeWidth: config.strokeWidth,
						draggable:false								
					}));
				}

				this.ko.add(newShape);
				//delete and remove ko object
				this.shapeKO.destroy();
				this.shapeKO = newShape;
				this.shapeKO.moveToBottom();
				this.shapeWidth = config.width;
				this.shapeHeight = config.height;
				this.fill = config.fill;
				this.stroke = config.stroke;
				this.strokeColor = config.strokeColor;
				this.curve = config.curve;

				canvas.mainLayer.batchDraw();
			}
		};
		
		this.getValues = function(){
			this.shapeWidth = this.shapeKO.getWidth();
			this.shapeHeight =  this.shapeKO.getHeight();
			this.color = this.shapeKO.getFill();
			this.rotation = this.ko.rotation();
			this.stroke = {color: this.shapeKO.stroke, width:this.shapeKO.strokeWidth};
			this.alpha = this.shapeKO.getAlpha();
			this.shadow = {}; // TODO: filll in later
		}
		/*
		this.applyValues = function(){
			this.shapeKO.getWidth() = this.shapeWidth;
			this.shapeKO.getHeight() = this.shapeHeight; 
			this.shapeKO.getFill() = this.color;
			this.ko.rotation() = this.rotation;
			this.ko.strokecolor: this.shapeKO.stroke, width:this.shapeKO.strokeWidth}  = this.stroke;
			this.shapeKO.getAlpha()   = this.alpha;
			{}   = this.shadow; // TODO: filll in later
		}*/

		this.updateRect = function(){
			//function to find left and upper bound, width and height, after adding picture, text, or shape
			//then updates this.rect
			//go through children and see if highest most left most right or lowest

			var data = {'mostLeft': Infinity, 'mostRight': 0, 'highest': 0, 'lowest': Infinity};
			var data = this.findRect(this.ko, data);
			this.rect.x = this.ko.getX();
			this.rect.y = data.ko.getY();
			this.rect.width = data.mostRight - data.mostLeft;
			this.rect.height = data.lowest - data.highest;
		}

		this.findRect = function(node, data){
			var i = 0;
			var child;
			var offsetX;
			var offsetY;
			while(i < node.children.length){
				if(node.children[i].getClassName() === 'Group'){
					data = this.findRect(this.children[i], data);
				}else{
					child = node.children[i];
					if(child.getClassName() === 'Ellipse'){
						offsetX = child.getRadius().x;
						offsetY = child.getRadius().y;
					}else{
						offsetX = child.getOffsetX();
						offsetY = child.getOffsetY();
					}

					if (data.mostLeft > (child.getAbsolutePosition().x - offsetX))
						data.mostLeft = child.getAbsolutePosition().x - offsetX;
					if (data.mostRight < (child.getAbsolutePosition().x - offsetX))
						data.mostRight = child.getAbsolutePosition().x + (child.getWidth() - offsetX);
					if (data.highest < (child.getAbsolutePosition().y - offsetY))
						data.highest = child.getAbsolutePosition().y - offsetY;
					if (data.lowest > (child.getAbsolutePosition().y - offsetY))
						data.lowest = child.getAbsolutePosition().y + (child.getHeight() - offsetY);
				}
				i = 1+i;
			}
			return data;
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
			if(this.parent.ko.getParent().getClassName() !== 'layer'){
				var newParent = this.parent.ko.getParent();
				this.ko.remove();
				newParent.add(this.ko);
				//update subgroups and parents
			}
		};
		
	};


	// add defaults
	var Img = function(){
		this.ko;
		this.imageId;
		this.url;
		this.tint;
		this.model;
	};

	// add defaults
	var Txt = function(){
		this.ko;
		this.content;
		this.size;
		this.font;
		this.justification;
		this.style;
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
			this.rootGroup = new Group(0, 0, this.stage.getWidth(), this.stage.getHeight());
			this.rootGroup.ko = new Kinetic.Group({draggable:false, x:0, y:0});
			this.rootGroup.ko.add(new Kinetic.Rect({
					x: 0,
					y: 0,
					width: this.stage.attrs.width,
					height: this.stage.attrs.height,
					stroke: 'black',
					strokeWidth: 1
				}));
			this.stage.add(this.mainLayer);
			this.mainLayer.add(this.rootGroup.ko);
			this.mainLayer.batchDraw();
			this.selectedGroup = this.rootGroup;
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

			//parents affect children, children do not affect parent
			this.addSubgroup = function(group){
				var self = this;
				var newGroup;
				if(!group){
					newGroup = new Group(0, 0, self.stage.getWidth(), self.stage.getHeight());
				}
				else{
					newGroup = new Group(group.rect.x, group.rect.y, group.rect.width, group.rect.height);
					newGroup.copyValues(group);
				}
				if(self.selectedGroup){
					newGroup.ko = new Kinetic.Group({
						draggable: true,
						x: newGroup.rect.x,
						y: newGroup.rect.y
					});
					self.selectedGroup.ko.add(newGroup.ko);
					newGroup.parent = self.selectedGroup;
					self.selectedGroup.subgroups.push(newGroup);
					self.selectedGroup = newGroup;
					self.selectedGroup.ko.on('mouseup dragstart', function() { self._selectGroup(newGroup); this.updateRect(); });
					self.selectedGroup.ko.on('mouseout', function() { document.body.style.cursor = 'auto'; });
					self.selectedGroup.ko.on('mouseover', function() { document.body.style.cursor = 'move'; });
				}
			};

			//siblings are free from one another
			this.addSiblingGroup = function(group){
				var self = this;
				if(!group){
					var group = new Group(0, 0, self.stage.getWidth(), self.stage.getHeight());
				}
				if(self.selectedGroup){
					if(self.selectedGroup.ko.getParent()){
						group.ko = new Kinetic.Group({
							draggable: true,
							x: group.rect.x,
							y: group.rect.y
						});
						self.selectedGroup.ko.getParent().add(group.ko);
						group.parent = self.selectedGroup.parent;
						self.selectedGroup.parent.subgroups.push(group);
						self.selectedGroup = group;
						self.selectedGroup.ko.on('mouseup dragstart', function() { self._selectGroup(group); this.updateRect() });
						self.selectedGroup.ko.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						self.selectedGroup.ko.on('mouseover', function() { document.body.style.cursor = 'move'; });
					}
				}
			};

			this.addImage = function(imageId, config){
				if(this.selectedGroup){
					var self = this;
					var newImage = new Image();
					var url=imageId;

					if(self.selectedGroup.ko.getParent().getClassName() !== 'Group' ){
						self.addSubgroup();
					}else if(self.selectedGroup.getMainNode()){
						self.addSiblingGroup();
					}
					// In case of an event object
					//if(typeof url !== 'string')
						//url = url.target.src;
						//check for img.id first then check img.url
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
						newImage.onload = function() {
							var imageKO = new Kinetic.Image(self._extendConfig({
								image: newImage,
								x: 0,//self.selectedGroup.rect.x + newImage.width/2,
								y: 0,//self.selectedGroup.rect.y + newImage.height/2,
								draggable: false,
							}, config));
							
							imageKO.offsetX(newImage.width/2);
							imageKO.offsetY(newImage.height/2);
							if(!self.selectedGroup.shapeKO){
								var max = self.stage.getWidth() - imageKO.getWidth()/2;
								var min = imageKO.getWidth()/2;
								var absX = Math.floor(Math.random() * (max - min) + min);
								max = self.stage.getHeight() - imageKO.getHeight()/2;
								min = imageKO.getHeight()/2;
								var absY = Math.floor(Math.random() * (max - min) + min);
								self.selectedGroup.ko.setAbsolutePosition({'x': absX, 'y':absY});
							}
							
							self.selectedGroup.ko.add(imageKO);

							self.selectedGroup.updateRect();
							self.selectedGroup.image.url = newImage.src;
							self.selectedGroup.image.ko = imageKO;
							//this.selectedGroup.applyGroupValues();
							self.mainLayer.batchDraw();
						}
					}
					if(url.substr(0, 5) !== 'data:')
						newImage.crossOrigin = "Anonymous";
					newImage.src = url;
				}
			};

			this.addText = function(str, config){
				if(this.selectedGroup){
					var self = this;
					if(self.selectedGroup.ko.getParent().getClassName() !== 'Group' ){
						self.addSubgroup();
					}else if(this.selectedGroup.getMainNode()){
						self.addSiblingGroup();
					}
					var textKO = new Kinetic.Text(self._extendConfig({
						x: 0,
						y: 0,
						text: str,
						textBaseline: 'middle',
						draggable: false
					}, config));

					textKO.setOffsetX(textKO.getWidth()/2);
					textKO.setOffsetY(textKO.getHeight()/2);
					if(!self.selectedGroup.shapeKO){
						var max = self.stage.getWidth() - textKO.getWidth()/2;
						var min = textKO.getWidth()/2;
						var absX = Math.floor(Math.random() * (max - min) + min);
						max = self.stage.getHeight() - textKO.getHeight()/2;
						min = textKO.getHeight()/2
						var absY = Math.floor(Math.random() * (max - min) + min);
						self.selectedGroup.ko.setAbsolutePosition({'x': absX, 'y':absY});
					}else{
						//resize shape
					}

					self.selectedGroup.ko.add(textKO);
					self.selectedGroup.updateRect();
					self.selectedGroup.text.ko = textKO;
					//self.selectedGroup.applyGroupValues();
					self.mainLayer.batchDraw();
				}
			};

			this.addShape = function(width, height, curve, config){
				if(this.selectedGroup){
					var shape;
					var self = this;
					if(self.selectedGroup.ko.getParent().getClassName() !== 'Group' ){
						self.addSubgroup();
					}else if(this.selectedGroup.shapeKO){
						self.addSiblingGroup();
					}
					if(width === 'auto' || height === 'auto'){
						if(self.selectedGroup.getMainNode() ){
							width = self.selectedGroup.getMainNode().getWidth() + 2*self.selectedGroup.padding;
							height = self.selectedGroup.getMainNode().getHeight() + 20;
						}else{
							var max = self.stage.getWidth() * .75;
							var min = self.stage.getWidth() * .1;
							width = Math.floor(Math.random() * (max - min) + min);
							max = self.stage.getHeight() * .75;
							min = self.stage.getHeight() * .1;
							height = Math.floor(Math.random() * (max - min) + min);
						}
					}
					
					if (curve>=0 || !curve){
						shape = new Kinetic.Shape(self._extendConfig({
							sceneFunc: function(context){
								context.beginPath();
								context.moveTo(curve, 0);
								context.lineTo(width-curve, 0);
								context.quadraticCurveTo(width, 0, width, curve);
								context.lineTo(width, height-curve);
								context.quadraticCurveTo(width, height, width-curve, height);
								context.lineTo(curve, height);
								context.quadraticCurveTo(0, height, 0, height-curve);
								context.lineTo(0, curve);
								context.quadraticCurveTo(0, 0, curve,0);
								context.fillStrokeShape(this); //for fill and stroke
							},
							stroke: "rgba(0,0,0,1)",
							strokeWidth: 8,
							draggable:false,
							width: width,
							height: height
						}, config));
						shape.setOffsetX(shape.getWidth()/2);
						shape.setOffsetY(shape.getHeight()/2);
					}else if (curve == -1){
						shape = new Kinetic.Ellipse(self._extendConfig({
							radius: {x: width/2, y:height/2},
							x: 0,
							y: 0,
							strokeWidth: 2,
							draggable:false								
						}));
					}
					if(self.selectedGroup.getMainNode() ){
						shape.setX(self.selectedGroup.getMainNode().getX());
						shape.setY(self.selectedGroup.getMainNode().getY());
					}else{
						var max = self.stage.getWidth() - shape.getWidth()/2;
						var min = shape.getWidth()/2;
						var absX = Math.floor(Math.random() * (max - min) + min);
						max = self.stage.getHeight() - shape.getHeight()/2;
						min = shape.getHeight()/2
						var absY = Math.floor(Math.random() * (max - min) + min);
						self.selectedGroup.ko.setAbsolutePosition({'x': absX, 'y':absY});
					}


					//shape.setOffsetY(height/2);
					self.selectedGroup.ko.add(shape);
					shape.moveToBottom();
					self.selectedGroup.updateRect();
					self.selectedGroup.shapeKO = shape;
					self.selectedGroup.curve = curve;
					//self.selectedGroup.applyGroupValues();
					self.mainLayer.batchDraw();
				};						
			};

			//EDIT

			//update multiple selected Layers
			this.reorder = function(newParent, group){
				
				if(group !== rootGroup){
					//update ko
					group.remove();
					newParent.ko.add(group);

					//update old parents object
					for(var i = 0; i < group.parent.subgroups.length; i++){
						if(group.parent.subgroups[i] === group)
							group.parent.subgroups.splice(i, 1);
					}

					//update group object
					group.parent = newParent;

					//update newparent object 
					newParent.subgroups.push(group)
				}
			};

			//locks all selected into a child of a new parent group
			this.group = function(){
				//add all end children to an array then add to a new parent. add that parent to the parent of the highest node and delete everything else
				if(this.selectedGroup){
					//update kos
					var parent = this.selectedGroup.getParent();
					var children = this.dismantle(this.selectedGroup);
					this.selectGroup(parent);
					this.addSubgroup();
					this.selectedGroup.add(children); 
					//for each child remove from kinetic parent and add to this.selectedGroup.ko
					//for(var i = 0; i < this.selectedGroup.){}
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

			this.delete=function(nodeType){
				//can delete either single node or all children
				/*if(nodeType === 'main')

				if(nodeType === 'shape')

				if(nodeType === 'subgroups')*/
			};
			
			this.scale=function(widthScale, heightScale){
				//var mask = this.selectedGroup.
				/*
				masks
				0 - No resizing capability
				1 - flexible left margin
				2 - flexible width
				4 - flexible right margin
				8 - flexible top margin
				16 - flexible height
				32 - flexible bottom margin
				

				if (mask >= 32){
					mask = mask-32;
					//rescale bottom margin
				};
				if (mask >= 16){
					mask = mask-16;
					//flexible height
				};
				if (mask >= 8){
					mask = mask-8;

				}
				if (mask >= 4){
					mask = mask-4;

				}
				if (mask >= 2){
					mask = mask-2;

				}
				if (mask >= 1){
					
				}*/

			};

			//saves enitre file into an image or JSON
			this.save=function(){
				//delete all ko objects?
				//change color formats?
				return rootGroup;
			};

			//takes in an array of groups and renders them into the canvas
			this.load=function(group){
				//add current group / image or text/ shape use config
				//if(!group.hasOwnProperty('parent')){
					//this.rootGroup = new Group(group.rect.x, group.rect.y, group.rect.width, group.rect.height);
					//set scale here
				//}else{
					this.addSubgroup(group);
					var newGroup = this.selectedGroup;
					var config = {};
					//shape
					if(group.hasOwnProperty('color'))
						config.fill = group.color;
					if(group.hasOwnProperty('padding'))
						config.padding = group.padding;
					if(group.hasOwnProperty('rotation'))
						config.rotation = group.rotation;
					if(group.hasOwnProperty('stroke')){
						if (group.stroke.hasOwnProperty('stroke'))
							config.stroke = group.stroke.color;
						if (group.stroke.hasOwnProperty('width'))
							config.width = group.stroke.width;
					}
					if(group.hasOwnProperty('alpha'))
						config.alpha = group.alpha;					
					if(group.rect){
						newGroup.shapeKO = this.addShape(group.rect.width, group.rect.height, group.curve, config);
						//newGroup.getValues();
					}
					if(group.image){
						var config = {
							'fill': group.image.tint
						};
						if(group.image.hasOwnProperty('imageId')){
							this.addImage(group.image.imageId, config);
						}else if(group.image.hasOwnProperty('url')){
							this.addImage(group.image.url, config);
						}
						newGroup.image.imageId = group.image.imageId;
						newGroup.image.tint = group.image.tint;
						newGroup.image.mode = group.image.mode;
					}else if(group.text){
						var config = {};
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
						
						this.addText(group.text.content, config);
						newGroup.text.content = group.text.content;
						newGroup.text.size = group.text.size;
						newGroup.text.font = group.text.font;
						newGroup.text.justification = group.text.justification;
						newGroup.text.style = group.text.style;

					}
				//}
				if (group.hasOwnProperty('subgroups')) {
					for(var i = 0; i < group.subgroups.length; i++){
						this.load(group.subgroups[i]);
					}
				}
			};
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

