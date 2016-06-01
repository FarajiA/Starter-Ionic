; (function () {
    var app = angular.module('App');
    app.controller('TrafficController', ['$scope', '$stateParams', 'Traffic', 'UserStore', function ($scope, $stateParams, Traffic, UserStore) {
        var vm = this;

        vm.TrafficService = Traffic;

        vm.loadChasingState = $scope.$parent.loadChasingState;
        vm.showChasing = ($stateParams.chasing === "chasing") || vm.loadChasingState;

        var unbindGetChasers = $scope.$watch('vm.TrafficService.getChasers()', function (newVal, oldVal) {
            if (_.has(newVal, 'index')) {
                vm.Chasers = newVal;
                unbindGetChasers();
            }
        });
        
        var unbindGetChasing = $scope.$watch('vm.TrafficService.getChasing()', function (newVal, oldVal) {
            if (_.has(newVal, 'index')) {
                vm.Chasing = newVal;
                unbindGetChasing();
            }
        });

        $scope.$watch('$parent.loadChasingState', function (newVal, oldVal) {
            vm.showChasing = newVal;
        });

    }]);
})();