var app = angular.module('ascii-warehouse', []);

app.controller('ProductsController', function($scope) {
    var apiUrl = '/api/products';
    var total = 15;

    $scope.products = [];

    function init() {
        fetchProducts();
    }

    function setProducts(products) {
        $scope.products = products;
        $scope.$apply();
    }

    function addProducts(moreProducts) {
        for (var i in moreProducts) {
            $scope.products.push(moreProducts[i]);
        }
        $scope.$apply();
    }

    function ndjsonToJson(ndjson) {
        var jsonArrayStrings = ndjson.split('\n');
        var jsonArrayObjects = [];
        
        for (var i in jsonArrayStrings) {
            if (jsonArrayStrings[i]) jsonArrayObjects[i] = JSON.parse(jsonArrayStrings[i]);
        }

        return jsonArrayObjects;
    }

    function fetchProducts(sortBy) {
        var url = apiUrl;
        if (sortBy) url = url + '?sort=' + sortBy;

        $.ajax(url).complete(function(data) {
            setProducts(ndjsonToJson(data.responseText))
        });
    }

    $scope.sortBy = function(filter) {
        var url = apiUrl + '?sort=' + filter + '';

        $.ajax(url).complete(function(data) {
            setProducts(ndjsonToJson(data.responseText))
        });
    }

    init();
});
