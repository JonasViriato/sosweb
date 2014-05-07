// This is called with the results from from FB.getLoginStatus().
function statusChangeCallback(response) {
	if (response.status === 'connected') {
		testAPI();
	} else if (response.status === 'not_authorized') {
		document.getElementById('status').innerHTML = 'Please log '
				+ 'into this app.';
	} else {
		document.getElementById('status').innerHTML = 'Please log '
				+ 'into Facebook.';
	}
}
function checkLoginState() {
	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});
}

window.fbAsyncInit = function() {
	FB.init({
		appId : '1421756051420526',
		cookie : true, // enable cookies to allow the server to access 
		// the session
		xfbml : true, // parse social plugins on this page
		version : 'v2.0' // use version 2.0
	});

	FB.getLoginStatus(function(response) {
		statusChangeCallback(response);
	});

};

// Load the SDK asynchronously
(function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0];
	if (d.getElementById(id))
		return;
	js = d.createElement(s);
	js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

// Here we run a very simple test of the Graph API after login is
// successful.  See statusChangeCallback() for when this call is made.
function testAPI() {
	FB.api('/me', function(response) {
		console.log('Olá, ' + response.name + '.');
		
	});
	
	FB.api('/me?fields=id,name,location,hometown,birthday ', function(response) {
		document.getElementById('status').innerHTML = 'Olá, '
			+ response.name;
		document.getElementById('location').innerHTML = 'Sua localização é '
				+ response.location.name;
		
		document.getElementById('hometown').innerHTML = 'Sua cidade natal é '
			+ response.hometown.name;
		
		document.getElementById('birthday').innerHTML = 'Sua cidade natal é '
			+ response.birthday;
	});
}