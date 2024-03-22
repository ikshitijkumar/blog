const express = require('express');
const cors = require('cors');
const { signup, Login, profile, Logout } = require('./controller/User.controller.js');
const app = express();
const path = require('path');
require('dotenv').config({ path: './env' });
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const { CreatePost, getAllPost, getBlog, editPost, deletePost } = require('./controller/Post.controller.js');
const multer = require('multer');
const PORT = process.env.PORT || 8080;
// Middleware
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser())
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/') 
    },
    filename: function (req, file, cb) {
        let fileNewName = path.parse(file.originalname).name + '-' + Date.now() + path.extname(file.originalname);
        cb(null, fileNewName) 
    }
});
const upload = multer({ storage: storage });
const router = express.Router();
(async () => {
    await mongoose.connect(process.env.MONGO_URI, {}).then(() => {
        console.log('Database connected');
    }).catch((err) => {
        console.log('Database connection failed', err);
    });
})()
app.use(express.static(path.join(__dirname, './dist')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './build/index.html'));
});
app.use('/', router);
router.route('/signup').post(signup);
router.route('/login').post(Login);
router.route('/logout').post(Logout);
router.route('/profile').post(profile);
router.route('/create-post').post(upload.single('postImg'),CreatePost);
router.route('/posts').get(getAllPost)
router.route('/blog/:id').get(getBlog)
router.route('/edit-post/:id').put(upload.single('postImg'),editPost)
router.route('/delete-post/:id').delete(deletePost)

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
