(function(exports) {

	var g_name = '';
	var g_tracks = [];

	var track_uris = [];

	var g_access_token = '';
	var g_username = '';

	var client_id = '4d78f4f5135944c9b2f05bcabff6b557';
	var redirect_uri = 'http://localhost:8000/callback.html';

	var splitText = function(inputtext) {
		var words = inputtext
			.split(/[\n\r]/)
			// .map(function(w) { return w.replace(/^\d+ /,'').replace(/[\d,]+$/,'')}) // rm rank, count
			.map(function(w) { return w.trim().replace(/^[.,-]+/,'').replace(/[.,-]+$/g,''); })
			.filter(function(w) { return (w.length > 0); });
		return words;
	}

	var addToQueue = function() {
		var tracks = null;

		g_name = $('#plName').val().trim();
		if (g_name.trim() == "") {
			g_name = new Date($.now())
		}

		var words = splitText($('#alltext').val()); // words is song, artist combination

		words.forEach(function(curr) {
			var url = '';

			if (curr.match(/\t/)) {
				curr = curr.split(/[\t]/);
			} else {
				curr = curr.split(/,/);
			}
			// console.log(curr);
			if (curr.length == 3) {
				// 538 playlist
				// console.log("error on", curr);
				if (curr[0].match(/^\d$/)) {
					// Wedding playlist
					url = 'https://api.spotify.com/v1/search?q='
					+ encodeURIComponent(curr[1]) + '&type=track&limit=1';
				} else {
					// Workout playlist
					url = 'https://api.spotify.com/v1/search?q='
					+ encodeURIComponent(curr[0] + ' ' + curr[1]) + '&type=track&limit=1';
				}
			} else {
				// CSV
				url = 'https://api.spotify.com/v1/search?q='
					+ encodeURIComponent(curr[0] + ' ' + curr[1]) + '&type=track&limit=1';
			}

			track_uris.push(url);
			$.ajax(url, {
				dataType: 'json',
				success: function(r) {
					console.log('got track', r);
				},
				error: function(r) {
					console.log(r);
				}
			});
		});
	}

	var createPl = function () {
		var txt = '';
		addToQueue();

		track_uris.forEach(function(url) {
		//while (track_uris.length != 0) {

			//url = track_uris[0];

			console.log(url);
			// $.ajax(url, {
			// 	dataType: 'json',
			// 	success: function(r) {
			// 		// console.log('got track', r);
			// 		track_uris.shift();
			// 		if (jQuery.isEmptyObject(r.tracks.items)) {
			// 			console.log('fail to get track info')
			// 			// not found on spotify
			// 			name = url.replace(/^https:\/\/api\.spotify\.com\/v1\/search\?q=/, '').replace(/&type=track&limit=1$/,'');
			// 			txt += '<div class="media">No match found for "' + decodeURIComponent(name)+ '"</div>\n';
			// 		} else {
			// 			console.log('found track', r);
			// 			g_tracks.push(r.tracks.items[0].uri);
			// 			txt += '<div class="media">' +
			// 			'<a class="pull-left" href="#"><img class="media-object" src="' + r.tracks.items[0].album.images[r.tracks.items[0].album.images.length - 1].url + '" /></a>' +
			// 			'<div class="media-body">' +
			// 			'<h4 class="media-heading"><a href="' + r.tracks.items[0].uri + '">' + r.tracks.items[0].name + '</a></h4>' +
			// 			'Album: <a href="' + r.tracks.items[0].album_uri + '">' + r.tracks.items[0].album.name +
			// 			'</a><br/>Artist: <a href="' + r.tracks.items[0].artists[0].uri + '">' + r.tracks.items[0].artists[0].name+'</a>' +
			// 			'</div>' +
			// 			'</div>\n';
			// 		}
			// 	},
			// 	error: function(r) {
			// 		// timeout
			// 		console.log(r);
			// 	}
			// });

			$('#debug').html(txt);
		//}
		});
	}


	var doLogin = function(callback) {
		var url = 'https://accounts.spotify.com/authorize?client_id=' + client_id +
			'&response_type=token' +
			'&scope=playlist-read-private%20playlist-modify%20playlist-modify-private' +
			'&redirect_uri=' + encodeURIComponent(redirect_uri);
		localStorage.setItem('createplaylist-tracks', JSON.stringify(g_tracks));
		localStorage.setItem('createplaylist-name', g_name);
		var w = window.open(url, 'asdf', 'WIDTH=400,HEIGHT=500');
	}

	exports.startApp = function() {
		console.log('start app.');
		$('#create').click(function() {
			createPl();
		});
		$('#upload').click(function() {
			doLogin(function() {});
		});

}

})(window);
