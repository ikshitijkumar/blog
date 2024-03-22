const { uploadOnCloudinary, deleteFromCloudinary } = require('../utils/cloudinary.utils');
const { Post } = require('../models/Post.model');
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');


const CreatePost = async (req, res) => {
    try {
        const { title, summary, description } = req.body;
        if (!title || !summary || !description) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        let postImg = req.file;
        if (!postImg) {
            return res.status(400).json({ error: 'Image is required' });
        }
        const postImgPath = postImg.path

        postImg = await uploadOnCloudinary(postImgPath)
        postImg = postImg.url

        const { token } = req.cookies;
        if (!token) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        if (!decodedToken) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const post = await Post.create({
            title,
            summary,
            postImg,
            description,
            username: decodedToken.id
        })
        if (!post) {
            return res.status(400).json({ error: 'Post creation failed' })
        }

        return res.status(200).json({ message: 'Post created successfully' });
    } catch (error) {
        return res.status(400).json({ error: error?.message });
    }
}

const getAllPost = async (req, res) => {
    const posts = await Post.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "username",
                foreignField: "_id",
                as: "username"
            }
        },
        {
            $project: {
                'username.password': 0, 
                'username.email': 0, 
            }
        },
        {
            $sort: { updatedAt: -1 }
        },
        {
            $limit: 20
        }
    ]);
    return res
    .status(200)
    .json(posts)
}

const getBlog = async (req, res) => {
    const { id } = req.params
    let _id = new mongoose.Types.ObjectId(id)
    const blog = await Post.aggregate([
        {
            $match: {
                _id: _id,
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "username",
                foreignField: "_id",
                as: "username",
            },
        },
        {
            $project: {
                "username.password": 0,
                "username.email": 0,
            },
        },
    ])

    if(!blog?.length) {
        return res.status(400).json({ error: 'Post not found' })
    }

    return res.status(200).json(blog[0])
}

const editPost = async (req, res) => {
    const { id } = req.params;
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ error: 'Invalid credentials' })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    
    const post = await Post.findById(id)
    if (!post) {
        return res.status(400).json({ error: 'Post not found' })
    }
    if((post.username._id).toString() !== decodedToken.id) {
        return res.status(400).json({ error: 'You are not authorized to edit this post' })
    }
    let postImgPath
    let oldImgPath = post.postImg
    if(req?.file) {
        postImgPath = req.file.path
        postImgPath = await uploadOnCloudinary(postImgPath)
        if(!postImgPath) {
            return res.status(400).json({error: 'Image upload failed'})
        }
    }
    const { title, summary, description } = req.body
    const updatedPost = await Post.findByIdAndUpdate(id, {
        title,
        summary,
        description,
        postImg: postImgPath ? postImgPath.url : oldImgPath,
    }, { new: true })
    if(!updatedPost) {
        return res.status(400).json({ error: 'Post update failed' })
    }
    if(postImgPath)
        await deleteFromCloudinary(oldImgPath)
    
    return res
    .status(200)
    .json({ message: 'Post updated successfully' })
}

const deletePost = async(req, res) => {
    const { id } = req.params
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ error: 'Invalid credentials' })
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET)
    const post = await Post.findById(id)
    if (!post) {
        return res.status(400).json({ error: 'Post not found' })
    }
    if((post.username._id).toString() !== decodedToken.id) {
        return res.status(400).json({ error: 'You are not authorized to delete this post' })
    }
    const deletedPost = await Post.findByIdAndDelete(id)
    if(!deletedPost) {
        return res.status(400).json({ error: 'Post delete failed' })
    }
    await deleteFromCloudinary(post.postImg)
    return res
    .status(200)   
    .json({ message: 'Post deleted successfully' })
}

module.exports = { CreatePost, getAllPost, getBlog, editPost, deletePost };
