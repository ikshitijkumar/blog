const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true
    },
    summary:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    postImg:{
        type: String,   // storing the path of image
        required: true
    },
    // name:{
    //     type: String, // but now there is a problem that we cannot able to have any idea to edit
    //     required: true
    // },
    username:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
},{timestamps: true});

exports.Post = mongoose.model('Post',PostSchema)

