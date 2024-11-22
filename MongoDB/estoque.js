const mongoose = require('mongoose');

// Definição do esquema do estoque
const estoqueSchema = new mongoose.Schema({
    tipoEstante: {
        type: String,
        required: true
    },
    tipoProduto: {
        type: String,
        required: true
    },
    capacidadeTotal: {
        type: Number,
        required: true
    },
    numPrateleiras: {
        type: Number,
        required: true
    },
    statusProduto: {
        type: String,
        required: true
    },
    produtos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Produto',  // Referência ao modelo Produto
            required: true
        }
    ]
}, { timestamps: true });  // Adiciona campos 'createdAt' e 'updatedAt'

// Criando o modelo para o estoque
const Estoque = mongoose.model('Estoque', estoqueSchema);

module.exports = Estoque;