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
    var requestIsRunning = false;
    var preloadedProducts = null;

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
        if (!requestIsRunning) {
            var url = apiUrl + '?sort=' + sort + '&limit=' + perPage + '&skip=' + total;

            requestIsRunning = true;
            $http.get(url, { transformResponse: function(value) { 
                return ndjsonToJson(value);
            }}).then(function(response) {
                requestIsRunning = false;
                callback(response.data);
            });
        }
    }

    function preloader() {
        var total = $scope.products.length;
        requestProducts(total, function(products) {
            preloadedProducts = products;
        });
    }

    function fetchProducts(total) {
        if (preloadedProducts && total + perPage <= maximum) {
            addProducts(preloadedProducts);
            preloadedProducts = null;
            preloader();

        } else if (total + perPage <= maximum) { // Forcing a maximum quantity of products
            $scope.isLoading = true;
            requestProducts(total, function(products) {
                $scope.isLoading = false;
                addProducts(products);
                preloader();
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
