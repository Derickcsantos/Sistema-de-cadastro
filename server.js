const path = require('path'); // Importa o módulo 'path' para manipulação de caminhos de arquivos
const express = require('express'); // Importa o módulo 'express' para criar o servidor
const Guest = require('./models/guest'); // Importa o modelo 'Guest' para gerenciar convidados
const User = require('./models/User'); // Modelo de Usuário
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express(); // Cria uma instância do aplicativo Express
const mongoose = require('mongoose'); // Importa o módulo 'mongoose' para interagir com o MongoDB
require('dotenv').config(); // Carrega as variáveis de ambiente

// Conectar ao MongoDB Atlas usando variáveis de ambiente
const mongoURI = process.env.MONGO_URI; // Usa a variável de ambiente MONGO_URI

// Verifique se a variável MONGO_URI foi carregada corretamente
if (!mongoURI) {
  console.error('Erro: A variável de ambiente MONGO_URI não está definida!');
  process.exit(1); // Encerra o processo se a URI não estiver definida
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout depois de 5 segundos
  socketTimeoutMS: 45000 // Timeout no socket após 45 segundos
})
.then(() => console.log('Conectado ao MongoDB Atlas'))
.catch(err => console.error('Erro na conexão com MongoDB:', err));

app.use(express.json()); // Middleware para analisar requisições JSON
app.use(express.static(path.join(__dirname, 'public', 'src'))); // Serve arquivos estáticos do diretório 'public/src'
app.use(session({
  secret: 'seu-segredo-aqui',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Usar `true` em produção com HTTPS
}));

const users = [
  { username: 'derick@gmail.com', password: '123' },
  { username: 'derickcampossantos1@gmail.com', password: '1234' }
];

// Rota para obter todos os convidados
app.get('/guests', async (req, res) => {
  try {
    const guests = await Guest.find(); // Busca todos os convidados no banco de dados
    res.json(guests); // Retorna a lista de convidados em formato JSON
  } catch (err) {
    console.error('Erro ao buscar convidados:', err);
    res.status(500).json({ error: 'Erro ao buscar convidados.' });
  }
});

const authenticate = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Acesso negado. Não autenticado!' });
  }
  next(); // Se o usuário estiver autenticado, continua a execução
};


app.get('/admin', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'src', 'admin.html')); 
});


app.get('/cadastro', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'src', 'cadastro.html')); // Atualizando o caminho para 'src/cadastro.html'
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'src', 'login.html')); // Atualizando o caminho para 'src/cadastro.html'
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Encontrando o usuário no array
  const user = users.find(u => u.username === username);

  if (!user) {
    return res.status(400).json({ error: 'Usuário ou senha inválidos!' });
  }

  // Comparando a senha diretamente
  if (password !== user.password) {
    return res.status(400).json({ error: 'Usuário ou senha inválidos!' });
  }

  // Criação da sessão
  req.session.userId = username; // Armazena o username na sessão
  res.json({ message: 'Login realizado com sucesso!' });
});

// Rota para obter estatísticas dos convidados (total e divisão por idade)
app.get('/guest-stats', async (req, res) => {
  try {
    // Exemplo de dados
    const totalGuests = await Guest.countDocuments();
    const maleGuests = await Guest.countDocuments({ sexo: 'Masculino' });
    const femaleGuests = await Guest.countDocuments({ sexo: 'Feminino' });

    // Filtrando para obter maiores e menores de 18 anos
    const adults = await Guest.countDocuments({ age: { $gte: 18 } });
    const minors = totalGuests - adults;

    // Dados mensais de usuários cadastrados (exemplo simples)
    const monthlyData = await Guest.aggregate([
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    const labels = monthlyData.map(item => `Mês ${item._id}`);
    const data = monthlyData.map(item => item.count);

    return res.json({
      totalGuests,
      maleGuests,
      femaleGuests,
      adults,
      minors,
      monthlyData: { labels, data }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas dos convidados:', error);
    res.status(500).send('Erro ao obter estatísticas');
  }
});

app.post('/guests', async (req, res) => {
  const { name, age, telefone, email, endereco, sexo } = req.body;
  const guest = new Guest({ name, age, telefone, email, endereco, sexo });

  try {
    await guest.save();
    res.status(201).json(guest);
  } catch (err) {
    console.error('Erro ao adicionar convidado:', err);
    res.status(500).json({ error: 'Erro ao adicionar convidado.' });
  }
});

app.put('/guests/:id', async (req, res) => {
  const { id } = req.params;
  const { name, age, telefone, email, endereco, sexo } = req.body;

  try {
    const guest = await Guest.findByIdAndUpdate(id, {
      name,
      age,
      telefone,
      email,
      endereco,
      sexo,
      dataAtualizacao: Date.now()
    }, { new: true });

    if (!guest) {
      return res.status(404).json({ error: 'Convidado não encontrado' });
    }
    res.json(guest); // Retorna o convidado atualizado
  } catch (err) {
    console.error('Erro ao atualizar convidado:', err);
    res.status(500).json({ error: 'Erro ao atualizar convidado' });
  }
});

// Rota para deletar um convidado
app.delete('/guests/:id', async (req, res) => {
  await Guest.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// Iniciar o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
console.log("MongoDB URI:", process.env.MONGO_URI);
