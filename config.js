/**
 * Created by mac on 16/7/25.
 */

var config = {
    jsonPath:"./json/",//生成json文件的路径
    aggsize : 100,//最大返回书籍数目
    dburl : 'localhost',
    database : 'zhuishutest',
    youshushudb : 'mytest',

    // mongodb 配置
    db: 'mongodb://127.0.0.1/gaojian',
    // db: 'mongodb://127.0.0.1/zhuishutest',

    ESurl : 'http://localhost:9200',
    youshuindex : 'booklist',
    youshubooktype :'books',
    youshureviewtype : 'commentlist',
    zhuishuindex : 'zhuishutest',
    zhuishureviewtype : 'reviews',
    zhuishubooktype : 'bookslist',

    urlpre : "http://www.yousuu.com",
    maxbookid:49483,

}

module.exports = config;