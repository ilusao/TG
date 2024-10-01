const express = require('express');
const multer = require('multer');
const Funcionario = require('./Funcionarios');
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

router.post('/upload', upload.single('imagem'), async (req, res) => {
    // Verifica se um arquivo foi enviado
    if (!req.file) {
        return res.status(400).send('Nenhuma imagem foi enviada.');
    }
    
    const funcionarioId = req.body.funcionarioId;

    try {
        // Busca o funcionário pelo ID para obter a foto anterior
        const funcionario = await Funcionario.findById(funcionarioId);
        
        // Verifica se o funcionário existe
        if (!funcionario) {
            return res.status(404).send('Funcionário não encontrado.');
        }

        // Caminho da foto anterior
        const fotoAnterior = funcionario.fotoPerfil;

        // Apaga a foto anterior se existir
        if (fotoAnterior) {
            const fotoAnteriorPath = path.join(__dirname, '..', fotoAnterior);
            fs.access(fotoAnteriorPath, fs.constants.F_OK, (err) => {
                if (!err) {
                    // O arquivo existe, pode tentar apagar
                    fs.unlink(fotoAnteriorPath, (err) => {
                        if (err) {
                            console.error('Erro ao apagar a foto anterior:', err);
                        } else {
                            console.log('Foto anterior apagada com sucesso.');
                        }
                    });
                } else {
                    // Arquivo não existe
                    console.log('A foto anterior não existe, não há necessidade de apagar.');
                }
            });
        }

        // Atualiza o caminho da nova imagem
        const imageUrl = `/midia/${req.file.filename}`; // Usando req.file.filename para o novo caminho
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
    const filePath = path.join(__dirname, '..', 'C:/TG/Midia', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // Se o arquivo não for encontrado, enviar a imagem padrão
            const defaultImagePath = path.join(__dirname, '..', 'C:/TG/Midia/fotooriginal.png');
            return res.sendFile(defaultImagePath);
        }
        // Se o arquivo existir, envia o arquivo normal
        res.sendFile(filePath);
    });
});

module.exports = router;
