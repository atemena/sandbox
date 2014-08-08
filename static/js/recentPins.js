define(["p"], function(p){
	var p = p
	function getRecentPins(inputId, contentId, size, type) {
		var boardURL = document.getElementById(inputId).value;
		var parsed = p.parsePinterestURL(boardURL);
		if (parsed.board != null) {
			// Remember the context and then load the pins
			getRecentPins['/' + parsed.username + '/' + parsed.board + '/'] = { 'contentId': contentId, 'size': size, 'type': type };
			p.loadRecentBoardPins(parsed.username, parsed.board, "handlePins");
		}
		else{ alert("Please enter a valid board url."); }
	}

	function handlePins(obj) {
		if(obj.data.pins) {
			var imgArray = obj.data.pins;
			var key = obj.data.board.url.toLowerCase();
			if(key.indexOf('/') != 0)
				key = '/' + key;
			if(key.lastIndexOf('/') != (key.length - 1))
				key = key + '/';
			var context = getRecentPins[key];
			document.getElementById(context.contentId).innerHTML = '';
			if(imgArray) {
				for (var i = 0; i < imgArray.length; i++) {
					var item = imgArray[i];
					var elem = document.createElement("img");
					elem.setAttribute("src", p.changePinImage(item.images["237x"].url, context.size));
					elem.setAttribute("class", "img-" + context.type);
					elem.style.height="150px";;
					document.getElementById(context.contentId).appendChild(elem);
				}
				var images = document.getElementsByClassName("img-" + context.type);
				for(var i = 0; i < images.length; i++){
		  			images[i].onclick = function() { sendToCanvas(p.changePinImage(this.src, context.size, true), context.type); };
			  		images[i].addEventListener('dragstart',function(e){
					       window.dragSrcEl = {'src': p.changePinImage(this.src, context.size, true), 'type': context.type};
					});
			  	};
			}
			else { document.getElementById(context.contentId).innerHTML += "No more results."; }
		}
		else { alert("Invalid URL or board has no pins.") }
	}

	function sendToCanvas(clicked_src, type){
		if(type == 'background'){
			canvas.addImage(clicked_src);
		}
		if(type == 'sticker'){
			canvas.addImage(clicked_src);
		}
	}

	function dataURItoBlob(dataURI) {
		var binary = atob(dataURI.split(',')[1]);
		var array = [];
		for(var i = 0; i < binary.length; i++)
			array.push(binary.charCodeAt(i));
		array = new Uint8Array(array);
		return new Blob([array.buffer], {type: 'image/jpeg'});
	}


	function saveViaAJAX(directory, blob, popup) {
		var s3params = saveViaAJAX[directory];
		if(!s3params){
			console.error("Unknown pins directory!");
			return;
		}
		
		var dat = new FormData();
		var newFilename = new Date().getTime() + '-' + Math.floor((Math.random()*999999)+1) + '.jpg';
		dat.append("key", directory + "/" + newFilename);
		dat.append("AWSAccessKeyId", "AKIAI3WAYXNHBRKM5DGQ");
		dat.append("acl", "private");
		dat.append("Content-Type", "image/jpeg");
		dat.append("policy", s3params.policy);
		dat.append("signature", s3params.signature);
		dat.append("file", blob);
		//var popup = window.open(null, null, 'height=500,width=750');
		$.ajax({
			type: "POST",
			url: "http://pins.shareroot.co.s3.amazonaws.com/",
			data: dat,
			cache: false,
			contentType: false,
			processData: false
		}).done(function() {
			var url = "http://tools.shareroot.co/";
			var media = "http://s3.amazonaws.com/pins.shareroot.co/" + directory + "/" + newFilename;
			var description = "Created using the free ShareRoot Pinterest Toolset.";
			popup.location ="http://www.pinterest.com/pin/create/button/?url=" + encodeURIComponent(url) +  "&media=" + encodeURIComponent(media) + "&description=" + encodeURIComponent(description);
		});
	}

	saveViaAJAX['cross-promote'] = {'policy': 'eyJleHBpcmF0aW9uIjogIjIwMzAtMDEtMDFUMDA6MDA6MDBaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAicGlucy5zaGFyZXJvb3QuY28ifSwgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgImNyb3NzLXByb21vdGUvIl0sIHsiYWNsIjogInByaXZhdGUifSwgWyJzdGFydHMtd2l0aCIsICIkQ29udGVudC1UeXBlIiwgImltYWdlL2pwZWciXSwgWyJjb250ZW50LWxlbmd0aC1yYW5nZSIsIDAsIDEwNDg1NzZdXX0=', 'signature': 'lqGJpK30sS/IMZXn6GwL/NyaCT4='};
	saveViaAJAX['board-cover'] = {'policy': 'eyJleHBpcmF0aW9uIjogIjIwMzAtMDEtMDFUMDA6MDA6MDBaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAicGlucy5zaGFyZXJvb3QuY28ifSwgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgImJvYXJkLWNvdmVyLyJdLCB7ImFjbCI6ICJwcml2YXRlIn0sIFsic3RhcnRzLXdpdGgiLCAiJENvbnRlbnQtVHlwZSIsICJpbWFnZS9qcGVnIl0sIFsiY29udGVudC1sZW5ndGgtcmFuZ2UiLCAwLCAxMDQ4NTc2XV19', 'signature': 'W2w0/45JPkvorF1emzVfi8NOST0='};
	window.handlePins = handlePins;
	return { getRecentPins: getRecentPins, handlePins: handlePins, dataURItoBlob:dataURItoBlob, sendToCanvas:sendToCanvas, saveViaAJAX: saveViaAJAX} 
})
