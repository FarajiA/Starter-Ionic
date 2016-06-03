/// <reference path="shared/templates/tabs.html" />
/// <reference path="shared/templates/tabs.html" />
const baseURL_CONSTANT = "http://localhost:59822/";
const signalRURL_CONSTANT = "http://localhost:59822/socketpocket";
const clientID_CONSTANT = "ngAuthApp";
const refreshTokenLife_CONSTANT = 7;
const countSet_CONSTANT = 20;

const newMesssageTitle_CONSTANT = "New Message";
const newRequestTitle__CONSTANT = "New Request";
const newChasingTitle__CONSTANT = "Accepted Request";
const newChaserTitle__CONSTANT = "New Chaser";
const newBroadcasting_CONSTANT = "Broadcasting"
const newMesssage_CONSTANT = "{0} sent you a message.";
const newRequest_CONSTANT = "{0} sent you a request.";
const newChasing_CONSTANT = "{0} accepted your request.";
const newChaser_CONSTANT = "{0} started chasing you."

var app = angular.module('App', ['ionic',
        'oc.lazyLoad',
        'oc.lazyLoad',
        'LocalStorageModule',
        'toaster',
        'angular-jwt'
]);

app.run(function (AuthService, $state, $rootScope, $ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }
    });
    
    AuthService.fillAuthData();

    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {

        var authdata = AuthService.authentication;

        if ($rootScope.stateChangeBypass || toState.name === 'login' || toState.name == 'register') {
            $rootScope.stateChangeBypass = false;
            return;
        }

        event.preventDefault();

        if (authdata.isAuth) {
            $rootScope.stateChangeBypass = true;
            $state.go(toState, toParams);
        }
        else {
            $state.go('login');
        }
    });   
});

app.config(RouteMethods, ocLazyLoadProvider);
RouteMethods.$inject = ["$stateProvider", "$urlRouterProvider", "$httpProvider"];
ocLazyLoadProvider.$inject = ["$ocLazyLoadProvider"];

function RouteMethods($stateProvider, $urlRouterProvider, $httpProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

    // setup an abstract state for the tabs directive
      .state('main', {
          url: '/main',
          abstract: true,
          templateUrl: 'shared/templates/tabs.html'
      })

    // Each tab has its own nav history stack:
      .state('main.dash', {
          url: '/dash',
          views: {
              'main-dash': {
                  templateUrl: 'components/dash/dash.html',
                  controller: 'DashController as vm'
              }
          },
          resolve: {
              loadExternals: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'dash',
                      files: [
                          'components/dash/dash.js',
                      ]
                  });
              }],
              data: ['$ionicSideMenuDelegate', function ($ionicSideMenuDelegate) {
                  $ionicSideMenuDelegate.canDragContent(true);
              }]
          }
      })
      .state('main.traffic', {
          url: '/traffic/:chasing',
          views: {
              'main-traffic': {
                  templateUrl: 'components/traffic/traffic.html',
                  controller: 'TrafficController as vm'
              }
          },
          resolve: {
              loadExternals: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'traffic',
                      files: [
                          'components/traffic/traffic.js'
                      ]
                  });
              }],
              data: ['$ionicSideMenuDelegate', function ($ionicSideMenuDelegate) {
                  $ionicSideMenuDelegate.canDragContent(false);
              }]
          }
      })
      .state('main.activity', {
          url: '/activity/:requests',
          views: {
              'main-activity': {
                  templateUrl: 'components/activity/activity.html',
                  controller: 'ActivityController as vm'
              }
          },
          resolve: {
              loadExternals: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'activity',
                      files: [
                          'components/activity/activity.js'
                      ]
                  });
              }],
              data: ['$ionicSideMenuDelegate', function ($ionicSideMenuDelegate) {
                  $ionicSideMenuDelegate.canDragContent(false);
              }]
          }
      })
      .state('main.messages', {
          url: '/messages',
          views: {
              'main-messages': {
                  templateUrl: 'components/messages/messages.html',
                  controller: 'MessagesController as vm'
              }
          },
          resolve: {
              loadExternals: ['$ocLazyLoad', function ($ocLazyLoad) {
                  return $ocLazyLoad.load({
                      name: 'messages',
                      files: [
                          'components/messages/messages.js'
                      ]
                  });
              }],
              data: ['$ionicSideMenuDelegate', function ($ionicSideMenuDelegate) {
                  $ionicSideMenuDelegate.canDragContent(false);
              }]
          }
      })
      .state('login', {
          url: '/login',
          templateUrl: 'components/login/login.html',
          controller: 'LoginController as vm',
          resolve: {
              loadExternals: [
                  '$ocLazyLoad', function ($ocLazyLoad) {
                      return $ocLazyLoad.load({
                          name: 'login',
                          files: [
                              'components/login/login.js'
                          ]
                      });
                  }
              ]
          }
      });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise(function ($injector) {
        var $state = $injector.get("$state");
        $state.go("main.dash");
    });

    $httpProvider.interceptors.push('authInterceptorService');
};


function ocLazyLoadProvider($ocLazyLoadProvider) {
    $ocLazyLoadProvider.config({
        debug: true
    });
};


/************ Factory Services **********/
// Store and Process User data
app.factory('AuthService', ['$http', '$q', 'localStorageService', 'jwtHelper', 'UserStore', function ($http, $q, localStorageService, jwtHelper, UserStore) {

    var authServiceFactory = this;

    authServiceFactory.authentication = {
        isAuth: false,
        userName: "",
        token: "",
        refreshToken: "",
        refreshTokenExp: ""
    };

    authServiceFactory.externalAuthData = {
        provider: "",
        userName: "",
        externalAccessToken: ""
    };

    authServiceFactory.Register = function (registration) {

        authServiceFactory.logOut();
        var deferred = $q.defer();

        $http.post(baseURL_CONSTANT + 'api/accounts/register', registration, { skipAuthorization: true }).success(function (response) {
            deferred.resolve(response.result);
        }).error(function (err, status) {
            authServiceFactory.logOut();
            deferred.reject(err);
        });

        return deferred.promise;
    };

    authServiceFactory.Login = function (loginData) {

        var data = "grant_type=password&username=" + loginData.username + "&password=" + loginData.password + "&client_id=" + clientID_CONSTANT;;

        var deferred = $q.defer();
        var date = new Date();

        $http.post(baseURL_CONSTANT + 'oauth/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, skipAuthorization: true }).success(function (response) {

            var refreshTokenDate = date.setDate(date.getDate() + refreshTokenLife_CONSTANT);
            localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.username, refreshToken: response.refresh_token, refreshExpiration: refreshTokenDate });

            authServiceFactory.authentication.isAuth = true;
            authServiceFactory.authentication.userName = response.userName;
            authServiceFactory.authentication.token = response.access_token;
            authServiceFactory.authentication.refreshToken = response.refresh_token;
            authServiceFactory.authentication.refreshTokenExp = refreshTokenDate;
            deferred.resolve(response);

        }).error(function (err, status) {
            authServiceFactory.logOut();
            deferred.reject(err);
        });

        return deferred.promise;
    };

    authServiceFactory.logOut = function () {

        localStorageService.remove('authorizationData');

        authServiceFactory.authentication.isAuth = false;
        authServiceFactory.authentication.userName = "";
        authServiceFactory.authentication.token = "";
        authServiceFactory.authentication.refreshToken = "";
        authServiceFactory.authentication.refreshTokenExp = "";
    };

    authServiceFactory.fillAuthData = function () {
        var authData = localStorageService.get('authorizationData');
        if (authData) {
            authServiceFactory.authentication.isAuth = true;
            authServiceFactory.authentication.userName = authData.userName;
            authServiceFactory.authentication.token = authData.token;
            authServiceFactory.authentication.refreshToken = authData.refreshToken;
            authServiceFactory.authentication.refreshTokenExp = authData.refreshTokenExp;
        }
    };

    authServiceFactory.refreshToken = function () {
        var deferred = $q.defer();

        var authData = localStorageService.get('authorizationData');
        if (authData) {

            var data = "grant_type=refresh_token&refresh_token=" + authData.refreshToken + "&client_id=" + clientID_CONSTANT;
            localStorageService.remove('authorizationData');
            var date = new Date();
            $http.post(baseURL_CONSTANT + 'oauth/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, skipAuthorization: true }).success(function (response) {
                var refreshTokenDate = date.setDate(date.getDate() + 7);
                localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: response.refresh_token, refreshExpiration: refreshTokenDate });
                deferred.resolve(response);
            }).error(function (err, status) {
                authServiceFactory.logOut();
                deferred.reject(err);
            });
        }

        return deferred.promise;
    };

    authServiceFactory.obtainAccessToken = function (externalData) {

        var deferred = $q.defer();

        $http.get(baseURL_CONSTANT + 'api/account/ObtainLocalAccessToken', { params: { provider: externalData.provider, externalAccessToken: externalData.externalAccessToken } }).success(function (response) {
            localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: "", useRefreshTokens: false });

            authServiceFactory.authentication.isAuth = true;
            authServiceFactory.authentication.userName = response.userName;
            authServiceFactory.authentication.useRefreshTokens = false;

            deferred.resolve(response);
        }).error(function (err, status) {
            authServiceFactory.logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    authServiceFactory.registerExternal = function (registerExternalData) {

        var deferred = $q.defer();

        $http.post(baseURL_CONSTANT + 'api/account/registerexternal', registerExternalData).success(function (response) {

            localStorageService.set('authorizationData', { token: response.access_token, userName: response.userName, refreshToken: "", useRefreshTokens: false });

            authServiceFactory.authentication.isAuth = true;
            authServiceFactory.authentication.userName = response.userName;
            authServiceFactory.authentication.useRefreshTokens = false;

            deferred.resolve(response);

        }).error(function (err, status) {
            authServiceFactory.logOut();
            deferred.reject(err);
        });

        return deferred.promise;
    };

    return authServiceFactory;
}]);

app.factory('authInterceptorService', ['$q', '$rootScope', '$injector', 'localStorageService', function ($q, $rootScope, $injector, localStorageService) {

    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        if (config.skipAuthorization) {
            return config;
        }

        config.headers = config.headers || {};

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    };

    var _responseError = function (rejection) {
        if (rejection.status === 401) {
            var authService = $injector.get('AuthService');
            var jwtHelper = $injector.get('jwtHelper');
            var refreshCount = $injector.get('RefreshCount');
            var state = $injector.get('$state');
            var authData = localStorageService.get('authorizationData');

            var date = jwtHelper.getTokenExpirationDate(authData.token);
            var expired = jwtHelper.isTokenExpired(authData.token);

            if (expired || refreshCount.count === 0) {
                authService.refreshToken().then(function (response) {
                    refreshCount.count++;
                    $rootScope.$emit("tokenRefreshed");
                    console.log("refresh token");
                },
                 function (err) {
                     console.log("an error");
                     state.go("login");
                 });
                return $q.reject(rejection);
            }
            authService.logOut();
        }
        return $q.reject(rejection);
    };

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);

app.value('RefreshCount', {
    count: 0
});

app.controller('mainController', ['$scope', '$q', '$state', 'AuthService', 'UserStore', 'Traffic', 'Activity', 'Messages', 'CentralHub', 'toaster', function ($scope, $q, $state, AuthService, UserStore, Traffic, Activity, Messages, CentralHub, $toaster) {

    var mc = this;

    $scope.user = UserStore.data();

    $scope.loadRequestState = false;
    $scope.loadChasingState = false;

    var authdata = AuthService.authentication;
    $scope.badge = {
        Activity: "",
        Traffic: "",
        Messages:  ""
    };

    mc.badgeTrafficCheck = function () {
        if (_.isEqual($scope.badge.Traffic, 1)) {
            $scope.loadChasingState = true;
            Traffic.viewed().then(function (response) {
                $scope.badge.Traffic = 0;
            });
        }
    };

    mc.badgeActivityCheck = function () {
        if (_.isEqual($scope.badge.Activity, 1)) {
            $scope.loadRequestState = true;
            Activity.viewed().then(function (response) {
                $scope.badge.Activity = 0;
            });
        }
    };


    $scope.userInitiate = function (username) {
        var deffered = $q.defer();
        UserStore.setUser(username).then(function (response) {
            $scope.user = response;
            $q.all([
                Traffic.chasers(0),
                Traffic.chasing(0),
                Activity.broadcasting(0),
                Activity.requests(0),
                Messages.inbox(0)
            ]).then(function (value) {
                // Success callback where value is an array containing the success values
                var newChasers = _.some(value[0].results, ['viewed', false]);
                var newBroadcasters = _.some(value[2].results, ['viewed', false]);
                var newRequests = _.some(value[3].results, ['viewed', false]);
                var newMessages = _.some(value[4].results, ['viewed', false]);
                
                $scope.badge.Activity = newRequests ? 1 : "";
                $scope.badge.Traffic = newChasers ? 1 : "";
                $scope.badge.Messages = newMessages ? 1 : "";
                
                if ($state.current.name === 'main.activity')
                    mc.badgeActivityCheck();
                if ($state.current.name === 'main.traffic')
                    mc.badgeTrafficCheck();

                CentralHub.initialize('centralHub');
                deffered.resolve(true);
            }, function (reason) {
                // Error callback where reason is the value of the first rejected promise
                deffered.reject(reason);
            });
        }, function (error) {
            deffered.reject(error);
        }).finally(function () {
            mc.loadingDone = true;
        });

        return deffered.promise;
    };

    if (authdata.isAuth) {
        $scope.userInitiate(authdata.userName);
    } else {
        mc.loadingDone = true;
    }
    /*
    var displayNotification = function (notify) {
        
    };
    */

    $scope.$parent.$on("centralHubNotification", function (e, notify) {
        var title;
        var text;

        newMesssageTitle_CONSTANT = "New Message";
       newRequestTitle__CONSTANT = "New Request";
        newChasingTitle__CONSTANT = "Accepted Request";
         newChaserTitle__CONSTANT

        switch(notify.type){

            case "0" :
                title = newChaserTitle__CONSTANT;
                text = newChasing_CONSTANT;
                break;
            case "" :
        }

        $scope.$apply(function () {
            toaster.pop('success', title, _.replace(text, '{0}', notify.username), "", 'trustedHtml', function (toaster) {
                console.log("stuff yea whatever");
            });
        });
    });

    $scope.$parent.$on("tokenRefreshed", function () {
        $scope.userInitiate(authdata.userName);
    });
    
    mc.CheckBadge = function (badge) {
        switch (badge) {
            case 0:
                mc.badgeTrafficCheck();
                break;
            case 1:
                mc.badgeActivityCheck();
                break;
            case 2:
                if (_.isEqual($scope.badge.Messages, 1)) {
                    $scope.badge.Messages = 0;
                }
                break;
        }
    };



}]);
