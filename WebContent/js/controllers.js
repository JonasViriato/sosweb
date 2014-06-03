'use strict';

/* Global Object */
//var sosMap;
//var mapOptions;
var geo = new google.maps.Geocoder; //Posicao inicial do mapa

/* Controllers */
var SoSCtrls = angular.module('sosWeb.controllers', ['ui.bootstrap','ui.map','ui.event']);


/* Main page Ctrl */
SoSCtrls.controller('MainCtrl', ['$scope', '$http', '$location', '$modal', 'Alerts',
	'$log', 'Authentication' ,  function($scope, $http, $location, $modal, Alerts, $log, Authentication ) {	
	$scope.gPlace;
	$scope.tipoServico;
	$scope.endereco;
	$scope.raio;
	$scope.user = Authentication.currentUser();

	$scope.search = function() {
		$location.path(
			'/busca/tipoServico/'+$scope.tipoServico+
			'/endereco/'+$scope.endereco+
			'/raio/'+$scope.raio);
	};

	$scope.tiposServicos = new Array();
	$http({
		method: 'GET',
		url: 'http://soservices.vsnepomuceno.cloudbees.net/tipo-servico'}).
    	success(function(data, status, headers, config) {
			$scope.tiposServicos = data;

	    }).
	    error(function(data, status, headers, config) {
	     	Alerts.addAlert('Erro: ' + status +' '+ data, 'danger');
	    });

	$scope.labels = {
		"filtrar_resultado": "Filtrar prestadores...",
		"prestadores_encontrados": "Prestadores encontrados",
		"endereco": "Endere√ßo",
		"buscar": "Buscar",
	};

	//Alerts na pagina principal
	$scope.alerts = Alerts.getAll();
	$scope.closeAlert = function(index) {Alerts.removeAlert(index);};

	$scope.items = ['item1', 'item2', 'item3'];
	$scope.openAnuncio = function (size) {
		var modalInstance;
		if($scope.user.logado){
			modalInstance = $modal.open({
			  templateUrl: 'partials/anunciar.html',
			  controller: 'AnuncioCtrl',
			  size: size,
			  resolve: {
			    items: function () {
			      return $scope.items;
			    }
			  }
			});
			modalInstance.result.then(function (selectedItem) {
			  $scope.selected = selectedItem;
			}, function () {
			  $log.info('Modal dismissed at: ' + new Date());
			});
		}else{
			$scope.openLogin(true);
		}
	};
	
	$scope.openLogin = function (fromAnuncio) {
		var modalInstance;
		modalInstance = $modal.open({
			  templateUrl: 'partials/login.html',
			  controller: 'LoginCtrl',
			  resolve: {
			    user: function () {
			      return $scope.user;
			    }
			  }
		});
		modalInstance.result.then(function(data) {
			if (data != '') {
				$scope.user.logado = true;
				$scope.user.senha='';
				$scope.user.apiKey = data.apiKey;
				Authentication.login($scope.user);
				Alerts.closeAll();
				$scope.$apply();
				if (fromAnuncio) {
					$scope.openAnuncio();
				}
				
			}
		}, function() {
		});
	};
	
	$scope.logout = function (size) {
		$http({
			method : 'DELETE',
			url : 'http://soservices.vsnepomuceno.cloudbees.net/token/logout/'+$scope.user.email,
			data : $scope.user,
			headers: {'Content-Type': 'application/json'}
		}).
		success(function(data, status, headers, config) {
			$scope.user.nome='';
			$scope.user.email='';
			$scope.user.senha='';
			$scope.user.logado = false;
			$scope.user.apiKey = '';
			Authentication.logout($scope.user);
			$scope.$apply();

		}).error(function(data, status, headers, config) {
			Alerts.addAlert('Erro: ' + status + ' ' + data, 'danger');
		});    	  
	};
	
	$scope.openCadastro = function (size) {
		var modalInstance;
		modalInstance = $modal.open({
			  templateUrl: 'partials/cadastrarUsuario.html',
			  controller: 'cadastrarCtrl',
			  size: size,
			  resolve: {
			    user: function () {
			      return $scope.user;
			    }
			  }
		});
		modalInstance.result.then(function(data) {
			if (data != '') {
				$scope.user.logado = true;
				$scope.user.senha='';
				$scope.user.confirmarsenha='';
				$scope.user.apiKey = data.apiKey;
				Authentication.login($scope.user);
				Alerts.closeAll();
				$scope.$apply();
				
			}
		}, function() {
		});
	};
	
}]);

/* Ctrl Busca de prestadores */
SoSCtrls.controller('PrestadoresCtrl', 
	['$scope', '$http', '$location', '$routeParams', 'Alerts',
	function($scope, $http, $location, $routeParams, Alerts) {
	 	//alert("Inicializando PrestadoresCtrl")
	 	$scope.tipoServico = $routeParams.tipoServico;
		$scope.endereco = $routeParams.endereco;
		$scope.raio = $routeParams.raio;

		$scope.prestadores = [];

		$scope.maxRate = 10;
		var urlPrestadores = 
		'http://soservices.vsnepomuceno.cloudbees.net/prestador?callback=JSON_CALLBACK';
		// 'http://soservices.vsnepomuceno.cloudbees.net/prestador/query?callback=JSON_CALLBACK';

		//Filter and order
		$scope.orderProp = '-avaliacao';
		$scope.orderBy = function (orderProp) {
			$scope.orderProp = orderProp;
		};

		//Pagination
		$scope.itemsPerPage = 1;
		$scope.setPage = function (pageNo) {
			$scope.currentPage = pageNo;
		};
		$scope.pageChanged = function() {
			$scope.currentPage
		};

		//Inicializa o mapa
		$scope.userLocation;
		var ll = new google.maps.LatLng(-7.9712137, -34.839565100000016);
	    $scope.mapOptions = {
	        center: ll,
	        zoom: 15,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };

		
		$scope.getPesquisadores = function() {

			geo.geocode({'address':$scope.endereco},function(results, status){
	          	if (status == google.maps.GeocoderStatus.OK) {
					$scope.userLocation = results[0].geometry.location;
	        		ll = new google.maps.LatLng($scope.userLocation.lat(), $scope.userLocation.lng());

				    /*$scope.prestParams = 
					    {
				    		"tipo_servico_id" : 3,
							"latitude" : $scope.userLocation.lat(),
							"longitude" : $scope.userLocation.lng(),
							"distancia" : $scope.raio
						}*/

					$http({method: 'GET', url: urlPrestadores/*, params: $scope.prestParams*/}).
				    	success(function(data, status, headers, config) {
							$scope.prestadores = data;
					    	//TODO: Alterar variaveis quando realizar link com paginacao
								$scope.bigTotalItems = $scope.prestadores.length;
							$scope.bigCurrentPage = 1;

							// alert('Chamando carrega mapa..');
						    $scope.carregarMapa();
					    }).
					    error(function(data, status, headers, config) {
					     	Alerts.addAlert('Erro: ' + status +' '+ data, 'danger');
					    });
	          	} else {
	            	alert("Geocode was not successful for the following reason: " + status);
	          	}
		    });
		};

		$scope.carregarMapa = function() {
        	$scope.myMarkers = new Array();
	        //Adiciona marcadores para cada prestador encontrado
	        var i;
	    	for (i = 0; i < $scope.prestadores.length; ++i) {
				var newMarker = 
		            $scope.myMarkers.push(
		            	new google.maps.Marker({
			                map: $scope.sosMap,
			                position: new google.maps.LatLng(
								$scope.prestadores[i].endereco.latitude,
								$scope.prestadores[i].endereco.longitude),
			                icon: 'img/map_icon_prest.png'
		            	})
		            );
			}

	        $scope.myMarkers.push(
	        	new google.maps.Marker({
		            map: $scope.sosMap,
		            position: ll
	        	})
	        );
	        $scope.myMarkers.push($scope.newMarkers); //Adiciona novos marcadores.
        	$scope.sosMap.panTo(ll); //Centraliza o mapa no endere√ßo informado.
		}

		if($scope.tipoServico && $scope.endereco && $scope.raio){
			$scope.getPesquisadores();
		}	
	    
	    //Markers should be added after map is loaded
	    $scope.onMapIdle = function() {
	        
	    };

	    $scope.markerClicked = function(m) {
	        window.alert("clicked");
	    };
	}
]);

//Controler Example
SoSCtrls.controller('MyCtrl2', ['$scope', function($scope) {
}]);


//Controla o dialog de anuncio de servicos
var AnuncioCtrl = function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

//Controla o dialog de "sign in" / "sign up"
var LoginCtrl = function ($scope, $http, $modalInstance, Alerts, user) {
	
  $scope.user = user;
			
  $scope.logar = function () {	 
	  
	    if ( $scope.user.email != '' && $scope.user.senha != null) {
			$http({
				method : 'POST',
				url : 'http://soservices.vsnepomuceno.cloudbees.net/token/login',
				data : $scope.user,
				headers: {'Content-Type': 'application/json'}
			}).
			success(function(data, status, headers, config) {
				$modalInstance.close(data);
	
			}).error(function(data, status, headers, config) {
				Alerts.addAlert('Erro: ' + status + ' ' + data, 'danger');
			});    
	    } 
  };

  $scope.cancel = function () {
	limparUsuario(user);
    $modalInstance.dismiss('cancel');
  };
};

//Controla o dialog de cadastro
var cadastrarCtrl = function ($scope, $http, $modalInstance, Alerts, user) {
	
  $scope.user = user;
			
  $scope.cadastrar = function () {	 
	  
	 if ( $scope.user.email != '' && $scope.user.senha != null && 
			 $scope.user.nome != '' && $scope.user.confirmarsenha != null && 
			 $scope.user.senha != '' && $scope.user.confirmarsenha != '') {
		 if (angular.equals($scope.user.senha, $scope.user.confirmarsenha) ) {
			$http({
				method : 'POST',
				url : 'http://soservices.vsnepomuceno.cloudbees.net/usuario',
				data : $scope.user,
				headers: {'Content-Type': 'application/json'}
			}).
			success(function(data, status, headers, config) {
				$modalInstance.close(data);
			
			}).error(function(data, status, headers, config) {
				Alerts.addAlert('Erro: ' + status + ' ' + data, 'danger');
			});    
		 }else {
		    	Alerts.addAlert('Senha e confirmaÁ„o diferentes!');
	      }
	  }
  };

  $scope.cancel = function () {
    limparUsuario(user);
    $modalInstance.dismiss('cancel');
  };
};

var limparUsuario = function(user) {
	user.nome='';
	user.email='';
	user.senha='';
	user.confirmarsenha='';
};