const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cron = require('node-cron');
const Funcionario = require('./Funcionarios');
const fotoRouter = require('./Foto');
const Produto = require('./Produto');
const Fornecedor = require('./Fornecedor');
const Estoque = require ('./estoque');
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
    const { codigo_produto, idFuncionario, almoxerifado, localizacao } = req.body;

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

        let movimentacao = 0;

        if (almoxerifado && localizacao) {
            const estoqueExistente = await Estoque.findOne({ localizacao: localizacao });

            if (estoqueExistente) {
                // Verifica se a localização do estoque é igual à localização do produto
                if (estoqueExistente.localizacao === localizacao) {
                    movimentacao = 1;
                }
            }
        }
        const novoProduto = new Produto({
            ...req.body,
            movimentacoes: movimentacao,
            idFuncionario
        });

        await novoProduto.save();
        funcionario.produtosCadastrados.push(novoProduto._id);
        await funcionario.save();

        if (almoxerifado || localizacao) {
            try {
                const movimentacaoResponse = await fetch('http://localhost:3000/movimentacoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        novoAlmoxerifado: almoxerifado, 
                        novaLocalizacao: localizacao, 
                        produtoId: novoProduto._id 
                    }),
                });
                const movimentacaoData = await movimentacaoResponse.json();
            } catch (error) {
                console.error('Erro ao registrar movimentação no cadastro do produto:', error);
            }
        }

        res.status(201).json({ message: 'Produto cadastrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao cadastrar o produto:', error);
        res.status(500).json({ error: 'Erro ao cadastrar o produto' });
    }
});

// Rota para enviar dados ao Flask
app.post('/produtos', async (req, res) => {
    const { nome, descricao, preco, codigo_produto, idFuncionario, exportarParaExcel } = req.body;
    if (exportarParaExcel) {
        try {
            const response = await fetch('http://localhost:5000/produto/gerar-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome,
                    descricao,
                    preco,
                    codigo_produto,
                    idFuncionario,
                    ...req.body
                })
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                res.setHeader('Content-Disposition', 'attachment; filename="produto.xlsx"');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                return res.status(200).send(buffer);
            } else {
                console.error('Erro ao gerar Excel no Flask:', response.statusText);
                return res.status(500).json({ mensagem: 'Erro ao gerar o Excel.' });
            }
        } catch (error) {
            console.error('Erro ao conectar com o Flask:', error);
            return res.status(500).json({ mensagem: 'Erro ao comunicar com o Flask.' });
        }
    } else {
        res.status(400).json({ mensagem: 'É necessário escolher a opção para exportar para Excel.' });
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
        // Primeiro tenta buscar o produto pelo ID
        let produtoAtual = await Produto.findById(id);

        if (!produtoAtual) {
            // Se não encontrar pelo ID, tenta buscar com os critérios da API de busca
            const { nome, grupo, marca, codigo_produto, fornecedor } = req.body;
            const query = {};

            if (nome) query.nome = { $regex: nome, $options: 'i' };
            if (grupo) query.grupo = { $regex: grupo, $options: 'i' };
            if (marca) query.marca = { $regex: marca, $options: 'i' };
            if (codigo_produto) query.codigo_produto = codigo_produto;
            if (fornecedor) query.fornecedor = { $regex: fornecedor, $options: 'i' };

            // Agora realiza a busca com os critérios
            produtoAtual = await Produto.findOne(query);
        }

        if (!produtoAtual) {
            return res.status(404).json({ message: 'Produto não encontrado' });
        }

        // Verificar se houve mudanças nos campos de almoxarifado ou localização
        const almoxerifadoAlterado = updates.almoxerifado && updates.almoxerifado !== produtoAtual.almoxerifado;
        const localizacaoAlterada = updates.localizacao && updates.localizacao !== produtoAtual.localizacao;

        // Se houver alteração, registrar movimentação
        if (almoxerifadoAlterado || localizacaoAlterada) {
            try {
                // Chama a API de movimentação, passando os dados antigos e novos
                const movimentacaoResponse = await fetch('http://localhost:3000/movimentacoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        novoAlmoxerifado: updates.almoxerifado || produtoAtual.almoxerifado,
                        novaLocalizacao: updates.localizacao || produtoAtual.localizacao,
                        produtoId: produtoAtual._id // Passando o ID do produto correto
                    }),
                });
                const movimentacaoData = await movimentacaoResponse.json();
                console.log('Movimentação registrada ao atualizar produto:', movimentacaoData);
            } catch (error) {
                console.error('Erro ao registrar movimentação na atualização do produto:', error);
            }
        }

        // Atualizar o produto no banco
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

// Rota para cadastro de fornecedor
app.post('/api/fornecedor', async (req, res) => {
    const { idFuncionario, codigo_fornecedor } = req.body;

    try {
        const fornecedorExistenteCodigo = await Fornecedor.findOne({ codigo_fornecedor });
        if (fornecedorExistenteCodigo) {
            return res.status(400).json({ message: 'Código do fornecedor já está em uso.' });
        }

        const funcionario = await Funcionario.findById(idFuncionario);
        if (!funcionario) {
            return res.status(404).json({ message: 'Funcionário não encontrado.' });
        }

        const dataCadastro = new Date();

        const novoFornecedor = new Fornecedor({
            ...req.body,
            idFuncionario,
            dataCadastro
        });

        const fornecedorSalvo = await novoFornecedor.save();

        res.status(201).json({
            message: 'Fornecedor cadastrado com sucesso!',
            fornecedor: {
                ...fornecedorSalvo.toObject(),
                _id: fornecedorSalvo._id.toString(),
                dataCadastro: fornecedorSalvo.dataCadastro
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar fornecedor' });
    }
});

// Rota para enviar dados ao Flask para gerar o Excel
app.post('/fornecedores', async (req, res) => {
    const { cnpj, idFuncionario, exportarParaExcel, _id } = req.body;

    // Validar campos obrigatórios
    if (!cnpj || !idFuncionario || exportarParaExcel === undefined || !_id) {
        return res.status(400).json({ mensagem: 'Faltando dados obrigatórios.' });
    }

    if (exportarParaExcel) {
        try {
            // Recuperar fornecedor do banco para garantir que `dataCadastro` está correto
            const fornecedor = await Fornecedor.findById(_id);

            if (!fornecedor) {
                return res.status(404).json({ mensagem: 'Fornecedor não encontrado.' });
            }

            const payload = {
                ...req.body,
                dataCadastro: fornecedor.dataCadastro.toISOString()
            };

            const response = await fetch('http://localhost:5000/fornecedor/gerar-excel', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                res.setHeader('Content-Disposition', 'attachment; filename="fornecedor.xlsx"');
                res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

                return res.status(200).send(buffer);
            } else {
                return res.status(500).json({ mensagem: 'Erro ao gerar o Excel no Flask.' });
            }
        } catch (err) {
            return res.status(500).json({ mensagem: 'Erro ao comunicar com o Flask.' });
        }
    } else {
        return res.status(400).json({ mensagem: 'É necessário escolher a opção para exportar para Excel.' });
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

// Rota dos Estoques
app.get('/estoques', async (req, res) => {
    try {
        const estoques = await Estoque.find();
        res.status(200).json(estoques);
    } catch (error) {
        console.error('Erro ao listar estoques:', error);
        res.status(500).json({ message: 'Erro ao listar estoques.' });
    }
});

// Rota para salvar os estoques
app.post('/estoques', async (req, res) => {
    const { estoques } = req.body;

    try {
        for (const estoqueData of estoques) {
            const { 
                nome, tipoEstante, tipoProduto, capacidadeTotal, numPrateleiras, 
                espacoEntrePrateleiras, pesoMaximo, statusProduto, volumePorPrateleira, 
                totalVolumeOcupado, numCaixas, capacidadeUtilizada, metaRegistro, localizacao
            } = estoqueData;
            const novoEstoque = new Estoque({
                nome,
                tipoEstante,
                tipoProduto,
                capacidadeTotal,
                numPrateleiras,
                espacoEntrePrateleiras,
                pesoMaximo,
                localizacao,
                statusProduto,
                volumePorPrateleira,
                totalVolumeOcupado,
                numCaixas,
                capacidadeUtilizada,
                metasRegistro: {
                    metaMensal: req.body.metasRegistro?.metaMensal || 0, 
                    metaMensalAtual: req.body.metasRegistro?.metaMensalAtual || 0,
                }
            });

            await novoEstoque.save();
        }

        res.status(200).json({ message: 'Estoques salvos com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar estoques:', error);
        res.status(500).json({ message: 'Erro ao salvar estoques.' });
    }
});


// Rota para buscar um estoque pelo ID ou nome
app.get('/estoques/:id', async (req, res) => {
    try {
        let estoque;

        if (mongoose.Types.ObjectId.isValid(req.params.id)) {
            estoque = await Estoque.findById(req.params.id);
        }

        if (!estoque) {
            estoque = await Estoque.findOne({ nome: req.params.id });
        }

        if (!estoque) {
            return res.status(404).json({ message: 'Estoque não encontrado' });
        }

        res.status(200).json(estoque);
    } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        res.status(500).json({ message: 'Erro ao buscar estoque.' });
    }
});

// Rota para atualizar um estoque
app.patch('/estoques/:id', async (req, res) => {
    try {
        const { nome, localizacao, tipoEstante, tipoProduto, capacidadeTotal, numPrateleiras, espacoEntrePrateleiras, pesoMaximo } = req.body;

        const estoque = await Estoque.findById(req.params.id);
        
        if (!estoque) {
            return res.status(404).json({ message: 'Estoque não encontrado' });
        }

        if (nome) estoque.nome = nome;
        if (localizacao) estoque.localizacao = localizacao;
        if (tipoEstante) estoque.tipoEstante = tipoEstante;
        if (tipoProduto) estoque.tipoProduto = tipoProduto;
        if (capacidadeTotal) estoque.capacidadeTotal = capacidadeTotal;
        if (numPrateleiras) estoque.numPrateleiras = numPrateleiras;
        if (espacoEntrePrateleiras) estoque.espacoEntrePrateleiras = espacoEntrePrateleiras;
        if (pesoMaximo) estoque.pesoMaximo = pesoMaximo;

        await estoque.save();

        res.status(200).json(estoque);
    } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
        res.status(500).json({ message: 'Erro ao atualizar estoque.' });
    }
});

// Rota para buscar produtos de um estoque específico
app.get('/produtos/por-estoque/:almoxerifado', async (req, res) => {
    const { almoxerifado } = req.params;

    try {
        const produtosPorEstoque = await Produto.find({ almoxerifado });
        res.status(200).json(produtosPorEstoque);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar produtos por estoque.' });
    }
});

// Endpoint para buscar produtos registrados no mês atual
app.get('/produtos/registrados-mes', async (req, res) => {
    try {
        const inicioDoMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const fimDoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59); 
        const produtos = await Produto.find({
            createdAt: { 
                $gte: inicioDoMes,
                $lte: fimDoMes 
            }
        });

        res.status(200).json(produtos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
});

// Rota para consultar as informações do estoque e calcular 
app.get('/estoques/:almoxerifado', async (req, res) => {
    try {
        const almoxerifado = req.params.almoxerifado;
        const estoque = await Estoque.findOne({ nome: almoxerifado }).populate('produtos');

        if (!estoque) {
            return res.status(404).json({ message: 'Estoque não encontrado' });
        }
        let capacidadeUtilizada = 0;
        let custoTotal = 0;

        estoque.produtos.forEach(produto => {
            capacidadeUtilizada += produto.volume;
            custoTotal += produto.preco || 0;
        });
        const ocupacaoAtual = ((capacidadeUtilizada / estoque.capacidadeTotal) * 100).toFixed(2);

        res.json({
            capacidadeTotal: estoque.capacidadeTotal,
            capacidadeUtilizada: capacidadeUtilizada,
            ocupacaoAtual: `${ocupacaoAtual}%`,
            custoTotal: custoTotal.toFixed(2)
        });

    } catch (error) {
        console.error('Erro ao consultar estoque:', error);
        res.status(500).json({ message: 'Erro ao consultar estoque.' });
    }
});

// Atualizar a meta de registro de produtos para todos os estoques
app.put('/estoques/metaRegistro', async (req, res) => {
    const { metaMensal } = req.body;
    
    if (!metaMensal || metaMensal <= 0) {
        return res.status(400).json({ error: "Meta mensal inválida." });
    }

    try {
        const estoquesAtualizados = await Estoque.updateMany(
            {},
            { $set: { "metasRegistro.metaMensal": metaMensal } }
        );

        return res.status(200).json({ message: "Metas de todos os estoques atualizadas." });
    } catch (error) {
        console.error("Erro ao atualizar as metas:", error);
        return res.status(500).json({ error: "Erro ao atualizar as metas." });
    }
});

// Rota para conseguirmos contar a movimentação dos produtos no estoque...
app.post('/movimentacoes', async (req, res) => {
    try {
        const { novoAlmoxerifado, novaLocalizacao, produtoId } = req.body;

        if (!produtoId) {
            return res.status(400).json({ message: 'produtoId é obrigatório.' });
        }

        const produto = await Produto.findById(produtoId);

        if (!produto) {
            return res.status(404).json({ message: 'Produto não encontrado.' });
        }

        const almoxerifadoAntigo = produto.almoxerifado;
        const localizacaoAntiga = produto.localizacao;

        let movimentacaoAtualizada = false;

        if (novoAlmoxerifado && almoxerifadoAntigo !== novoAlmoxerifado) {
            produto.almoxerifado = novoAlmoxerifado;
            movimentacaoAtualizada = true;
        }

        if (novaLocalizacao && localizacaoAntiga !== novaLocalizacao) {
            produto.localizacao = novaLocalizacao;
            movimentacaoAtualizada = true;
        }

        if (movimentacaoAtualizada) {
            produto.movimentacoes += 1;
            produto.dataMovimentacao = new Date();

            await Produto.updateOne(
                { _id: produto._id },
                {
                    $set: {
                        movimentacoes: produto.movimentacoes,
                        dataMovimentacao: produto.dataMovimentacao,
                        almoxerifado: produto.almoxerifado,
                        localizacao: produto.localizacao,
                    },
                }
            );
        }

        res.status(200).json({ message: 'Movimentação atualizada com sucesso.' });

    } catch (error) {
        console.error('Erro ao processar movimentações:', error);
        res.status(500).json({ message: 'Erro ao calcular movimentação.' });
    }
});


// Rota para enviar para o front, somando todas as movimentações de todos os produtos
app.get('/movimentacoes', async (req, res) => {
    try {
        const produtos = await Produto.find({});
        const totalMovimentacoes = produtos.reduce((total, produto) => {
            return total + (produto.movimentacoes || 0);
        }, 0);

        res.status(200).json({ totalMovimentacoes });
    } catch (error) {
        console.error('Erro ao calcular movimentações:', error);
        res.status(500).json({ message: 'Erro ao calcular movimentações.' });
    }
});


// Rota para obter os produtos cadastrados no mês e no período
app.get('/produtos/contagem-funcionarios', async (req, res) => {
    try {
        const inicioDoMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const fimDoMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);
        const produtosNoMes = await Produto.find({
            createdAt: { 
                $gte: inicioDoMes,
                $lte: fimDoMes
            }
        }).populate('idFuncionario');

        const produtosPorPeriodo = await Produto.find().populate('idFuncionario');
        res.status(200).json({
            produtosNoMes,
            produtosPorPeriodo
        });

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos.' });
    }
});

// Rota para produtos perto do vencimento
app.get('/api/produtos/alertas', async (req, res) => {
    try {
        const hoje = new Date();
        const produtos = await Produto.find();

        const produtosComAlertas = produtos.map(produto => {
            const dataValidade = produto.data_validade ? new Date(produto.data_validade) : null;
            if (!dataValidade || isNaN(dataValidade)) {
                console.error(`Data inválida para o produto ${produto.nome}:`, produto.data_validade);
                return null; // Ignorar produtos com validade inválida
            }
            
            const diffTime = dataValidade - hoje;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let alerta = null;

            if (diffDays <= 10 && diffDays > 0) {
                alerta = 'super-alerta';
            } else if (diffDays <= 20 && diffDays > 10) {
                alerta = 'alerta';
            } else if (diffDays <= 30 && diffDays > 20) {
                alerta = 'alerta-modificado';
            }

            if (alerta) {
                return {
                    nome: produto.nome,
                    data_validade: produto.data_validade,
                    diasRestantes: diffDays,
                    alerta: alerta
                };
            }
            return null;
        }).filter(produto => produto !== null);

        res.json(produtosComAlertas);
    } catch (error) {
        console.error('Erro ao buscar produtos perto do vencimento:', error);
        res.status(500).json({ message: 'Erro ao buscar produtos perto do vencimento' });
    }
});

// Rota para juntar os grupos dos produtos
app.get('/produtos/grupos', async (req, res) => {
    const { estoqueNome } = req.query;
    try {
        if (!estoqueNome) {
            return res.status(400).send({ error: "Nome do estoque não fornecido." });
        }

        const produtos = await Produto.aggregate([
            { $match: { almoxerifado: estoqueNome } },
            { $group: { _id: "$grupo", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        res.json(produtos);
    } catch (error) {
        console.error("Erro ao agrupar produtos por grupo:", error);
        res.status(500).send({ error: "Erro ao agrupar produtos por grupo." });
    }
});

//Rota para juntar os subgrupos
app.get('/produtos/subgrupos', async (req, res) => {
    const { estoqueNome, grupo } = req.query;
    try {
        if (!estoqueNome || !grupo) {
            return res.status(400).send({ error: "Nome do estoque ou grupo não fornecidos." });
        }
        const produtos = await Produto.aggregate([
            { $match: { almoxerifado: estoqueNome, grupo: grupo } },
            { $group: { _id: "$sub_grupo", total: { $sum: 1 } } },
            { $sort: { total: -1 } }
        ]);
        res.json(produtos);
    } catch (error) {
        console.error("Erro ao agrupar produtos por subgrupo:", error);
        res.status(500).send({ error: "Erro ao agrupar produtos por subgrupo." });
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