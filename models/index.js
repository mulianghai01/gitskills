/**
 * Created by mac on 16/7/29.
 */

var mongoose = require('mongoose');
var config = require('../config');
var Promise = require('bluebird');

//require('mongoose-querystream-worker')

mongoose = Promise.promisifyAll(mongoose);

console.log(config.db);
mongoose.connect(config.db, {
    server: {poolSize: 20}
}, function (err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
})

var models = {
    Book: require('./book').Book,
    Review: require('./review').Review,
    Bookys: require('./ysbook').Bookys,
    mongoose:mongoose,
};

module.exports = models

