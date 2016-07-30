/**
 * Created by mac on 16/7/25.
 */

'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var BookSchema = new Schema({
    bookid:{type:Number, index:true},
    rate: {type: Number, default: 0},
    commentorNum: {type: Number, default: 0},
    reviewCount: {type: Number, default: 0},
    bookname: {type: String, index: true},//默认的索引是正序的,如果想要倒叙,需要显示的标注
    author: {type: String, index: true},
    longIntro:{type:String},
    tag: {type: [String]},
    gender: {type: [String], enum: ['male', 'female', 'none'],default:'male'},
});

// //ysbooks中的作者字段是中文,为了方便理解,命名一个别名author
// BookSchema.virtual('author').get(function () {
//     return this.作者;
// })
//
// BookSchema.virtual('author').set(function () {
//     this.作者 = author;
// })


BookSchema.index({
    rate: -1
});

BookSchema.index({
    commentorNum: -1
});

BookSchema.index({
    reviewCount: -1
});

var Book = mongoose.model('Book', BookSchema);

exports.Book = Book;

