const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const { Funcionario, calcularTempoNaEmpresa } = require('./Funcionarios');
const fotoRouter = require('./Foto');
const Produto = require('./Produto');
const Fornecedor = require('./Fornecedor');
const Estoque = require('./estoque');
const app = express();
const port = 3000;

// Configurações do MongoDBs
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
    app.use(express.static(path.join(__dirname, '..', 'Python')));


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
        const funcionario = await Funcionario.findOne({ nome: username, senha: password });
        // Verificar se o funcionário existe
        if (!funcionario) {
            return res.status(401).send('Usuário ou senha incorretos');
        }

        if (funcionario.inativo) {
            return res.status(403).send('Funcionário inativo, acesso negado');
        }

        // Se as credenciais estiverem corretas e o funcionário estiver ativo, enviar a resposta
        return res.json({
            funcionarioId: funcionario._id,
            cargo: funcionario.cargo,
            mensagem: 'Login bem-sucedido',
        });
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

        // Define os campos permitidos para atualização
        const allowedUpdates = [
            'nome', 'contato', 'turno', 'codigoFuncionario', 'departamento', 
            'servico', 'cargo', 'inativo', 'fotoPerfil', 'comportamento'
        ];
        const actualUpdates = Object.keys(updates);
        
        // Verifica se todos os campos de atualização são válidos
        const isValidOperation = actualUpdates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Atualizações inválidas!' });
        }

        const funcionario = await Funcionario.findById(funcionarioId);

        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        if (updates.comportamento && updates.comportamento.length > 1000) {
            return res.status(400).json({ message: 'O Comportamento do Funcionário não pode exceder 1000 caracteres' });
        }

        // Atualiza os campos permitidos
        actualUpdates.forEach(update => {
            funcionario[update] = updates[update];
        });

        // Salva as alterações no banco de dados
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
        const produtos = await Produto.find()
            .populate('idFuncionario', 'nome');
        

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar os produtos' });
    }
});

// Rota para cadastro
app.post('/api/produto', async (req, res) => {
    
   
    const { codigo_produto, idFuncionario } = req.body;
    
    
        try {
            // Verifica se o produto já existe
            const produtoExistente = await Produto.findOne({ codigo_produto });
            if (produtoExistente) {
                return res.status(400).json({ message: 'Código do produto já está em uso.' });
            }
    
            const funcionario = await Funcionario.findById(idFuncionario);
            if (!funcionario) {
                return res.status(404).json({ message: 'Funcionário não encontrado.' });
            }

            const novoProduto = new Produto({
                ...req.body,  
                idFuncionario 
            });
            await novoProduto.save();
            funcionario.produtosCadastrados.push(novoProduto._id);
            await funcionario.save();
    
            res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
        } catch (error) {
            console.error('Erro ao cadastrar o produto:', error);
            res.status(500).json({ error: 'Erro ao cadastrar o produto' });
        }
    });

// Rota para listar todos os produtos cadastrados por um funcionário
app.get('/funcionario/:id/produtos', async (req, res) => {
    try {
        const funcionario = await Funcionario.findById(req.params.id).populate('produtosCadastrados');
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado' });
        }

        res.json(funcionario.produtosCadastrados);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar produtos do funcionário' });
    }
});


// Rota para pegar um produto específico pelo ID (_id)
app.get('/api/produto/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const produto = await Produto.findById(id).populate('idFuncionario', 'nome');

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

// Rota para enviar um produto para uma nova localização e atualizar destino
app.post('/api/enviarProduto', async (req, res) => {
    const { codigo_produto, localizacao, destino } = req.body;

    if (!codigo_produto || !localizacao) {
        return res.status(400).json({ message: 'Dados incompletos. Forneça código_produto e localizacao.' });
    }

    try {
        const produto = await Produto.findOne({ codigo_produto });

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        produto.localizacao = localizacao;
        produto.destino = destino === "" ? null : destino;

        await produto.save();

        res.json({ message: 'Produto enviado para nova localização com sucesso!', produto });
    } catch (error) {
        console.error('Erro ao enviar produto:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
});

// Rota para os fornecedores
app.get('/fornecedores', async (req, res) => {
    try {
        const fornecedores = await Fornecedor.find().populate('idFuncionario', 'nome _id');

        res.status(200).json(fornecedores);
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar fornecedores.', erro: error.message });
    }
});

// Rota para buscar fornecedor pelo id
app.get('/fornecedores/:id', async (req, res) => {
    try {
        const fornecedor = await Fornecedor.findById(req.params.id).populate('idFuncionario', 'nome _id');
        if (!fornecedor) {
            return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
        }
        res.status(200).json(fornecedor);
    } catch (error) {
        console.error('Erro ao buscar fornecedor:', error);
        res.status(500).json({ mensagem: 'Erro ao buscar fornecedor.', erro: error.message });
    }
});

// Rota para registrar fornecedor
app.post('/fornecedores', async (req, res) => {
    const { nome, email, cnpj, codigo_fornecedor, idFuncionario } = req.body;

    // Validação de campos obrigatórios
    if (!nome || !email || !cnpj || !codigo_fornecedor || !idFuncionario) {
        return res.status(400).json({ 
            mensagem: 'Campos obrigatórios estão faltando.', 
            dados: req.body 
        });
    }

    try {
        const novoFornecedor = new Fornecedor({
            ...req.body,
            idFuncionario,
            dataCadastro: Date.now()  
        });

        const fornecedorSalvo = await novoFornecedor.save();
        res.status(201).json({ mensagem: 'Fornecedor cadastrado com sucesso!', fornecedor: fornecedorSalvo });
    } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error);
        res.status(400).json({ 
            mensagem: 'Erro ao cadastrar fornecedor.',
            erro: error.message,
            dados: req.body 
         });
    }
});
// Rota para buscar o fornecedor
app.post('/api/buscarFornecedores', async (req, res) => {
    const filtro = req.body;

    try {
        const fornecedores = await Fornecedor.find(filtro);
        res.json(fornecedores);
    } catch (err) {
        console.error('Erro ao buscar fornecedores:', err);
        res.status(500).send({ message: 'Erro ao buscar fornecedores' });
    }
});

// Rota para atualizar fornecedor
app.put('/fornecedores/:id', async (req, res) => {
    const { nome, email, cnpj, codigo_fornecedor, idFuncionario } = req.body;

    if (!nome || !email || !cnpj || !codigo_fornecedor || !idFuncionario) {
        return res.status(400).json({ mensagem: 'Campos obrigatórios estão faltando.' });
    }

    try {
        const fornecedorAtualizado = await Fornecedor.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!fornecedorAtualizado) {
            return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
        }

        res.status(200).json({ mensagem: 'Fornecedor atualizado com sucesso!', fornecedor: fornecedorAtualizado });
    } catch (error) {
        console.error('Erro ao atualizar fornecedor:', error);
        res.status(400).json({ mensagem: 'Erro ao atualizar fornecedor.', erro: error.message });
    }
});

// Rota para buscar produtos de um fornecedor
app.post('/api/FornecedorProduto', async (req, res) => {
    const { codigo_fornecedor } = req.body;

    try {
        const fornecedor = await Fornecedor.findOne({ codigo_fornecedor });

        if (!fornecedor) {
            return res.status(404).json({ message: 'Fornecedor não encontrado' });
        }
        const produtos = await Produto.find({ fornecedor: codigo_fornecedor });

        if (produtos.length === 0) {
            return res.status(404).json({ message: 'Nenhum produto encontrado para esse fornecedor' });
        }

        res.json(produtos);
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos' });
    }
});

// Rota para salvar os estoques
app.post('/estoques', async (req, res) => {
    const { estoques } = req.body;

    try {
        for (const estoqueData of estoques) {
            const { tipoEstante, tipoProduto, capacidadeTotal, numPrateleiras, statusProduto, produtos } = estoqueData;

            const novoEstoque = new Estoque({
                tipoEstante,
                tipoProduto,
                capacidadeTotal,
                numPrateleiras,
                statusProduto,
                produtos: produtos.map(idProduto => mongoose.Types.ObjectId(idProduto))
            });

            await novoEstoque.save();
        }

        res.status(200).json({ message: 'Estoques salvos com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar estoques:', error);
        res.status(500).json({ message: 'Erro ao salvar estoques.' });
    }
});


// Função para atualizar o tempo de serviço de todos os funcionários
async function atualizarTempoNaEmpresa() {
    try {
        const funcionarios = await Funcionario.find({});

        funcionarios.forEach(async (funcionario) => {
            const tempo = calcularTempoNaEmpresa(funcionario.dataContratacao);
            funcionario.tempoNaEmpresa = tempo;

            await funcionario.save();
        });

        console.log("Tempo de serviço atualizado para todos os funcionários");
    } catch (err) {
        console.error("Erro ao atualizar o tempo de serviço:", err);
    }
}

// Tarefa cron para rodar todo dia à meia-noite
cron.schedule('0 0 * * *', atualizarTempoNaEmpresa);



// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'Paginas', 'Login', 'Tela_login.html'));
});
// Inicializa o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});