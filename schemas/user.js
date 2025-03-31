let mongoose = require('mongoose');
let bcrypt = require('bcrypt')

let userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: [true, "username da ton tai"],
        required: true
    },
    password: {
        type: String,
        required: true
    }, email: {
        type: String,
        required: true,
        unique: true,
    }, fullName: {
        type: String,
        default: ""
    }, avatarUrl: {
        type: String,
        default: ""
    }, status: {
        type: Boolean,
        default: false
    }, role: {
        type: mongoose.Types.ObjectId,
        ref: 'role',
        required: true
    }, loginCount: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true
})

userSchema.pre('save', function (next) {
    if (this.isModified('password')) {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(this.password, salt);
        this.password = hash;
    }
    next();
})

module.exports = mongoose.model('user', userSchema)
