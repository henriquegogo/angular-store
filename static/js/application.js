var app = angular.module('ascii-warehouse', []);

app.controller('ProductsController', function($scope) {
    var apiUrl = '/api/products';
    var perPage = 15;
    var limit = 15;
    var sort = 'id';

    $scope.products = [];

    function init() {
        $scope.sortBy(sort);
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

    function fetchProducts(params) {
        var url = apiUrl + params;
        $.ajax(url).complete(function(data) {
            addProducts(ndjsonToJson(data.responseText))
        });
    }

    $scope.sortBy = function(filter) {
        sort = filter;
        limit = perPage;
        var params = '?sort=' + sort + '&limit=' + limit + '&skip=0';
        $scope.products = [];
        fetchProducts(params);
    }

    $scope.getMore = function() {
        limit = limit + perPage; 
        var params = '?sort=' + sort + '&limit=' + limit + '&skip=' + (limit - perPage);
        fetchProducts(params);
    }

    init();
});
