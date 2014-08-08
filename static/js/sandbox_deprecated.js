// sandbox.js - creates a Kinetic stage for allowing the user to manipulate backgrounds, stickers, and text
(function() {
	"use strict";

	// container, width, height are required, optionally config sets extra stage parameters
	var factory = function($, Kinetic) {
		return function(container, width, height, config) {
			if(!config)
				config = {};
			config.container = container;
			config.width = width;
			config.height = height;
			this.stage = new Kinetic.Stage(config);
			this.backgroundColorLayer = new Kinetic.Layer();
			this.backgroundLayer = new Kinetic.Layer();
			this.borderLayer = new Kinetic.Layer();
			this.stickerLayer = new Kinetic.Layer();
			this.textLayer = new Kinetic.Layer();
			this.stage.add(this.backgroundColorLayer);
			this.stage.add(this.backgroundLayer);
			this.stage.add(this.borderLayer);
			this.stage.add(this.stickerLayer);
			this.stage.add(this.textLayer);
			// The selected sticker or text node. Set this to null to disable rotate etc..
			this.selectedNode = null;
			this.selectedNodeCallback = null;

			this._createEventListener = function(func) { var self = this; return function(e) { self[func](e); }; };
			this._createSettingsListener = function(name) { var self = this; return function() { self.applySettings(name); }; };

			this._extendConfig = function(config, userConfig) {
				if(userConfig) {
					for(var property in userConfig) {
						if(userConfig.hasOwnProperty(property))
							config[property] = userConfig[property];
					}
				}
				return config;
			};

			this._selectNode = function(node) {
				if(this.selectedNode !== node) {
					this.selectedNode = node;
					this.updateContext();
					if(this.selectedNodeCallback)
						this.selectedNodeCallback(node);
				}
			};

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

			// Associate elements' onclick with currentNode settings, like rotation etc..
			this.addSettings = function(name, settings) {
				console.log(name);
				console.log(settings);
			};

			this.applySettings = function(name) { 
				console.log(name);
			};

			this.updateContext = function(){
					this.updatePreview();
					this.hideButtons();
					this.showButtons();
			}

			this.updatePreview = function(){
				if(this.selectedNode){
					var node = this.selectedNode;
					if(node.getClassName() === 'Group'){
						node = node.children[1];
					}
					if(document.getElementById("preview")){
						var container = document.getElementById("preview");
						var br = document.createElement('br');
						container.innerHTML = "";
						if (node.getClassName() == "Image"){
							var img = document.createElement("img"); 
							img.src = node.getImage().src;
							img.style.width = "50px";
							container.appendChild(img);
							container.appendChild(br);
						}else if(node.getClassName() == "Text"){
							var textDiv = document.createElement("div");
							textDiv.innerHTML = node.getText();
							container.appendChild(textDiv);
							container.appendChild(br);
						}
					}
				}else{
					var container = document.getElementById("preview");
					container.innerHTML = "";
				}
			}

			this.hideButtons = function(){
				$('.shape').hide();
				$('.text').hide();
				$('.image').hide();
			};


			this.showButtons = function(){
				if(this.selectedNode){
					var node = this.selectedNode;
					if(node.getClassName() === 'Group'){
						node = node.children[1];
						$('.shape').show();
						$('.'+node.getClassName().toLowerCase() ).show();
						$('.group').hide();
					}else{
						$('.'+node.getClassName().toLowerCase() ).show();
					}
				}
			};

			this.setBackgroundColor = function(color){
				var stage = this.stage;
				var layer = this.backgroundColorLayer;
				layer.removeChildren();
				layer.add(new Kinetic.Rect({ 
					x: 0, 
					y: 0, 
					width: stage.attrs.width, 
					height: stage.attrs.height, 
					fillRed: color.r, 
					fillGreen: color.g, 
					fillBlue: color.b
				}));
				if(this.backgroundLayer.children[0] && color.a){
					this.backgroundLayer.children[0].setOpacity(1-color.a);
					this.backgroundLayer.batchDraw();
				}
				layer.batchDraw();
			};

			this.setBackground = function(url) {
				var opacity = 1;
				if(this.backgroundLayer.children[0])
					opacity = this.backgroundLayer.children[0].getOpacity();
				var image = new Image();
				var stage = this.stage;
				var layer = this.backgroundLayer;
				image.onload = function() {
					layer.removeChildren();
					layer.add(new Kinetic.Image({
						image: image,
						x: stage.attrs.width/2,
						y: stage.attrs.height/2,
						height: image.height,
						width: image.width,
						offsetX: image.width/2,
						offsetY: image.height/2,
						opacity: opacity
					}));
					layer.batchDraw();
				};
				// In case of an event object
				if(typeof url !== 'string')
					url = url.target.src;
				image.src = url;
			};

			this.setBackgroundBorder = function(color, width) {
				if(width === undefined)
					width = 1;
				this.borderLayer.removeChildren();
				this.borderLayer.add(new Kinetic.Rect({
					x: 0,
					y: 0,
					width: this.stage.attrs.width,
					height: this.stage.attrs.height,
					stroke: color,
					strokeWidth: width
				}));
				this.borderLayer.batchDraw();
			};

			this.resize = function(height, width){
				this.stage.setHeight(height);
				this.stage.setWidth(width);
				this.setBackgroundBorder('black', 2);
				//reapply background image and color to scale with canvas
				if(this.backgroundColorLayer.children[0]){
					var node = this.backgroundColorLayer.children[0];
					var color = {'r': node.fillRed(), 'g': node.fillGreen(), 'b': node.fillBlue()};
					this.setBackgroundColor(color);
				}
				if(this.backgroundLayer.children[0]){
					this.setBackground(this.backgroundLayer.children[0].getImage().src);
				}
				//TODO: add in a way to resize and re-place stickers and text
			};

			this.addSticker = function(url, config) {
				var self = this;
				var image = new Image();
				
				// In case of an event object
				if(typeof url !== 'string')
					url = url.target.src;
				if(url.slice(-4) === '.svg' || url.substr(0, 26) === 'data:image/svg+xml;base64,') {
					image.onload = function() {
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
								context.drawSvg(url, 0, 0, image.width, image.height);
							},
							x: self.stage.getWidth()/2,
							y: self.stage.getHeight()/2,
							offset: {x: image.width/2, y: image.height/2 },
							width: image.width,
							height: image.height,
							draggable: true,
							drawHitFunc: function(context) {
								context.beginPath();
								context.moveTo(0, 0);
								context.lineTo(image.width, 0);
								context.lineTo(image.width, image.height);
								context.lineTo(0, image.height);
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
					image.onload = function() {
						var sticker = new Kinetic.Image(self._extendConfig({
							image: image,
							x: self.stage.getWidth()/2,
							y: self.stage.getHeight()/2,
							draggable: true,
							shadowColor: 'black',
							shadowBlur: 4,
							shadowOffset: 6,
							shadowOpacity: 0.3
						}, config));
						sticker.on('mouseup dragstart', function() { self._selectNode(this);});
						sticker.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						sticker.on('mouseover', function() { document.body.style.cursor = 'move'; });
						//sticker.setOffset(image.width/2, image.height/2);
						sticker.offsetX(image.width/2);
						sticker.offsetY(image.height/2);
						self._selectNode(sticker);
						self.scale(1);
						self.stickerLayer.add(sticker);
						self.stickerLayer.batchDraw();
					}
				}
				if(url.substr(0, 5) !== 'data:')
					image.crossOrigin = "Anonymous";
				image.src = url; 
			};

			this.addText = function(str, font, color, size, align, config) {
				if(!font)
					font = 'Helvetica Neue';
				if(!size)
					size = 32;
				if(!color)
					color = "rgba(0,0,0,1)";
				if(!align)
					align = 'center';
				var text = new Kinetic.Text(this._extendConfig({
					x: this.stage.getWidth()/2,
					y: this.stage.getHeight()/2,
					text: str,
					fontSize: size,
					fontFamily: font,
					fill: color,
					textBaseline: 'middle',
					shadowColor: 'black',
					shadowBlur: 0,
					shadowOffsetX: 0,
					shadowOffsetY: 0,
					shadowOpacity: 0,
					align: align,
					draggable: true
				}, config));
				var self = this;
				text.on('mouseup dragstart', function() { self._selectNode(this); });
				text.on('mouseout', function() { document.body.style.cursor = 'auto'; });
				text.on('mouseover', function() { document.body.style.cursor = 'move'; });
				this._selectNode(text);
				this.textLayer.add(text);
				this.textLayer.batchDraw();
				text.setOffsetX(text.getWidth()/2);
				text.setOffsetY(text.getHeight()/2);
			};

			//add shape to selected node
			this.addShape = function(shape, width, height, fill, stroke, strokeWidth, gradientConfig){
				if(this.selectedNode){
					//Check if node is already a group
					var shape;
					var shape2;
					if (this.selectedNode.getClassName() !== 'Group') {
						if(width === 'auto')
							width = this.selectedNode.getWidth() + 30;
						if(height === 'auto')
							height = this.selectedNode.getHeight() + 30;
						if(fill === undefined)
							fill = "rgba(0,0,0,.5)";
						if(stroke === undefined)
							stroke = "rgba(255,255,255,1)";
						if(strokeWidth === undefined)
							strokeWidth = 3;
						if (shape === 'circ') {
							shape = new Kinetic.Ellipse({
								x: 0,
								y: 0,
								draggable: false,
								radius:{x: (width+30)/2, y: (height+30)/2},
								fill: fill,
								stroke: stroke,
								strokeWidth: strokeWidth
							});
						}else if (shape === 'rect'){
							shape = new Kinetic.Rect({
								x: this.selectedNode.getX(),
								y: this.selectedNode.getY(),
								draggable: false,
								height: height,
								width: width,
								fill: fill,
								stroke: stroke,
								strokeWidth: strokeWidth
							});
							shape.offsetX(shape.getWidth()/2);
							shape.offsetY(shape.getHeight()/2);

							shape2 = new Kinetic.Rect({
								x: this.selectedNode.getX(),
								y: this.selectedNode.getY(),
								draggable: false,
								height: height*2,
								width: width*2,
								fill: fill,
								stroke: stroke,
								strokeWidth: strokeWidth
							});
							shape.offsetX(shape.getWidth()/2);
							shape.offsetY(shape.getHeight()/2);
						}

						if( gradientConfig){
							if(gradientConfig.type === 'linear'){
						        shape.fillLinearGradientColorStops(gradientConfig.colorStops);
								shape.fillLinearGradientStartPoint( {'x': gradientConfig.xStart, 'y': gradientConfig.yStart} );
						        shape.fillLinearGradientEndPoint({'x': gradientConfig.xEnd, 'y': gradientConfig.yEnd}); //example: [0, 'red', 1, 'yellow']
							}else if(gradientConfig.type === 'radial'){
								shape.fillRadialGradientStartPoint({'x':gradientConfig.xStart, 'y':gradientConfig.yStart});
								shape.fillRadialGradientStartRadius(gradientConfig.radiusStart);
						        shape.fillRadialGradientEndRadius(gradientConfig.endRadius);
						        shape.fillRadialGradientColorStops(gradientConfig.colorStops);  //example: [0, 'red', 1, 'yellow']
							}

						}
						shape._useBufferCanvas = function () {
    						return false;
						};

						var self = this;
						var shadowConfig = {'blur': this.selectedNode.shadowBlur(), 'offsetX': this.selectedNode.shadowOffsetX(), 'offsetY': this.selectedNode.shadowOffsetY(), 'opacity': this.selectedNode.shadowOpacity()};
						
						var parent = new Kinetic.Group({
							draggable:true,
							x:0,y:0
						});
						var group = new Kinetic.Group({
								draggable: true,
								x: this.selectedNode.getX(),
								y: this.selectedNode.getY(),
						});
						shape.setRotationDeg(this.selectedNode.getRotationDeg());
						self.selectedNode.draggable(false);
						parent.add(group);
						parent.add(shape2);
						group.add(shape);
						group.add(self.selectedNode);

						//set shape and selected node to 0,0 relative to group
						this.selectedNode.setX(0);
						this.selectedNode.setY(0);
						shape.setX(0);
						shape.setY(0);

						//delete selected nodes event and shadow
						this.selectedNode.on('mouseup dragstart', function(){});
						this.selectedNode.on('mouseout', function(){});
						this.selectedNode.on('mouseover', function(){});
						this.shadow({'opacity': 0, 'offsetX': 0, 'offsetY': 0});

						//add events to group instead of single node
						group.on('mouseup dragstart', function() { self._selectNode(this); });
						group.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						group.on('mouseover', function() { document.body.style.cursor = 'move'; });

						parent.on('mouseup dragstart', function() { self._selectNode(this); });
						parent.on('mouseout', function() { document.body.style.cursor = 'auto'; });
						parent.on('mouseover', function() { document.body.style.cursor = 'move'; });

						//add to correct layer and redraw
						if (this.selectedNode.getClassName() === 'Image'){
							//this.stickerLayer.add(group);
							this.stickerLayer.add(parent);
							this.stickerLayer.batchDraw();
						}else if (this.selectedNode.getClassName() === 'Text'){
							this.textLayer.add(group);
							this.textLayer.batchDraw();
						}
						self._selectNode(group);
						this.shadow(shadowConfig);
					};
				};
			};			

			this.clearStickers = function() {
				if(confirm('Remove all the stickers?') === true) {
					this.stickerLayer.removeChildren();
					this.stickerLayer.batchDraw();
					this._selectNode(null);
				}
			};

			this.clearText = function() {
				if(confirm('Remove all the text?') === true) {
					this.textLayer.removeChildren();
					this.textLayer.batchDraw();
					this._selectNode(null);
				}
			};
			
			this.delete = function() {
				if(this.selectedNode) {
					this.selectedNode.remove();
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
					this._selectNode(null);
				}
			};

			this.moveUp = function() {
				if(this.selectedNode) {
					this.selectedNode.moveUp();
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.moveDown = function() {
				if(this.selectedNode) {
					this.selectedNode.moveDown();
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.vcenter = function() {
				if(this.selectedNode) {
					var stageHeight = this.stage.getHeight();
					this.selectedNode.setY(stageHeight/2);
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.hcenter = function() {
				if(this.selectedNode) {
					var stageWidth = this.stage.getWidth();
					this.selectedNode.setX(stageWidth/2);
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.scale = function(scaleFactor){
				if(this.selectedNode) {
					scaleFactor = parseFloat(scaleFactor);
					this.selectedNode.sandboxScale = scaleFactor;
					//height and width?
					if(height < width)
						this.selectedNode.setScale(scaleFactor * (height/2)/this.selectedNode.getHeight());
					else
						this.selectedNode.setScale(scaleFactor * (width/2)/this.selectedNode.getWidth());
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.opacity = function(newOpacity){
				if(this.selectedNode) {
					this.selectedNode.opacity = newOpacity;
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.rotate = function(rotation){
				if(this.selectedNode) {
					if(!rotation)
						rotation = 0;
					this.selectedNode.sandboxRotation = parseFloat(rotation);
					this.selectedNode.setRotationDeg(parseFloat(rotation));
					//this.selectedNode.rotation(parseFloat(rotation));
					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			this.shadowApplyAll = function(s){
				var self = this;
				var applicableChildren = [];
				var temp = this.selectedNode; 
				applicableChildren.push.apply(applicableChildren, this.stickerLayer.getChildren());
				applicableChildren.push.apply(applicableChildren, this.textLayer.getChildren());
				$.each(applicableChildren, function(i, val){
					self._selectNode(val);
					self.shadow(s);
				});
				self._selectNode(temp);
			}

			//takes the bottom most layer of a node and uses that to cast shadow
			this.shadow = function(s){
				if (this.selectedNode){
					var node = this.selectedNode
					if(node.getClassName() === 'Group'){
						if(node.children[1])
							node.children[1].shadowOpacity(0);
						node = node.children[0];
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

					this.stickerLayer.batchDraw();
					this.textLayer.batchDraw();
				}
			};

			
			//changes for images only
			this.editImage = function(config){
				if(this.selectedNode){
					var node = this.selectedNode;
					if(node.getClassName() === 'Group')
						node = node.children[1];
					if(node.getClassName() === 'Image'){
						var image = new Image();
						if(config.url.substr(0, 5) !== 'data:')
							image.crossOrigin = "Anonymous";
						image.src = config.url;
						node.setImage(image);
						this.updateContext();
						this.stickerLayer.batchDraw(); 
					}
				}
			};

			//changes for text only
			this.editText = function(config){ //str, color, font, size
				if(this.selectedNode){
					var node = this.selectedNode;
					var resize = false;
					var shape;
					if(node.getClassName() === 'Group'){
						shape = node.children[0];
						node = node.children[1];
					}
					if(node.getClassName() === 'Text'){
						if(config.hasOwnProperty('color'))
							node.fill(config.color);
						if(config.hasOwnProperty('align'))
							node.align(config.align);
						if(config.hasOwnProperty('font')){
							node.fontFamily(config.font);
							resize = true;
						}
						if(config.hasOwnProperty('size')){
							node.fontSize(config.size);
							resize = true;
						}
						if(config.hasOwnProperty('text')){
							node.text(config.text);
							resize = true;
						}
						if(resize){
							node.setOffsetX(node.getWidth()/2);
							node.setOffsetY(node.getHeight()/2);
							if(shape){
								if(shape.getClassName() === 'Rect'){
									shape.width(node.getWidth()+30);
									shape.height(node.getHeight()+30);
									shape.setOffsetX(shape.getWidth()/2);
									shape.setOffsetY(shape.getHeight()/2);
								}else if(shape.getClassName() === 'Ellipse'){
									shape.width(node.getWidth()+60);
									shape.height(node.getHeight()+60);
								};
								shape.setX(0);
								shape.setY(0);
								node.setX(0);
								node.setY(0);
							}
						}
					}
					this.textLayer.batchDraw();
				}
			};
			
			//changes for shapes only
			this.editShape = function(config){
				if(this.selectedNode){
					var node = this.selectedNode;
					if(node.getClassName() === 'Group'){
						node = node.children[1];
					}
					if(node.getClassName() === 'Rect' || node.getClassName() === 'Ellipse'){
						if(config.hasOwnProperty('fill'))
							node.fill(config.fill);
						if(config.hasOwnProperty('stroke'))
							node.stroke(config.stroke);
						if(node.getClassName() === 'Rect'){
							if(config.hasOwnProperty('width'))
								node.width(config.width);
							if(config.hasOwnProperty('height'))
								node.height(config.height);
							node.setOffsetX(node.getWidth()/2);
							node.setOffsetY(node.getHeight()/2);
						}else if(node.getClassName() === 'Ellipse'){
							if(config.hasOwnProperty('width'))
								node.radiusX(config.width);
							if(config.hasOwnProperty('height'))
								node.radiusY(config.height);
						}
						this.stickerLayer.batchDraw();
						this.textLayer.batchDraw();
					}
				}
			};

			this.renderiFrame = function(iframe) {
				this.stage.toDataURL({
					callback: function(dataURL) {
						if(typeof iframe === 'string')
							iframe = document.getElementById(iframe);
						iframe.src = dataURL;
					}
				});
			};

			this.renderLink = function(link) {
				this.stage.toDataURL({
					callback: function(dataURL) {
						if(typeof link === 'string')
							link = document.getElementById(link);
						link.href = dataURL;
					}
				});
			};

			this.templatePic = function(picConfig){
				/*picConfig = [
					{x: int, y: int, url: string },
				]*/


				var picChildren = stickerLayer.getChildren(function(node){
					return node.getClassName() === 'Image';
				});
				picChildren = picChildren.toArray();
				for(var i = 0; i < picConfig.length; ++i){
					if(i>picChildren.length-1 ){
						//use placeholder
						//this.addSticker()
					}else{
						//move picChildren[i]
						//scale if necessary
					}
				}
			};

			this.templateText = function(textConfig){
				/*textConfig = [
					{x: int, y: int, width: int, height: int }
				]*/

				var textChildren = textLayer.getChildren();
				textChildren = textChildren.toArray();
				for(var i = 0; i < textConfig.length; ++i){
					if(i>textChildren.length-1 ){
						//use placeholder
						//this.addSticker()
					}else{
						//move text
						//change
					}
				}
			};

			this.shapeConfig = function(shapeConfig){
				/*shapeConfig =
					[
					{x: int, y: int, width: int, height: int, scaleX: bool, scaleY: bool, shape: string, borderColor: string, borderWidth: int,},
					]*/
				var shapeConfig = stickerLayer.getChildren(function(node){
					return (node.getClassName() === 'Rect' || node.getClassName() === 'Ellipse');
				});
				//delete all shapes
				for(var i = 0; i < shapeConfig.length; ++i){
					//this.addShape
				}
				
			};

			// Setup the bindings
			var elements = document.querySelectorAll('[data-sandbox]');
			for(var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				var bind = element.getAttribute('data-sandbox');
				if(this.hasOwnProperty(bind))
					element.addEventListener('click', this._createEventListener(bind));
				else
					element.addEventListener('click', this._createSettingsListener(bind));
			}

			(function(self) {
				// Setup sticker drag and drop
				// http://www.html5rocks.com/en/tutorials/file/dndfiles/
				var dropContainer = container;
				if(typeof dropContainer === 'string')
					dropContainer = document.getElementById(dropContainer);
				$(dropContainer).on('dragover', function(e) {
					e.originalEvent.dataTransfer.dropEffect = 'copy';
					return false;
				}).on('drop', function(e) {
					var files = e.originalEvent.dataTransfer.files;
					var isImages = true;
					var i;
					for(i = 0; i < files.length; ++i) {
						if(files[i].type.indexOf('image') === -1) {
							isImages = false;
							break;
						}
					}
					if(isImages) {
						var onload = function(e) { self.addSticker(e.target.result); };
						for(i = 0; i < files.length; ++i) {
							if(files[i].type.indexOf('image') !== -1) {
								// https://developer.mozilla.org/en-US/docs/Using_files_from_web_applications
								var reader = new FileReader();
								reader.onload = onload;
								reader.readAsDataURL(files[i]);
							}
						}
					}else {
						alert('Please use images only.');
					}
					$(this).toggleClass('over-droparea');
					return false;
				}).on('dragenter', function() {
					$(this).toggleClass('over-droparea');
				}).on('dragleave', function() {
					$(this).toggleClass('over-droparea');
				});
			})(this);
		};
	};
	/* 
	tint code:
	this.setBackgroundTintColor = function(r, g, b, a) {
		this.backgroundTintColorLayer.removeChildren();
		this.backgroundTintColorLayer.add(new Kinetic.Rect({ 
				x: 0,
				y: 0,
				width: this.stage.attrs.width,
				height: this.stage.attrs.height,
				fillRed: r,
				fillGreen: g,
				fillBlue:b,
				fillAlpha: a
			}));
		this._setBackgroundColor(r, g, b);
		this.backgroundTintColorLayer.batchDraw();
	}
	this.backgroundTintColorLayer = new Kinetic.Layer();
	this.stage.add(this.backgroundTintColorLayer)
		//reapply tint to scale with new canvas size
		if(this.backgroundTintColorLayer.children[0]){
			var node = this.backgroundTintColorLayer.children[0];
			this.setBackgroundTintColor(node.fillRed(), node.fillGreen(), node.fillBlue(), node.fillAlpha());
	*/
	
	// Requirements - jquery, kinetic.js, rgbcolor.js, canvg.js
	// rgbcolor and canvg need to be shimmed
	/* global define:false, $:false, Kinetic: false */
	if(typeof define === "function" && define.amd) {
		// AMD
		define("sandbox", ["jquery", "kinetic"], function($, Kinetic) { return factory($, Kinetic); });
	}
	else {
		// Global
		window.Sandbox = factory($, Kinetic);
	}
})();
