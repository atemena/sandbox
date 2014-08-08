function findDomColor(context, width, height){
	var imgd = context.getImageData(0, 0, width, height);
	var pix = imgd.data;
	var pixelData = [];
	var m = 0;
	for (var i = 0, n = pix.length; i < n; i += 4){
		pixelData[m] = rgbToHex(pix[i],pix[i+1],pix[i+2]);
		m++;
	}
	var colorInHex = mode(pixelData);
	return hexToRgb(colorInHex);
}

function componentToHex(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
	return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
function mode(array){
	if(array.length == 0)
		return null;
	var modeMap = {};
	var maxEl = array[0], maxCount = 0;
	for(var i = 0; i < array.length; i++)
	{
		var el = array[i];
		if(modeMap[el] == null)
			modeMap[el] = 1;
		else
			modeMap[el]++;	
		if(modeMap[el] > maxCount)
		{
			maxEl = el;
			maxCount = modeMap[el];
		}
	}
	return maxEl;
}

function hexToRgb(hex) {
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	hex = hex.replace(shorthandRegex, function(m, r, g, b) {
		return r + r + g + g + b + b;
	});

	var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;
}
