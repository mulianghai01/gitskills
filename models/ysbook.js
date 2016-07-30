/**
 * Created by mac on 16/7/20.
 */
'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var YSBookSchema = new Schema({
    _id: {
        type: String,//不定义这个字段或者设置成ObjectId 都会导致查询出错  ?
        index: true
    },
    bookname: {
        type: String,
        index: true
    },
    bookid:{
        type:Number,
        index:true
    },
    作者: {
        type: String,
        index: true
    },
    commentorNum: {
        type: Number,
        default: 0
    },
    rate: {
        type: Number,
        default: 0
    },
    reviewCount: {
        type: Number,
        default: 0
    },
});

//ysbooks中的作者字段是中文,为了方便理解,命名一个别名author
YSBookSchema.virtual('author').get(function () {
    return this.作者;
})

YSBookSchema.virtual('author').set(function () {
    this.作者 = author;
})


YSBookSchema.index({
    rate: -1
});

YSBookSchema.index({
    reviewCount: -1
});

var Bookys = mongoose.model('Bookys', YSBookSchema, 'booklist');

exports.Bookys = Bookys;


/**
 * Created by mac on 16/7/29.
 */
