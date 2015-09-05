var faker = require('Faker');
var getQueryParams = require('./get-query-params');

function getRandomString () {
    return (Math.random()).toString(36).substr(2);
}

function getRandomInRange (min, max) {
    return Math.floor(Math.random() * (max-min)) + min;
}

function createRandomItem (i, sort) {
    var obj = {
        id: getRandomInRange(0, 100000) + '-' + getRandomString(),
        price: getRandomInRange(1, 1000),
        description: faker.Name.firstName(),
        date: new Date(Date.now() - getRandomInRange(1, 1000 * 3600 * 24 * 15)).toString()
    };

    if (sort === 'id') {
        obj.id = i + '-' + getRandomString();
    }
    else if (sort === 'price') {
        obj.price = Math.min(1000, Math.floor(i * 0.1)+1);
    }

    return obj;
}

module.exports = function (req, res) {
    var params = getQueryParams(req.url);
    var limit = parseInt(params.limit, 10) || 10;
    var skip = parseInt(params.skip, 10) || 0;
    var sort = params.sort || 'id';

    res.writeHead(200, {
        'Content-Type': 'application/x-json-stream'
    });

    // random delay
    setTimeout(function () {
        var i;
        for (i=0; i<limit; i+=1) {
            res.write(JSON.stringify(createRandomItem(i+skip, sort)) + '\n');
        }
        res.end();
    }, 100 + Math.floor(Math.random() * 3000));
};
