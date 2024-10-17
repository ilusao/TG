const express = require('express');
const multer = require('multer');
const Funcionario = require('./Funcionarios');
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

// Rota para upload de imagens
router.post('/upload', upload.single('imagem'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }
    
    const funcionarioId = req.body.funcionarioId;

    try {
        const funcionario = await Funcionario.findById(funcionarioId);
        
        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado.');
        }

        // Caminho da foto anterior
        const fotoAnterior = funcionario.fotoPerfil;

        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', 'Paginas', 'Midia', fotoAnterior);
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

// Middleware para lidar com imagens não encontradas
router.get('/midia/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'Paginas', 'Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultImagePath = path.join(__dirname, '..', 'Paginas', 'Midia', 'fotooriginal.png');
            return res.sendFile(defaultImagePath);
        }
        res.sendFile(filePath);
    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// foto do produto

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
        const fotoAnterior = produto.fotoUrl;

        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', 'Paginas', 'Midia', fotoAnterior);
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
        await Produto.findByIdAndUpdate(produtoId, { fotoProduto: imageUrl });

        res.json({ success: true, novaFotoUrl: imageUrl });
    } catch (error) {
        console.error('Erro ao atualizar a foto do produto:', error);
        return res.status(500).send('Erro ao atualizar a foto do produto.');
    }
});

// Middleware para servir imagens do produto
router.get('/midia/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'Paginas', 'Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultImagePath = path.join(__dirname, '..', 'Paginas', 'Midia', 'Originalproduto.png');
            return res.sendFile(defaultImagePath);
        }
        res.sendFile(filePath);
    });
});


module.exports = router;
