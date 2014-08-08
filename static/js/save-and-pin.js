	function sendToCanvas(backgroundctx, clicked_src) {
		bctx.clearRect(0, 0, c.width, c.height);
		background.src = clicked_src;
		background.onload = function(){
			var width = bc.width;
			var height =  this.height * (bc.width/this.width);
		    bctx.drawImage(background,((bc.width/2)-(width/2)),((bc.height/2)-(height/2)), width, height);
		}
	}

	function addSticker(clicked_sticker){
		var image = new Image();
		image.src = clicked_sticker;
		image.onload = function(){
			ctx.drawImage(image,0,0);
		}
	}

	function addText(){
		var textToAdd = document.getElementById('textbox_id').value
		ctx.fillStyle = "blue";
  		ctx.font = "bold 16px Arial";
  		ctx.fillText(textToAdd, 100, 100);
  		
	}


function dataURItoBlob(dataURI) {
    var binary = atob(dataURI.split(',')[1]);
    var array = [];
    for(var i = 0; i < binary.length; i++) {
        array.push(binary.charCodeAt(i));
    }
    return new Blob([new Uint8Array(array)], {type: 'image/jpeg'});
}
function saveAndPin(final_context, final_canvas) {
	final_context.drawImage(bc, 0, 0);
	final_context.drawImage(c, 0, 0);
	var canvasData = final_canvas.toDataURL();
	var blob = dataURItoBlob(canvasData);
    var postData = "canvasData="+canvasData;
    var myPopup = window.open ("pleasewait.html", '', '');
    var dat = new FormData();
    var time = new Date().getTime();
    var newFilename="sharerootPin"+ time + "jpeg"
	dat.append("key", "crosspromote/" + newFilename);
	dat.append("AWSAccessKeyId", "AKIAI3WAYXNHBRKM5DGQ");
	dat.append("acl", "private");
	dat.append("Content-Type", "image/jpeg");
	dat.append("policy", "eyJleHBpcmF0aW9uIjogIjIwMzAtMDEtMDFUMDA6MDA6MDBaIiwgImNvbmRpdGlvbnMiOiBbeyJidWNrZXQiOiAicGlucy5zaGFyZXJvb3QuY28ifSwgWyJzdGFydHMtd2l0aCIsICIka2V5IiwgImNyb3NzcHJvbW90ZS8iXSwgeyJhY2wiOiAicHJpdmF0ZSJ9LCBbInN0YXJ0cy13aXRoIiwgIiRDb250ZW50LVR5cGUiLCAiaW1hZ2UvanBlZyJdLCBbImNvbnRlbnQtbGVuZ3RoLXJhbmdlIiwgMCwgMTA0ODU3Nl1dfQ==");
	dat.append("signature", "8tjqdQYXst1k4LX+xYQ+Rg+d/J8=");
	dat.append("file", blob );

	$.ajax({
        type: "POST",
        url: "http://pins.shareroot.co.s3.amazonaws.com/",
        data: dat,
        cache: false,
    	contentType: false,
        processData: false
    	 }
    ).done(function() {
		myPopup.location ="//pinterest.com/pin/create/button/?url=http%3A%2F%2Fshareroot.co&media=https://s3.amazonaws.com/pins.shareroot.co/crosspromote/"+newFilename+"&description=success";
	});
}