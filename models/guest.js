const mongoose = require('mongoose');

// Esquema de Convidado
const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  telefone: {
    type: String, // Número de telefone
    required: false
  },
  email: {
    type: String, // E-mail
    required: false,
    match: [/.+\@.+\..+/, 'Por favor, insira um email válido.'] // Validação simples para email
  },
  endereco: {
    type: String, // Endereço do convidado
    required: false
  },
  sexo: {
    type: String, // Sexo do convidado (Masculino/Feminino)
    enum: ['Masculino', 'Feminino'],
    required: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now // Armazena a data e hora de cadastro
  },
  dataAtualizacao: {
    type: Date,
    default: Date.now // Armazena a data da última atualização
  }
});

const Guest = mongoose.model('Guest', guestSchema);
module.exports = Guest;
