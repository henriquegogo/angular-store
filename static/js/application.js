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
    var sponsorPeriodicity = 20;
    var preloadedProducts = null;
    var requestIsRunning = false;
    var lastSponsorId = null;
    var runPreloader = true;
    $scope.products = [];

    function init() {
        $scope.getMore();
        scrollListener($scope.getMore);
    }

    function scrollListener(callback) {
        angular.element(window).bind('scroll', function() {
            var currentYOffset = window.innerHeight + window.pageYOffset;
            if (currentYOffset >= document.body.offsetHeight) $scope.$apply(callback);
        })
    }

    function clearState() {
        preloadedProducts = null;
        lastSponsorId = null;
        runPreloader = true;
        $scope.products = [];
        $scope.isLoading = false;
        $scope.isEndOfCatalogue = false;
    }

    function randomUniqueId() {
        function generateId() { return Math.floor(Math.random()*1000) % 16 + 1; }
        var newId = generateId();
        while (newId == lastSponsorId) newId = generateId();
        lastSponsorId = newId;

        return newId;
    }

    function addProducts(moreProducts) {
        for (var i in moreProducts) {
            $scope.products.push(moreProducts[i]);

            if ($scope.products.length % 20 === 0) {
                var sponsor = { isSponsor: true, id: randomUniqueId() };
                $scope.products.push(sponsor);
            }
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
            if (runPreloader) {
                preloadedProducts = products;
                if ($scope.isLoading) showPreloaded();

            } else {
                fetchProducts(0);
            }

        });
    }

    function showPreloaded() {
        runPreloader = true;
        $scope.isLoading = false;
        addProducts(preloadedProducts);
        preloadedProducts = null;
        preloader();
    }

    function fetchProducts(total) {
        if (preloadedProducts && total + perPage <= maximum) {
            showPreloaded();

        } else if (total + perPage <= maximum) { // Forcing a maximum quantity of products
            $scope.isLoading = true;
            requestProducts(total, function(products) {
                preloadedProducts = products;
                showPreloaded();
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
        runPreloader = false;
        fetchProducts(0);
    };

    $scope.getMore = function() {
        fetchProducts($scope.products.length);
    };

    init();
}]);
