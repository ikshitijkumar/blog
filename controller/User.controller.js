const { User } = require("../models/User.model");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(12);

const signup = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        if (!user) {
            return res.status(400).json({ error: 'User creation failed' });
        }
        return res
            .status(200)
            .json({ message: 'User created successfully' });
    } catch (error) {
        return res.status(400).json(error?.message);
    }
};

const Login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const isMatch = bcrypt.compareSync(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        const token = jwt.sign({ id: user._id, name: user.name }, process.env.JWT_SECRET, { expiresIn: '2d' });
        if (!token) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        return res
            .status(200)
            .cookie('token', token,)
            .json({ message: 'Login successful' });
    } catch (error) {
        return res.status(400).json(error?.message);
    }

};

const Logout = async (req, res) => {
    return res
        .status(200)
        .cookie('token', '')
        .json({ message: 'Logout successful' });
}

const profile = async (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(400).json({ error: 'Invalid credentials' });
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        return res
            .status(200)
            .json({ message: 'Profile fetched successfully', user: decodedToken });
    }
    catch (error) {
        return res.status(400).json(error?.message);
    }
}

module.exports = {
    signup,
    Login,
    Logout,
    profile,
}
