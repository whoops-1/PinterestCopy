const mongoose = require('mongoose');
const { Schema } = mongoose;


// Define the Post schema
const postSchema = new Schema({
  title: {
    type: String,
    
  },
  description: {
    type: String,
    
    
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // Reference to the User model
    
  },
  likes: {
      type: Array,
      default: []
    },
  
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  postImage: String
});

// Create the Post model
module.exports = mongoose.model('Post', postSchema);

