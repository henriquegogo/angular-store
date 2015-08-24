var app = angular.module('ascii-warehouse', []);

app.controller('ProductsController', function($scope) {
    var controller = this;
    controller.all = [];

    function init() {
        fetchProducts();
    }

    function setProducts(products) {
        controller.all = products;
        $scope.$apply();
    }

    function fetchProducts() {
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
                setProducts(ndjsonToJson(data.responseText))
            });
    }

    init();
});
