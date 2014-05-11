var geocoder;
var map;
var marker;
var infowindow;
var contPontos=0;
var pontos = [];
var contTipoServicos=0;
var tipoServicos = [];

function createMarker(prest) {
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
	
	pontos[contPontos++] = marker_prest;
}
 
function carregarJSON() {
	 $.ajax(
		        {		        	 
		            type: "GET",
		            url: 'http://soservices.vsnepomuceno.cloudbees.net/prestador',
		            contentType: "application/json; charset=utf-8",
		            dataType: "jsonp",
		            crossDomain: true,		         	            
		            success: function (data) {
		            	contPontos = 0;		 
		            	pontos = [];
		            	$.each(data.list, function (i, theItem) {
		            		if (i != "@id") {
		            			if ($.isArray(theItem)) {
			            			$.each(theItem, function (j, prest) {
			            				createMarker(prest);			            			
			            			});		            			
		            			} else {
		            				createMarker(theItem);
		            			}
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
    
    google.maps.event.addListener(marker, 'drag', function () {
        geocoder.geocode({ 'latLng': marker.getPosition() }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                   
            }
        });
    });
    
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.open(map,marker);
    });    
    
    carregarJSON();
}

function initializeGeocomplete() {
	$("#txtEndereco").geocomplete().bind("geocode:result", function(event, result){
		$("#txtEndereco").value = result.formatted_address;
	})
	.bind("geocode:error", function(event, status){
		$("#txtEndereco").value = status;
	})
	.bind("geocode:multiple", function(event, results){
	});
}

function initializeServices() {
	 $.ajax({
		type : "GET",
		url : 'http://localhost:6652/sos-api/tipo-servico',
		contentType : "application/json; charset=utf-8",
		dataType : "jsonp",
		crossDomain : true,
		success : function(data) {
			contTipoServicos=0;
			tipoServicos = [];
			$.each(data.list, function(i, theItem) {
				if (i != "@id") {
					if ($.isArray(theItem)) {
						$.each(theItem, function(j, tipo) {
							tipoServicos[contTipoServicos++] = tipo.nome;
						});
					} else {
						tipoServicos[contTipoServicos++] = theItem.nome;
					}
				}
			});
			$("#servico").autocomplete({
			      source: tipoServicos
			 });
		},
		error : function(msg, url, line) {
			alert('error trapped in error: function(msg, url, line)');
			alert('msg = ' + msg + ', url = ' + url + ', line = ' + line);
		},
	});
}
 
$(document).ready(function () {    
	
	initializeGeocomplete();
	initializeServices();
	
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
    
    function carregarNoMapa(enderecoR, raioR) {   	 

    	 geocoder.geocode({ 'address': enderecoR + ', Brasil', 'region': 'BR'}, function (results, status) {
        	if (status == google.maps.GeocoderStatus.OK) {
                if (results[0]) {
                    var latitude = results[0].geometry.location.lat();
                    var longitude = results[0].geometry.location.lng();
 
                    var location = new google.maps.LatLng(latitude, longitude);
                    marker.setPosition(location);
                    map.setCenter(location);
                    map.setZoom(16);
                    infowindow.setContent(enderecoR);
                    carregaPontosNoRaio(raioR);
                }
            }
        });      
        
    }
    
    $("#buscar").click(function() {
        if($(this).val() != "") {
            initialize();   
        	carregarNoMapa($("#txtEndereco").val(), $("#opRaio").val());
        }
        return false;
    });     
    
});
