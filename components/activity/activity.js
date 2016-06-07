; (function () {
    var app = angular.module('App');
    app.controller('ActivityController', ['$scope', '$stateParams', 'Activity', 'UserStore', function ($scope, $stateParams, Activity, UserStore) {
        // reusable authorization
        var vm = this;
        vm.ActivityService = Activity;

        vm.loadRequestState = $scope.$parent.loadRequestState;
        vm.showRequests = ($stateParams.requests === "requests") || _.isEqual($scope.$parent.badge.Activity, 1);
        
        var unbindBroadcasters = $scope.$watch('vm.ActivityService.broadcastingData()', function (newVal, oldVal) {
            if (_.has(newVal, 'index')) {
                vm.Broadcasting = newVal;
                unbindBroadcasters();
            }
        });

        var unbindRequests = $scope.$watch('vm.ActivityService.requestsData()', function (newVal, oldVal) {
            if (_.has(newVal, 'index')) {
                vm.Requests = newVal;
                unbindRequests();
            }
        });
        
        $scope.$watch('$parent.loadRequestState', function (newVal, oldVal) {
            vm.showRequests = newVal;
            //$scope.$parent.loadRequestState = false;
        });

    }]);
})();