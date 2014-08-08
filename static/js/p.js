(function () {
	"use strict";

	// Use 70x70 for a small thumbnail
	// Use 192x for a thumbnail
	// Use 550x for a typical full-size image
	// Use 216x146 for a board cover
	function changePinImage(url, size, proxy) {
		var validSize = false;
		for(var i = 0; i < changePinImage.sizes.length; ++i) {
			if(changePinImage.sizes[i] === size) {
				validSize = true;
				break;
			}
		}
		if(validSize) {
			if(url) {
				var parser = document.createElement('a');
				parser.href = url;
				if(parser.hostname.toLowerCase().search('.pinimg.com') !== -1) {
					var md5 = url.match(/.*?\/(\w*?).jpg$/);
					if(md5) {
						md5 = md5[1];
						if(proxy)
							url = 'http://proxy.shareroot.co/pinimg/' + size + '/' + md5.substr(0, 2) + '/' + md5.substr(2, 2) + '/' + md5.substr(4, 2) + '/' + md5 + '.jpg';
						else
							url = 'http://media-cache-' + changePinImage.mediaServer + '.pinimg.com/' + size + '/' + md5.substr(0, 2) + '/' + md5.substr(2, 2) + '/' + md5.substr(4, 2) + '/' + md5 + '.jpg';
					}
				}
			}
		}
		return url;
	}

	changePinImage.sizes = ["1200x", "136x136", "150x150", "192x", "200x", "200x150", "2048x2048", "216x146", "222x", "236x", "237x", "30x30", "400x", "400x300", "45x45", "474x", "550x", "600x", "60x60", "70x", "70x70", "736x", "75x75", "90x90"];
	changePinImage.mediaServer = 'ak' + Math.floor((Math.random()*10)); // could be ecX or akX

	function parsePinterestURL(url) {
		var parsed = {'username': null, 'board': null, 'pin': null};
		url = url.toLowerCase();
		if(url.indexOf('pinterest.com') === 0 || url.indexOf('www.pinterest.com') === 0)
			url = 'http://' + url;
		if(url) {
			var parser = document.createElement('a');
			parser.href = url;
			if(parser.hostname === 'www.pinterest.com' || parser.hostname === 'pinterest.com') {
				var path = parser.pathname;
				while(path.length && path[0] === '/')
					path = path.substring(1);
				while(path.length && path[path.length - 1] === '/')
					path = path.substr(0, path.length - 1);
				var components = path.split('/');
				if(components.length) {
					if(components[0] === 'pin') {
						if(components.length > 1)
							parsed.pin = components[1];
					}
					else {
						parsed.username = components[0];
						if(components.length > 1 && components[1] !== 'boards' && components[1] !== 'pins' && components[1] !== 'likes' && components[1] !== 'followers' && components[1] !== 'following')
							parsed.board = components[1];
					}
				}
			}
		}
		return parsed;
	}

	function loadRecentPins(user, callback) {
		if(typeof callback === "function")
			callback = callback.name;
		var rand = Math.floor((Math.random()*999999)+1);
		var protocol = 'http';
		if(window.location.protocol === 'https:')
			protocol = 'https';
		var url = protocol + "://api.pinterest.com/v3/pidgets/users/" + user + "/pins/?callback=" + callback + "&_=" + rand;
		(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = url;fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'recentpins-js-' + rand));
	}

	function loadRecentBoardPins(user, board, callback) {
		if(typeof callback === "function")
			callback = callback.name;
		var rand = Math.floor((Math.random()*999999)+1);
		var protocol = 'http';
		if(window.location.protocol === 'https:')
			protocol = 'https';
		var url = protocol + "://api.pinterest.com/v3/pidgets/boards/" + user + "/" + board + "/pins/?callback=" + callback + "&_=" + rand;
		(function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) return;js = d.createElement(s); js.id = id;js.src = url;fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'recentboardpins-js-' + rand));
	}


	/* global define:false, exports:false */
	if(typeof define === "function" && define.amd) {
		// AMD
		define({
			changePinImage: changePinImage,
			parsePinterestURL: parsePinterestURL,
			loadRecentPins: loadRecentPins,
			loadRecentBoardPins: loadRecentBoardPins
		});
	}
	else if (typeof exports === "object") {
		// CommonJS
		exports.changePinImage = changePinImage;
		exports.parsePinterestURL = parsePinterestURL;
		exports.loadRecentPins = loadRecentPins;
		exports.loadRecentBoardPins = loadRecentBoardPins;
	}
	else {
		// Global
		window.changePinImage = changePinImage;
		window.parsePinterestURL = parsePinterestURL;
		window.loadRecentPins = loadRecentPins;
		window.loadRecentBoardPins = loadRecentBoardPins;
	}
})();
