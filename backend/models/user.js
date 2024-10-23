const mongoose = require('mongoose');
const bycrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        required: true,
        type: String,
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }

});

userSchema.pre('save', async function (next) {

    const person = this;
    if (!person.isModified('password')) next();

    try {
        const salt = await bycrypt.genSalt(10);
        const hashedPassword = await bycrypt.hash(person.password, salt)
        person.password = hashedPassword;
        next();

    } catch (error) {
        return next(error);
    }
});

userSchema.methods.comparePassword = async function (candidatePassword){
    try {
        const isMatch = await bycrypt.compare(candidatePassword,this.password);
        return isMatch;
    } catch (error) {
        
    }
}


const User = mongoose.model('User', userSchema);
module.exports = User;