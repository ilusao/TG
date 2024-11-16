const express = require('express');
const multer = require('multer');
const { Funcionario, calcularTempoNaEmpresa } = require('./Funcionarios');
const Produto = require('./Produto');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// Configuração do multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', 'Paginas', 'Midia')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); 
    }
});

const upload = multer({ storage });

// Rota para upload de imagens do funcionário
router.post('/upload', upload.single('imagem'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }

    // Verifica o ID do funcionário na requisição
    const funcionarioId = req.body.funcionarioId || req.body.viewedFuncionarioId;

    // Se nenhum dos dois IDs estiver presente, retorna erro
    if (!funcionarioId) {
        return res.status(400).send('ID do funcionário não encontrado.');
    }

    try {
        const funcionario = await Funcionario.findById(funcionarioId);
        
        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado.');
        }

        // Verificando a foto anterior
        const fotoAnterior = funcionario.fotoPerfil;
        console.log('Foto anterior:', fotoAnterior);

        if (fotoAnterior) {
            // Remove o prefixo /midia/ para obter o caminho correto
            const fotoAnteriorPath = path.join(__dirname, '..', 'Paginas', 'Midia', fotoAnterior.replace('/midia/', ''));
            console.log('Tentando apagar:', fotoAnteriorPath);

            fs.access(fotoAnteriorPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(fotoAnteriorPath, (err) => {
                        if (err) {
                            console.error('Erro ao apagar a foto anterior:', err);
                        } else {
                            console.log('Foto anterior apagada com sucesso.');
                        }
                    });
                } else {
                    console.log('A foto anterior não existe, não há necessidade de apagar.');
                }
            });
        }

        const imageUrl = `/midia/${req.file.filename}`;
        await Funcionario.findByIdAndUpdate(funcionarioId, { fotoPerfil: imageUrl });

        res.json({ imageUrl });
    } catch (error) {
        console.error('Erro ao atualizar a foto do funcionário:', error);
        return res.status(500).send('Erro ao atualizar a foto do funcionário.');
    }
});

// Middleware para lidar com imagens de funcionários não encontradas
router.get('/midia/funcionario/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'Paginas', 'Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultImagePath = path.join(__dirname, '..', 'Paginas', 'Midia', 'fotooriginal.png');
            fs.access(defaultImagePath, fs.constants.F_OK, (defaultErr) => {
                if (defaultErr) {
                    return res.status(404).send('Imagem padrão não encontrada.');
                } else {
                    return res.sendFile(defaultImagePath);
                }
            });
        } else {
            res.sendFile(filePath);
        }
    });
});


// Rota para upload de imagens do produto
router.post('/produto/:id/mudar-foto', upload.single('foto'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }

    const produtoId = req.params.id;

    try {
        const produto = await Produto.findById(produtoId);

        if (!produto) {
            return res.status(404).send('Produto não encontrado.');
        }

        // Caminho da foto anterior
        const fotoAnterior = produto.fotoProduto;

        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', 'Paginas', 'Midia', fotoAnterior.replace('/midia/', ''));

            await new Promise((resolve, reject) => {
                fs.access(fotoAnteriorPath, fs.constants.F_OK, (err) => {
                    if (err) {
                        console.log('A foto anterior do produto não existe, não há necessidade de apagar.');
                        return resolve();
                    }

                    fs.unlink(fotoAnteriorPath, (err) => {
                        if (err) {
                            console.error('Erro ao apagar a foto anterior do produto:', err);
                            return reject(err);
                        }
                        console.log('Foto anterior do produto apagada com sucesso.');
                        resolve();
                    });
                });
            });
        }

        const imageUrl = `/midia/${req.file.filename}`;
        await Produto.findByIdAndUpdate(produtoId, { fotoProduto: imageUrl });

        res.json({ success: true, novaFotoUrl: imageUrl });
    } catch (error) {
        console.error('Erro ao atualizar a foto do produto:', error);
        return res.status(500).send('Erro ao atualizar a foto do produto.');
    }
});

module.exports = router;