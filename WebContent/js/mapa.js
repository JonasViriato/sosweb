var geocoder;
var map;
var marker;
var infowindow;
var cont=0;
var pontos = [];
 
function carregarJSON() {
	
	 $.ajax(
		        {
		            type: "GET",
		            url: 'http://soservices.vsnepomuceno.cloudbees.net/prestador',
		            contentType: "application/json; charset=utf-8",
		            dataType: "json",
		            xhrFields: {
		                // The 'xhrFields' property sets additional fields on the XMLHttpRequest.
		                // This can be used to set the 'withCredentials' property.
		                // Set the value to 'true' if you'd like to pass cookies to the server.
		                // If this is enabled, your server must respond with the header
		                // 'Access-Control-Allow-Credentials: true'.
		                withCredentials: false
		              },

		              headers: {
		                // Set any custom headers here.
		                // If you set any non-simple headers, your server must include these
		                // headers in the 'Access-Control-Allow-Headers' response header.
		              },
		            success: function (data) {
		            	$.each(data.list, function (i, theItem) {
		            		if (i != "@id") {
		            			$.each(theItem, function (j, prest) {
		            			var marker_prest = new google.maps.Marker({
		                            position: new google.maps.LatLng(prest.endereco.latitude,prest.endereco.longitude),
		                            title: prest.nome,
		                            map: map,
		                            icon: '../img/map_icon_prest.png',
		                        });            			
		            			
		            			
		            			var infowindow_prest = new google.maps.InfoWindow({
		            			    content: prest.nome + "<br>" + prest.telefone,
		            			});
		            			
		            			google.maps.event.addListener(marker_prest, 'click', function() {
		            				infowindow_prest.open(map,marker_prest);
		            			});
		            			
		            			pontos[cont++] = marker_prest;
		            			
		            			});
		            			
		            			
		            		};
                       });
		            },
		            error: function (msg, url, line) {
		                alert('error trapped in error: function(msg, url, line)');
		                alert('msg = ' + msg + ', url = ' + url + ', line = ' + line);
		            },
		   });

}

function initialize() {
    var latlng = new google.maps.LatLng(-18.8800397, -47.05878999999999);
    var options = {
        zoom: 5,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        icon: '../img/map_icon_user.png',
    };
 
    map = new google.maps.Map(document.getElementById("mapa"), options);
 
    geocoder = new google.maps.Geocoder();
 
    marker = new google.maps.Marker({
        map: map,
        draggable: true,
        icon: '../img/map_icon_user.png',
    });    
 
    marker.setPosition(latlng);
    
    infowindow = new google.maps.InfoWindow({
        content: "Usuário",
    });
    
    carregarJSON();
}
 
$(document).ready(function () {
    initialize();   
    
    function carregaPontosNoRaio(raio) {
    	var diametro_circulo = raio;
    	var pontoCentral = marker.position;
    	 
    	for (var i = 0; i < pontos.length; i++) {
    	 
    	  var distancia = google.maps.geometry.spherical.computeDistanceBetween(pontoCentral, pontos[i].position)/1000;
    	 
    	  if (distancia < diametro_circulo) {    	 
    	    pontos[i].setVisible(true);    	 
    	  } else {    	 
    	    pontos[i].setVisible(false);    	 
    	  };
    	};
    }
    
    function carregarNoMapa(endereco, raio) {   	    	
    	
        geocoder.geocode({ 'address': endereco + ', Brasil', 'region': 'BR'}, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
 
                    $('#txtEndereco').val(results[0].formatted_address);
                    $('#txtLatitude').val(latitude);
                    $('#txtLongitude').val(longitude);
 
                    var location = new google.maps.LatLng(latitude, longitude);
                    marker.setPosition(location);
                    map.setCenter(location);
                    map.setZoom(16);
                    infowindow.setContent(endereco);
                    carregaPontosNoRaio(raio);
                }
            }
        });      
        
    }
    
    $("#btnEndereco").click(function() {
        if($(this).val() != "")
            carregarNoMapa($("#txtEndereco").val(), $("#opRaio").val());
    });
 
    $("#txtEndereco").blur(function() {
        if($(this).val() != "")
            carregarNoMapa($(this).val());
    });
    
    google.maps.event.addListener(marker, 'drag', function () {
        geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                    if (results[0]) { 
                    $('#txtEndereco').val(results[0].formatted_address);
                    $('#txtLatitude').val(marker.getPosition().lat());
                    $('#txtLongitude').val(marker.getPosition().lng());
                }
            }
        });
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });
    
    /*
    $("#txtEndereco").autocomplete({
        source: function (request, response) {
            geocoder.geocode({ 'address': request.term + ', Brasil', 'region': 'BR' }, function (results, status) {
                response($.map(results, function (item) {
                    return {
                        label: item.formatted_address,
                        value: item.formatted_address,
                        latitude: item.geometry.location.lat(),
                        longitude: item.geometry.location.lng()
                    };
                }));
            });
        },
        select: function (event, ui) {
            $("#txtLatitude").val(ui.item.latitude);
            $("#txtLongitude").val(ui.item.longitude);
            var location = new google.maps.LatLng(ui.item.latitude, ui.item.longitude);
            marker.setPosition(location);
            map.setCenter(location);
            map.setZoom(16);
        }
    });*/
});