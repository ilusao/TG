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
        cb(null, 'C:/TG/Midia');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Rota para upload de fotos de funcionários
router.post('/upload', upload.single('imagem'), async (req, res) => {
    // Verifica se um arquivo foi enviado
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }
    
    const funcionarioId = req.body.funcionarioId;

    try {
        const funcionario = await Funcionario.findById(funcionarioId);
        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado.');
        }

        const fotoAnterior = funcionario.fotoPerfil;

        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', fotoAnterior);
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

        // Correção aqui: use template strings (``) para construir a URL da imagem
        const imageUrl = `midia/${req.file.filename}`;
        await Funcionario.findByIdAndUpdate(funcionarioId, { fotoPerfil: imageUrl });

        res.json({ imageUrl });
    } catch (error) {
        console.error('Erro ao atualizar a foto do funcionário:', error);
        return res.status(500).send('Erro ao atualizar a foto do funcionário.');
    }
});

// Nova rota para upload de fotos de produtos
router.post('/upload/produto', upload.single('imagem'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }
    
    const produtoId = req.body.produtoId;

    try {
        const produto = await Produto.findById(produtoId);
        if (!produto) {
            return res.status(404).send('Produto não encontrado.');
        }

        const fotoAnterior = produto.fotoProduto;

        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', fotoAnterior);
            fs.access(fotoAnteriorPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    fs.unlink(fotoAnteriorPath, (err) => {
                        if (err) {
                            console.error('Erro ao apagar a foto anterior do produto:', err);
                        } else {
                            console.log('Foto anterior do produto apagada com sucesso.');
                        }
                    });
                } else {
                    console.log('A foto anterior do produto não existe, não há necessidade de apagar.');
                }
            });
        }

        // Correção aqui: use template strings (``) para construir a URL da imagem
        const imageUrl = `midia/${req.file.filename}`;
        await Produto.findByIdAndUpdate(produtoId, { fotoProduto: imageUrl });

        res.json({ imageUrl });
    } catch (error) {
        console.error('Erro ao atualizar a foto do produto:', error);
        return res.status(500).send('Erro ao atualizar a foto do produto.');
    }
});

// Middleware para lidar com imagens não encontradas
router.get('/midia/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'C:/TG/Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultImagePath = path.join(__dirname, '..', 'C:/TG/Midia/fotooriginal.png');
            return res.sendFile(defaultImagePath);
        }
        res.sendFile(filePath);
    });
});

// Middleware para lidar com imagens de produtos não encontradas
router.get('/midia/produto/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '..', 'C:/TG/Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            const defaultImagePath = path.join(__dirname, '..', 'C:/TG/Midia/Produtooriginal.png');
            return res.sendFile(defaultImagePath);
        }
        res.sendFile(filePath);
    });
});

module.exports = router;
