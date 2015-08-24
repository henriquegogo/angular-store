var app = angular.module('ascii-warehouse', []);

app.controller('ProductsController', function($scope) {
    var controller = this;

    controller.all = [];

    controller.init = function() {
        controller.fetchProducts();
    }

    controller.setProducts = function(products) {
        controller.all = products;
        $scope.$apply();
    }

    controller.fetchProducts = function() {
        function ndjsonToJson(ndjson) {
            var jsonArrayStrings = ndjson.split('\n');
            var jsonArrayObjects = [];
            
            for (var i in jsonArrayStrings) {
                if (jsonArrayStrings[i]) jsonArrayObjects[i] = JSON.parse(jsonArrayStrings[i]);
            }

            return jsonArrayObjects;
        }

        $.ajax('/api/products')
            .complete(function(data) {
                controller.setProducts(ndjsonToJson(data.responseText))
            });
    }

    controller.init();
});
