/**
 * Created by mac on 16/7/30.
 */

var rp = require('request-promise');
var cheerio = require('cheerio');
var config = require('./config');
var book = require('./models').Book;
var ysbook = require('./models').Bookys;
var review = require('./models').Review;
var mongoose = require('./models').mongoose;
var async = require('async');
var maxbookid = config.maxbookid;
var Promise = require('bluebird');
var fs = require('fs');

var ws = fs.createWriteStream('./errInfo.txt');


var digReviewsInfoFromSquare = function (options) {
    console.log('begin!');
    var reg = /[0-9]{1,15}/g;
    var re = /[^《》]*/g;
    rp(options)
        .then(function (data) {
            // console.log(data.statusCode);
            // console.log(data);
            $ = cheerio.load(data);
            var reviews = [];
            $('div.media-body').each(function () {
                var reviewInfo = {};
                reviewInfo.rate = $(this).find('h5 > small > span').text();
                reviewInfo.commentid = $(this).find('div.ys-comments-btns').attr('data-cid').trim();
                reviewInfo.userid = $(this).find('h5.media-heading a').attr('href').match(reg).join('');
                reviewInfo.username = $(this).find('h5.media-heading a').text().trim();
                reviewInfo.usercomment = $(this).find('div.ys-comments-message p').text().trim();
                reviewInfo.bookname = $(this).find('div.ys-comments-message > small > a').text().match(re).join('').trim();
                reviewInfo.bookid = $(this).find('div.ys-comments-message > small > a').attr('href').match(reg).join('');
                reviews.push(reviewInfo);
                // console.log(reviewInfo.bookname);
                // console.log(reviewInfo.bookid);
            })
            maplimit = Promise.promisify(require('async').mapLimit);
            maplimit(reviews,1,function (reviewInfo, callback) {
                review.count({commentid:mongoose.Types.ObjectId(reviewInfo.commentid)})
            })

            if ($('body > div.sokk-body > div > div > div > a').attr('onclick') != undefined) {
                var nexttime = $('body > div.sokk-body > div > div > div > a').attr('onclick').match(reg).join('');
                console.log(nexttime);
                var option = {
                    uri: 'http://www.yousuu.com/comments',
                    qs: {
                        t: nexttime // -> uri + '?access_token=xxxxx%20xxxxx'
                    },
                    // headers: {
                    //     'User-Agent': 'Request-Promise'
                    // },
                    json: true // Automatically parses the JSON string in the response
                }
                var deal = function () {
                    digReviewsInfoFromSquare(option);
                }
                setTimeout(deal,100);
            }
        })
}

exports.digReviewsInfoFromSquare = digReviewsInfoFromSquare;

var options = {
    uri: 'http://www.yousuu.com/comments',
    // qs: {
    //     t: nexttime // -> uri + '?access_token=xxxxx%20xxxxx'
    // },
    // headers: {
    //     'User-Agent': 'Request-Promise'
    // },
    // resolveWithFullResponse: true,
    json: true // Automatically parses the JSON string in the response
};
// digReviewsInfoFromSquare(options);


console.log(new Date().getTime());
console.log(new Date().getTimezoneOffset());
console.log(new Date().getUTCDate());
console.log(new Date().getUTCDay());
console.log(new Date().getMilliseconds());

console.log(new Date().getTime());
console.log(new Date().getFullYear());
console.log(new Date().getHours());
console.log(new Date().getMinutes());
console.log(new Date().getSeconds());
console.log(new Date().getDate());
console.log(new Date().getDay());
console.log(new Date().getMonth());
