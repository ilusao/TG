const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Funcionario = require('./Funcionarios');
const fotoRouter = require('./Foto');
const Produto = require('./Produto');
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
    
    // Serve arquivos estáticos a partir da pasta 'Paginas' e substitui todos os caminhos abaixo
    app.use(express.static(path.join(__dirname, '..', 'Paginas')));
    app.use(express.static(path.join(__dirname, '..', 'MongoDB')));


    // substituidos...
    // app.use(express.static('C:/TG/Login'));
    // app.use(express.static('C:/TG/Perfil_funcionario'));
    // app.use(express.static('C:/TG/Menu'));
    // app.use(express.static('C:/TG/Cadastro'));
    // app.use(express.static('C:/TG/fornecedor'));
    // app.use(express.static('C:/TG/Funcionário'));
    // app.use(express.static('C:/TG/localidade'));
    // app.use(express.static('C:/TG/produto'));


// Rota de login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Procurando pelo nome e pela senha
        const funcionario = await Funcionario.findOne({ nome: username, senha: password });
        if (funcionario) {
            return res.json({ funcionarioId: funcionario._id });
        }
        return res.status(401).send('Usuário ou senha incorretos');
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        return res.status(500).json('Erro interno do servidor');
    }
});

// Rota para recuperar a senha
app.post('/recover', async (req, res) => {
    const { nome, codigo, contato, cargo } = req.body;

    try {
        const funcionario = await Funcionario.findOne({ 
            nome: nome,
            codigoFuncionario: codigo,
            contato: contato,
            cargo: cargo
        });

        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado com essas informações');
        }

        return res.send(`Sua senha é: ${funcionario.senha}`);
    } catch (error) {
        console.error('Erro ao recuperar senha:', error);
        return res.status(500).json('Erro interno do servidor');
    }
});

// Rota para mudar a senha
app.post('/change-password', async (req, res) => {
    const { nome, codigo, contato, cargo, newPassword } = req.body;

    try {
        const funcionario = await Funcionario.findOne({ 
            nome: nome,
            codigoFuncionario: codigo,
            contato: contato,
            cargo: cargo
        });

        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado com essas informações');
        }

        funcionario.senha = newPassword;
        await funcionario.save();

        return res.send('Senha alterada com sucesso!');
    } catch (error) {
        console.error('Erro ao mudar senha:', error);
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

// grupo de produtos
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find(); 
        res.json(produtos); 
    } catch (error) {
        console.error('Erro ao buscar os produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar os produtos' });
    }
});

// Rota para cadastro de produto
app.post('/api/produto', async (req, res) => {
    const { codigo_produto } = req.body;

    try {
        const produtoExistente = await Produto.findOne({ codigo_produto });
        if (produtoExistente) {
            return res.status(400).json({ message: 'Código do produto já está em uso.' });
        }
        const novoProduto = new Produto(req.body);
        await novoProduto.save();

        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar o produto:', error);
        res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
});

// Rota para pegar um produto específico pelo ID (_id)
app.get('/api/produto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Busca o produto pelo _id
        const produto = await Produto.findById(id);
        if (produto) {
            res.json(produto);
        } else {
            res.status(404).json({ message: 'Produto não encontrado' });
        }
    } catch (error) {
        console.error('Erro ao buscar o produto:', error);
        res.status(500).json({ message: 'Erro ao buscar o produto' });
    }
});

// Rota para atualizar informações de um produto pelo ID (_id)
app.put('/api/produto/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
        if (updates.codigo_produto) {
            const codigoExistente = await Produto.findOne({ codigo_produto: updates.codigo_produto });
            if (codigoExistente && codigoExistente._id.toString() !== id) {
                return res.status(400).json({ message: 'Código do produto já está em uso.' });
            }
        }
        const produtoAtualizado = await Produto.findByIdAndUpdate(id, updates, { new: true });

        if (!produtoAtualizado) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        res.json(produtoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar produtos com base em critérios como nome, grupo, código e fornecedor
app.post('/api/buscarProdutos', async (req, res) => {
    const { nome, grupo, marca, codigo_produto, fornecedor } = req.body;

    try {
        const query = {};
        if (nome) query.nome = { $regex: nome, $options: 'i' };
        if (grupo) query.grupo = { $regex: grupo, $options: 'i' };
        if (marca) query.marca = { $regex: marca, $options: 'i' };
        if (codigo_produto) query.codigo_produto = codigo_produto;
        if (fornecedor) query.fornecedor = { $regex: fornecedor, $options: 'i' };

        const produtos = await Produto.find(query);
        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado com esses critérios' });
        }
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Rota para atualizar o destino de um produto
app.put('/api/produto/:id/enviar', async (req, res) => {
    const { destino, localizacao } = req.body;
    try {
        const produtoAtualizado = await Produto.findByIdAndUpdate(
            req.params.id,
            { destino, status: 'Em trânsito', localizacao },
            { new: true }
        );
        if (!produtoAtualizado) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }
        res.json(produtoAtualizado);
    } catch (error) {
        console.error('Erro ao atualizar o produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para buscar todos os produtos e suas localizações
app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await Produto.find();
        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar os produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar os produtos' });
    }
});

app.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find();
        res.json(fornecedores);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving fornecedores', error: error.message });
    }
});

// PUT update an existing fornecedor by ID
app.put('/fornecedores/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedFornecedor = await Fornecedor.findByIdAndUpdate(id, updatedData, {
            new: true, // Return the updated document
            runValidators: true // Validate the update operation against the schema
        });

        if (!updatedFornecedor) {
            return res.status(404).json({ message: 'Fornecedor not found' });
        }

        res.json(updatedFornecedor);
    } catch (error) {
        res.status(500).json({ message: 'Error updating fornecedor', error: error.message });
    }
});

app.post('/fornecedores', async (req, res) => {
    try {
        const { nome, email, descricao, observacoes, pais, cidade, estado, site, cnpj, inativo, preco_proprietario } = req.body;
        const newFornecedor = new Fornecedor({
            nome,
            email,
            descricao,
            observacoes,
            pais,
            cidade,
            estado,
            site,
            cnpj,
            inativo,
            preco_proprietario
        });

        await newFornecedor.save();
        res.status(201).json(newFornecedor);
    } catch (error) {
        res.status(500).json({ message: 'Error creating fornecedor', error: error.message });
    }
});

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Paginas', 'Login', 'Tela_login.html'));
});
// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});