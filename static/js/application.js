var app = angular.module('ascii-warehouse', []);
app.controller('ProductsController', function($scope) {
    var apiUrl = '/api/products';
    var perPage = 15;
    var total = 15;
    var sort = 'id';

    $scope.products = [];

    function init() {
        $scope.sortBy(sort);
        scrollListener(getMore);
    }

    function scrollListener(callback) {
        window.addEventListener("scroll", function() {
            var currentYOffset = window.innerHeight + window.pageYOffset;
            if (currentYOffset >= document.body.offsetHeight) callback();
        })
    }

    function addProducts(moreProducts) {
        for (var i in moreProducts) {
            $scope.products.push(moreProducts[i]);
        }
        $scope.$apply();
    }

    function getMore() {
        fetchProducts(total);
        total = total + perPage; 
    }

    function ndjsonToJson(ndjson) {
        var jsonArrayStrings = ndjson.split('\n');
        var jsonArrayObjects = [];
        
        for (var i in jsonArrayStrings) {
            if (jsonArrayStrings[i]) jsonArrayObjects[i] = JSON.parse(jsonArrayStrings[i]);
        }

        return jsonArrayObjects;
    }

    function fetchProducts(skip) {
        var url = apiUrl + '?sort=' + sort + '&limit=' + perPage + '&skip=' + skip;
        $.ajax(url).complete(function(data) {
            addProducts(ndjsonToJson(data.responseText))
        });
    }

    $scope.sortBy = function(filter) {
        sort = filter;
        $scope.products = [];
        fetchProducts(0);
    }

    init();
});
