(function(exports) {

	var g_name = '';
	var g_tracks = [];
	var track_urls = [];

	var client_id = '4d78f4f5135944c9b2f05bcabff6b557';
	var redirect_uri = 'http://localhost/callback.html';

	var splitText = function(inputtext) {
		var words = inputtext
		.split(/[\n\r]/)
		// .map(function(w) { return w.replace(/^\d+ /,'').replace(/[\d,]+$/,'')}) // rm rank, count
		.map(function(w) { return w.trim().replace(/^[.,-]+/,'').replace(/[.,-]+$/g,''); })
		.filter(function(w) { return (w.length > 0); });
		return words;
	}

	var addToQueue = function() {
		var new_urls = [];

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

			new_urls.push(url);
		});.

		return track_urls = new_urls;
	}

	var search = function () {
		var txt = '';
		var new_tracks = [];

		var accessToken = location.hash.match(/^\#access_token=(.+)&token_type=(.+)&expires_in=(\d+)$/)[1];

		track_urls.forEach(function(url) {
			//while (track_uris.length != 0) {

			//url = track_uris[0];

			$.ajax({
				url: url,
				dataType: 'json',
				headers : {
					'Authorization': 'Bearer ' + accessToken
				},
				async: false,
				success: function(r) {
					// console.log('got track', r);
					// track_uris.shift();
					if (jQuery.isEmptyObject(r.tracks.items)) {
						console.log('fail to get track info', r)
						// not found on spotify
						name = url.replace(/^https:\/\/api\.spotify\.com\/v1\/search\?q=/, '').replace(/&type=track&limit=1$/,'');
						txt += '<div class="media">No match found for "' + decodeURIComponent(name)+ '"</div>\n';
					} else {
						// console.log('found track', r);
						// console.log(r.tracks.items[0].uri);
						new_tracks.push(r.tracks.items[0].uri);
						txt += '<div class="media">' +
						'<a class="pull-left" href="#"><img class="media-object" src="' + r.tracks.items[0].album.images[r.tracks.items[0].album.images.length - 1].url + '" /></a>' +
						'<div class="media-body">' +
						'<h4 class="media-heading"><a href="' + r.tracks.items[0].uri + '">' + r.tracks.items[0].name + '</a></h4>' +
						'Album: <a href="' + r.tracks.items[0].album_uri + '">' + r.tracks.items[0].album.name +
						'</a><br/>Artist: <a href="' + r.tracks.items[0].artists[0].uri + '">' + r.tracks.items[0].artists[0].name+'</a>' +
						'</div>' +
						'</div>\n';
						$('#tracks').html(txt);
					}
				},
				error: function(jqXHR,textStatus,errorThrown) {
					// timeout
					console.log('errorThrown:',errorThrown);
					if (errorThrown == 'Unauthorized') {
						window.location.replace('http://localhost/callback.html');
					} else if (errorThrown == 'Too Many Requests') {
						// time delay
						console.log('too');
					}
				}
			});

			//}
		});

		return new_tracks;
	}
	var createPl = function () {

		addToQueue();
		var g_tracks = search();

		console.log('done searching');
		g_tracks.forEach(function(it) {
			console.log(it);
		});
		console.log('done');

		// need to wait for ajax requests to finish before processing
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
