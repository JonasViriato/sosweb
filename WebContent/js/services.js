'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
var SoServices = angular.module('sosWeb.services', ['ngResource', 'ngStorage']);

SoServices.value('version', '0.0.1');

SoServices.service('Alerts', function () { //Alerts/Messages	
	var alerts = [];
	this.addAlert = function (strMsg, type) {
		alerts.push({"msg": strMsg, "type": type});
	};

	this.removeAlert = function(index) {
		alerts.splice(index, 1);
	};

	this.getAll = function() {
		return alerts;
	};

	// this.addAlert('Teste Danger', 'danger');
	// this.addAlert('Teste Success', 'success');
	// this.addAlert('Teste Info', 'info');
});

SoServices.factory('Authentication', function($localStorage){		
	
	var userAuth = {
			nome: '',
		    email: '',
		    senha: null,
		    apiKey: '',
		    logado: false
	};
	
	if ($localStorage.currentUserJson == null) {
		$localStorage.currentUserJson = angular.toJson(userAuth);
	} 

  return {
    login: function(userLogin) { 
    	userAuth = userLogin;
    	$localStorage.currentUserJson = angular.toJson(userAuth);
    },
    logout: function(userLogout) { 
    	userAuth = userLogout;
    	$localStorage.currentUserJson = angular.toJson(userAuth);
    	delete $localStorage.currentUserJson;
    },
    isLoggedIn: function() { userAuth.logado; },
    currentUser: function() { 
    	userAuth = angular.fromJson($localStorage.currentUserJson);
    	return userAuth;
    }
  };
});