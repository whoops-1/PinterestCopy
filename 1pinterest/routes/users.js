const mongoose = require('mongoose');
require('dotenv').config();
const plm = require("passport-local-mongoose")

 
const { Schema } = mongoose;
mongoose.connect(process.env.MONGO_URI).then(() =>{console.log('connected to Mongodb')})
// Define the User schema
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    
  },
  password: {
    type: String,
    
  },
  email: {
    type: String,
    required: true,
    unique: true,
    
    lowercase: true,
  },
  contact: String,
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post', // Reference to the Post model
    
  }],
  profileImage: {
    type: String, // URL or file path to the display picture
    default:'default.png', // Default display picture URL
  },
  name: {
    type: String,
    unique: true
  },
  boards: {
    type: Array,
    default: []
  }
});

userSchema.plugin(plm);
// Create the User model
module.exports  = mongoose.model('user', userSchema);
