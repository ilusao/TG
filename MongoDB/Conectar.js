const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Funcionario = require('./Funcionarios');
const fotoRouter = require('./Foto');
const app = express();
const port = 3000;

// Configurações do MongoDB
const mongoURI = 'mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/';
const options = {
    maxPoolSize: 20,
    minPoolSize: 1
};


mongoose.connect(mongoURI, options)
    .then(() => console.log('Conectado ao MongoDB'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));


app.use(express.json());
app.use('/foto', fotoRouter);
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static('C:/TG/Login'));
app.use(express.static('C:/TG/Perfil_funcionario'));
app.use(express.static('C:/TG/Menu'));
app.use(express.static('C:/TG/Cadastro'));
app.use(express.static('C:/TG/fornecedor'));
app.use(express.static('C:/TG/Funcionário'));
app.use(express.static('C:/TG/localidade'));
app.use(express.static('C:/TG/produto'));
app.use('/midia', express.static('C:/TG/Midia'));

// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const funcionario = await Funcionario.findOne({ nome: username, codigoFuncionario: password });
        if (funcionario) {
            return res.json({ funcionarioId: funcionario._id });
        }
        return res.status(401).send('Usuário ou senha incorretos');
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        return res.status(500).json('Erro interno do servidor');
    }
});

// Rota para registrar funcionários
app.post('/funcionarios', async (req, res) => {
    try {
        const funcionario = new Funcionario(req.body);
        await funcionario.save();
        return res.status(201).send('Funcionário registrado com sucesso!');
    } catch (err) {
        return res.status(400).send('Erro ao registrar funcionário: ' + err.message);
    }
});

// Rota para buscar informações de um funcionário pelo ID
app.get('/funcionario/:id', async (req, res) => {
    try {
        const funcionarioId = req.params.id;
        const funcionario = await Funcionario.findById(funcionarioId);

        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado');
        }

        res.json(funcionario);
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para buscar informações de um funcionário pelo nome ou código
app.get('/funcionario/search/:searchTerm', async (req, res) => {
    try {
        const searchTerm = req.params.searchTerm;

        const funcionario = await Funcionario.findOne({
            $or: [
                { nome: searchTerm },
                { codigoFuncionario: searchTerm }
            ]
        });

        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado');
        }

        res.json(funcionario);
    } catch (error) {
        console.error('Erro ao buscar funcionário:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota para atualizar informações de um funcionário pelo ID
app.put('/funcionario/:id', async (req, res) => {
    try {
        const funcionarioId = req.params.id;
        const updates = req.body;

        const allowedUpdates = ['nome', 'contato', 'turno', 'codigoFuncionario', 'departamento', 'servico', 'cargo', 'inativo', 'fotoPerfil'];
        const actualUpdates = Object.keys(updates);
        const isValidOperation = actualUpdates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Atualizações inválidas!' });
        }

        const funcionario = await Funcionario.findById(funcionarioId);

        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        // Atualiza os campos
        actualUpdates.forEach(update => {
            funcionario[update] = updates[update];
        });

        await funcionario.save();

        res.json(funcionario);
    } catch (error) {
        console.error('Erro ao atualizar funcionário:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Login', 'Tela_login.html'));
});

// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
