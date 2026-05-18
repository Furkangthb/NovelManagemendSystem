const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const register = async (username, email, password, role = 'reader') => {

    const existingUsername = await userModel.findUserByUsername(username);
    if (existingUsername) throw new Error('Bu kullanıcı adı zaten kullanılıyor');

    const existingEmail = await userModel.findUserByEmail(email);
    if (existingEmail) throw new Error('Bu email zaten kullanılıyor');

    if (!['reader', 'author'].includes(role)) throw new Error('Geçersiz rol');

    const password_hash = await bcrypt.hash(password, 10);

    const user = await userModel.createUser(username, email, password_hash, role);
    return user;
};

const login = async (email, password) => {

    const user = await userModel.findUserByEmail(email);
    if (!user) throw new Error('Email veya şifre hatalı');

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) throw new Error('Email veya şifre hatalı');

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return {
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
    };
};

module.exports = { register, login };