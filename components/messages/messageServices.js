; (function () {
    angular.module('App').factory("Messages", ['$http', '$q', 'UserStore', function ($http, $q, UserStore) {
        var inboxMessages = [];
        var getChasers = [];
        var Message = {};

        Message.inbox = function (index) {
            var deffered = $q.defer();

            $http.get(baseURL_CONSTANT + "api/messages/inbox/" + index + "/" + countSet_CONSTANT, {
                cache: false
            })
            .success(function (d) {
                inboxMessages = d;
                deffered.resolve(d);
            })
            .error(function (data, status) {
                console.log("Request failed " + status);
            });
            
            return deffered.promise;
        };
        /*
        Message.chasing = function (index) {
            var deffered = $q.defer();
            var guid = UserStore.data().GUID;
            $http.get(baseURL_CONSTANT + "api/chasing/" + guid + "/" + index + "/" + countSet_CONSTANT, {
                cache: false
            })
            .success(function (d) {
                deffered.resolve(d);
            })
            .error(function (data, status) {
                console.log("Request failed " + status);
            });

            return deffered.promise;
        };

        Message.unfollow = function (guid) {
            var deffered = $q.defer();

            return deffered.promise;
        };
        */
        Message.inboxMessages = function () { return inboxMessages; };
        return Message;
    }]);

})();