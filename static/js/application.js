var app = angular.module('ascii-warehouse', []);

app.filter('daysago', function() {
    function timeAgo(date) {
        var seconds = Math.floor((new Date() - date) / 1000);
        var interval = Math.floor(seconds / 86400);

        if (interval > 7) return date.toLocaleString();
        if (interval > 1) return interval + " days ago";
        interval = Math.floor(seconds / 3600);
        if (interval > 1) return interval + " hours ago";
        interval = Math.floor(seconds / 60);
        if (interval > 1) return interval + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    }

    return function(input) {
        var dateObject = new Date(input);
        return timeAgo(dateObject);
    }
});

app.controller('ProductsController', ['$scope', '$http', function($scope, $http) {
    var apiUrl = '/api/products';
    var perPage = 10;
    var maximum = 100;
    var sort = 'id';

    function init() {
        clearState();
        $scope.sortBy(sort);
        scrollListener($scope.getMore);
    }

    function scrollListener(callback) {
        angular.element(window).bind('scroll', function() {
            var currentYOffset = window.innerHeight + window.pageYOffset;
            if (currentYOffset >= document.body.offsetHeight) $scope.$apply(callback);
        })
    }

    function clearState() {
        $scope.products = [];
        $scope.isLoading = false;
        $scope.isEndOfCatalogue = false;
    }

    function addProducts(moreProducts) {
        for (var i in moreProducts) {
            $scope.products.push(moreProducts[i]);
        }
    }

    function ndjsonToJson(ndjson) {
        var jsonArrayStrings = ndjson.split('\n');
        var jsonArrayObjects = [];
        
        for (var i in jsonArrayStrings) {
            if (jsonArrayStrings[i]) jsonArrayObjects[i] = JSON.parse(jsonArrayStrings[i]);
        }

        return jsonArrayObjects;
    }

    function requestProducts(total, callback) {
        if (!$scope.isLoading) {
            var url = apiUrl + '?sort=' + sort + '&limit=' + perPage + '&skip=' + total;

            $scope.isLoading = true;
            $http.get(url, { transformResponse: function(value) { 
                return ndjsonToJson(value);
            }}).then(function(response) {
                $scope.isLoading = false;
                callback(response.data);
            });
        }
    }

    function fetchProducts(total) {
        if (total + perPage <= maximum) { // Forcing a maximum quantity of products
            requestProducts(total, function(products) {
                addProducts(products);
            });
        } else if (total + perPage > maximum) {
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
        fetchProducts($scope.products.length);
    };

    init();
}]);
