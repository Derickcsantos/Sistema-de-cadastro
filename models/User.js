const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Definindo o esquema de usuário
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

// Middleware para criptografar a senha antes de salvar no banco de dados
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10); // Criptografa a senha
    next();
});

// Método para comparar a senha durante o login
userSchema.methods.comparePassword = function(password) {
    return bcrypt.compare(password, this.password);
};

// Método para gerar um token JWT
userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, username: this.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return token;
};

// Criando o modelo de usuário
const User = mongoose.model('User', userSchema);

module.exports = User;
