const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Funcionario = require('./Funcionarios');
const app = express();
const port = 3000;

const mongoURI = 'mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/';
const options = {
    maxPoolSize: 10,
    minPoolSize: 1  
};

mongoose.connect(mongoURI, options)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

app.use(express.json());
app.use(express.static('C:/TG/Login'));
app.use(express.static('C:/TG/Menu')); 
app.use(express.static('C:/TG/Cadastro'));
app.use(express.static('C:/TG/fornecedor'));
app.use(express.static('C:/TG/Funcionário'));
app.use(express.static('C:/TG/localidade'));
app.use(express.static('C:/TG/produto'));

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const funcionario = await Funcionario.findOne({ nome: username, codigoFuncionario: password });

        if (funcionario) {
            res.redirect('/Tela_menu.html');
        } else {
            res.status(401).send('Usuário ou senha incorretos');
        }
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

app.post('/funcionarios', async (req, res) => {
    try {
        const funcionario = new Funcionario(req.body);
        await funcionario.save();
        res.status(201).send('Funcionário registrado com sucesso!');
    } catch (err) {
        res.status(400).send('Erro ao registrar funcionário: ' + err.message);
    }
});

// Só pra colocar a Tela_login.html como a primeira tela...
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Login', 'Tela_login.html'));
});

app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});