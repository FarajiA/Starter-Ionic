; (function () {

    angular.module('App').controller('LoginController', ['$scope', '$state', 'AuthService', 'UserStore', function ($scope, $state , AuthService, UserStore) {

        var vm = this;

        vm.showLoginForm = true;
        //vm.registerFormShow = !vm.loginFormShow;

        // function to submit the form after all validation has occurred
        vm.submitLogin = function (user) {
            if (vm.loginform.$valid) {                
                AuthService.Login(user).then(function (response) {
                    $scope.$parent.userInitiate(response.userName).then(function () {
                        $state.go("main.dash");
                    }), function (err) {
                        console.log("error logging user in: " + err)
                    };
                });
            }
        };

        vm.submitRegister = function (user) {
            if (vm.registerform.$valid) {
                AuthService.Register(user).then(function (UserAcct) {
                    AuthService.Login(user).then(function (response) {
                        $scope.$parent.userInitiate(response.userName);
                        $state.go('main.dash');
                    });
                });
            };
        };
    }]);
})();