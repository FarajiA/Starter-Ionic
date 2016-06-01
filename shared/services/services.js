; (function () {
    angular.module('App')
        .factory('UserStore', ['$http', '$q', function ($http, $q) {
    var data = [];
    var UserObject = {};

    UserObject.setUser = function (guid) {
        var deffered = $q.defer();
        $http.get(baseURL_CONSTANT + "api/accounts/user/" + guid)
        .success(function (d) {
            data = d.result;
            deffered.resolve(d.result);
        })
        .error(function (data, status) {
            deffered.reject(data);
            console.log("Request failed " + status);
        });
        return deffered.promise;
    };

    UserObject.getUser = function (user) {
        var deffered = $q.defer();
        data = user;
        deffered.resolve(data);
        return deffered.promise;
    };

    UserObject.data = function () { return data; };
    return UserObject;
}])
   .factory('CentralHub', ['$rootScope', 'AuthService', function ($rootScope, AuthService) {
    var proxy = null;

    var initialize = function (hubName) {
        var connection = $.hubConnection(signalRURL_CONSTANT, { useDefaultPath: false });
        connection.qs = { 'bearer_token': AuthService.authentication.token };

        proxy = connection.createHubProxy(hubName);

        proxy.on('notificationReceived', function (userName, type) {
            console.log("Received notification from server:  " + userName + " - " + type);
            var notification = {
                username: userName,
                type: type
            };
            $rootScope.$emit("centralHubNotification", notification);
        });

        connection.start({ jsonp: true }).done(function (response) {
            console.log("Connection complete");
        });
    };

    var sendRequest = function (serverMethod) {
        this.proxy.invoke(serverMethod);
    };

    return {
        initialize: initialize,
        sendRequest: sendRequest
    };

   }]);

})();