/**
 * Created by mac on 16/7/25.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var ReviewSchema = new Schema({
    bookid: {
        type: Number,
        index: true
    },
    bookname: {
        type: String,
        trim: true,
        index:true,
    },
    userid: {
        type: Number,
        index:true,
    },
    username: {
        type: String,
        index:true,
        trim: true,
    },
    usercomment: {
        type: String,
        trim: true,
    },
    commentid:{
        type:ObjectId,
    },
    booklistid:{
        type:String,
    },
    rate: {
        type: Number,
        default: 3
    },
    loveweight:{
        type:Number,
        default:0
    },
    tag: [{type: String, default: 'youshu'}]
});

ReviewSchema.index({
    userid: -1
});

ReviewSchema.index({
    commentid: -1
});



ReviewSchema.virtual('content').get(function () {
    return this.usercomment;
})

ReviewSchema.virtual('content').set(function () {
    this.usercomment = content;
})

ReviewSchema.virtual('ctd').get(function () {
    return this.commentid;
})

ReviewSchema.virtual('ctd').set(function () {
    this.commentid = mongoose.Types.ObjectId(ctd);
})

var Review = mongoose.model('Review', ReviewSchema);

exports.Review = Review;