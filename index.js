/**
 * Created by mac on 16/7/25.
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

var crawlInfo = function () {

    const ban = new Set([2268])

    var urlist = [];
    for (var i = 0; i <= maxbookid; i++) {
        if (!ban.has(i))
            urlist.push(i);
    }
    console.log(urlist.length);
    async.mapLimit(urlist, 1, function (bookid, callback) {
        bookurl = config.urlpre + '/' + 'book/' + bookid;
        rp(bookurl).then(function (body) {

            if (body.length < 10000) {//id为空,没取到书
                callback(null, null);
                return;
            }
            try {
                // console.log('123');//获得书籍信息
                digBookInfo(body, bookid);
                // console.log('234');//获得书评信息
                digReviewsInfo(body, bookid, callback);
            } catch (err) {
                console.log(err);
            }
            finally {
                console.log(bookid);
            }



        }).catch(function (e) {
            var deal = function () {
                dealBookInfo(bookid,callback);
            };
            setTimeout(deal,3000);

            console.log(e);
        })


    });
}

var dealBookInfo = function (bookid,callback) {
    bookurl = config.urlpre + '/' + 'book/' + bookid;
    rp(bookurl).then(function (body) {

        if (body.length < 10000) {//id为空,没取到书
            callback(null, null);
            return;
        }
        try {
            // console.log('123');//获得书籍信息
            digBookInfo(body, bookid);
            // console.log('234');//获得书评信息
            digReviewsInfo(body, bookid, callback);
        } catch (err) {
            console.log(err);
        }
        finally {
            console.log(bookid);
        }



    }).catch(function (e) {
        console.log(e);
        var deal = function () {
            dealBookInfo(bookid,callback);
        };
        setTimeout(deal,3000);
    })
}

var digBookInfo = function (body, bookid) {
    $ = cheerio.load(body);
    var bookinfo = {};
    bookinfo.bookid = bookid;
    bookinfo.tag = $("div.sokk-book-buttons a.tag").text();
    bookinfo.bookname = $('div.col-sm-7').children().eq(0).children().eq(0).text();
    bookinfo.author = $('ul.list-unstyled').children().eq(0).children().eq(0).text();
    bookinfo.rate = $('div.ys-book-averrate span').text().trim();
    var reg = /[0-9]{1,5}/g;
    bookinfo.commentorNum = $('div.ys-book-averrate small').text().trim().match(reg).join('');
    bookinfo.longIntro = $('div#bookinfo div.panel-body').text().trim();
    book.count({bookid: bookid}).then(function (data) {
        if (data < 1) {
            book.create({
                bookid: bookinfo.bookid,
                rate: bookinfo.rate,
                commentorNum: bookinfo.commentorNum,
                bookname: bookinfo.bookname,
                author: bookinfo.author,
                longIntro: bookinfo.longIntro,
                tag: [bookinfo.author, bookinfo.bookname],
            }).then(function (data) {
                console.log(data);
                // callback(null, data);
            }).catch(function (e) {
                console.log(e);
                
            }).catch(function (e) {
                console.log(e);
                
            })
        }
        else {
            book.update({bookid: bookinfo.bookid}, {$set: {commentorNum: bookinfo.commentorNum}})
                .then(function (data) {
                    console.log(data);
                });
        }
    })

}

var digReviewsInfo = function (body, bookid, callback) {
    $ = cheerio.load(body);

    var reviews = [];
    var reg = /[0-9]{1,15}/g;
    // console.log($('div.caption'));
    if ($('div.caption') != undefined) {
        $('div.caption').each(function () {
            var reviewInfo = {};
            reviewInfo.commentid = $(this).find('.media').attr('data-cid').trim();
            reviewInfo.userid = $(this).find('.pull-left').attr('href').match(reg).join('');
            // reviewInfo.commentid = item('div.media').attr('data-cid');
            reviewInfo.username = $(this).find('span.media-heading').text().trim();
            reviewInfo.usercomment = $(this).find('p.commentcontent').text().trim();
            reviewInfo.booklistid = $(this).find('small.pull-right a').attr('href');
            loveweight = $(this).find('div.btn-group').children().eq(0).children().eq(1).text().trim() ;
            // console.log(reviewInfo.loveweight);
            if (reviewInfo.booklistid != undefined) {
                reviewInfo.booklistid = reviewInfo.booklistid.slice(10);
            }
            else {
                reviewInfo.booklistid = null;
            }
            if (loveweight != ''){
                reviewInfo.loveweight = loveweight;
            }
            else {
                reviewInfo.loveweight = 0;
            }
            // console.log(reviewInfo.booklistid);
            reviews.push(reviewInfo);
        })
        var asyncs = require('async');
        maplimit = Promise.promisify(require('async').mapLimit);
        maplimit(reviews, 1, function (reviewInfo, cb) {
            review.count({commentid: mongoose.Types.ObjectId(reviewInfo.commentid)}).then(function (data) {
                // console.log(data);
                if (data < 1) {
                    review.create({
                        bookid: bookid,
                        bookname: reviewInfo.bookname,
                        userid: reviewInfo.userid,
                        username: reviewInfo.username,
                        usercomment: reviewInfo.usercomment,
                        commentid: mongoose.Types.ObjectId(reviewInfo.commentid),
                        booklistid: reviewInfo.booklistid,
                        loveweight:reviewInfo.loveweight,
                    }).then(function (data) {
                        console.log(data);
                        cb(null, null);
                    }).catch(function (e) {
                        console.log(e);
                    })
                }
                else {
                    cb(null, null);
                }
            })
        }).then(function () {
            if ($('div#next_comment_btn a').attr('onclick') != undefined) {
                // http://www.yousuu.com/ajax/nextcomment?bid=43326&nexttime=1468720815
                bid = bookid;
                nexttime = $('div#next_comment_btn a').attr('onclick').match(reg);
                nexttime = nexttime[1];
                rp('http://www.yousuu.com/ajax/nextcomment?bid=' + bid + '&nexttime=' + nexttime)
                    .then(function (data) {
                        data = JSON.parse(data);
                        // console.log(data.comment);
                        var deal = function () {
                            digReviewsInfo(data.comment, bookid, callback);
                        }
                        try {
                            setTimeout(deal, 100);
                        }
                        catch (err) {
                            callback(null, null);
                            return;
                        }

                    })
            }
            else {
                callback(null, null);
                return;
            }
        }).catch(function (e) {
            console.log(e);
        })
    }
    else {
        console.log('have funny!');
        callback(null, null);
        return;
    }

}

// crawlInfo();


var oldtimestamp;
var newtimestamp;
fs.readFile('./timestamp','utf-8',function (err,data) {
    oldtimestamp = data;
});
var digReviewsInfoFromSquare = function (options) {

    console.log('begin!');
    var reg = /[0-9]{1,15}/g;
    var re = /[^《》]*/g;
    rp(options)
        .then(function (data) {
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
            })
            maplimit = Promise.promisify(require('async').mapLimit);
            maplimit(reviews, 1, function (reviewInfo, callback) {
                review.count({commentid: mongoose.Types.ObjectId(reviewInfo.commentid)})
                    .then(function (data) {
                        if (data < 1) {//不存在则创建新的
                            review.create({
                                rate:reviewInfo.rate,
                                commentid:reviewInfo.commentid,
                                userid:reviewInfo.userid,
                                username:reviewInfo.username,
                                usercomment:reviewInfo.usercomment,
                                bookname:reviewInfo.bookname,
                                bookid:reviewInfo.bookid,
                            }).then(function (data) {
                                console.log(data);
                                callback(null,null);
                            })
                        }else {
                            callback(null,null);
                        }
                    })
            }).then(function () {
                if ($('body > div.sokk-body > div > div > div > a').attr('onclick') != undefined) {
                    var nexttime = $('body > div.sokk-body > div > div > div > a').attr('onclick').match(reg).join('');
                    console.log(nexttime);
                    if(newtimestamp === undefined){
                        newtimestamp = nexttime;//第一次爬取的时候,取得timestamp
                    }
                    if(nexttime<oldtimestamp){
                        console.log('updated to latest !');
                        fs.writeFile('./timestamp',newtimestamp,function (err) {
                            if(err)
                                console.log(err);
                            console.log('saved new timestamp!');
                        })
                        return;
                    }
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
                    setTimeout(deal, 10);
                }
            })
        })
        .catch(function (e) {
            console.log(e);
            var deal = function () {
                digReviewsInfoFromSquare(options);
            }
            setTimeout(deal, 1000);
        })
}
var options = {
    uri: 'http://www.yousuu.com/comments',
    json: true // Automatically parses the JSON string in the response
};
digReviewsInfoFromSquare(options);




// bookurl = config.urlpre + '/' + 'book/' + 1;
// rp(bookurl).then(function (body) {
//     digReviewsInfo(body,1,function () {
//         console.log('over');
//     });
// }).catch(function (e) {
//     console.log(e);
// })