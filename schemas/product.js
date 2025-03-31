let mongoose = require('mongoose')
let productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:[true,"truong nay la unique"]
    },price:{
        type:Number,
        default:0,
        min:0
    },quantity:{
        type:Number,
        default:0,
        min:0
    },description:{
        type:String,
        default:"",
    },imgURL:{
        type:String,
        default:"",
    },category:{
        type:mongoose.Types.ObjectId,
        ref:'category',
        required:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
},{
    timestamps:true
})
module.exports = mongoose.model('product',productSchema)