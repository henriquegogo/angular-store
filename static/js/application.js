angular.module('viewFilters', []).filter('daysago', function() {
    return function(input) {
        var dateObject = new Date(input);
        var dateRepresentation = dateObject.toLocaleString();

        return dateRepresentation;
    }
});

var app = angular.module('ascii-warehouse', ['viewFilters']);
app.controller('ProductsController', function($scope) {
    var apiUrl = '/api/products';
    var perPage = 15;
    var total = perPage;
    var maximum = 100;
    var sort = 'id';

    function init() {
        clearState();
        $scope.sortBy(sort);
        scrollListener($scope.getMore);
    }

    function scrollListener(callback) {
        window.addEventListener("scroll", function() {
            var currentYOffset = window.innerHeight + window.pageYOffset;
            if (currentYOffset >= document.body.offsetHeight) callback();
        })
    }

    function clearState() {
        total = perPage;
        $scope.products = [];
        $scope.isLoading = false;
        $scope.isEndOfCatalogue = false;
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

    function fetchProducts(skipValue) {
        if (skipValue <= maximum) { // Forcing a maximum quantity of products
            var url = apiUrl + '?sort=' + sort + '&limit=' + perPage + '&skip=' + skipValue;
            $scope.isLoading = true;
            $.ajax(url).complete(function(data) {
                $scope.isLoading = false;
                addProducts(ndjsonToJson(data.responseText))
            });
        } else {
            $scope.isEndOfCatalogue = true;
        }
    }

    $scope.loadProductsLabel = function() {
        if ($scope.isLoading) return "Loading...";
        else if ($scope.isEndOfCatalogue) return "~ end of catalogue ~";
        else return "More products";
    };

    $scope.sortBy = function(filter) {
        sort = filter;
        clearState();
        fetchProducts(0);
    };

    $scope.getMore = function() {
        fetchProducts(total);
        $scope.$apply();
        total = total + perPage; 
    };

    init();
});
