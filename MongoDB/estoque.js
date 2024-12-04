const mongoose = require('mongoose');

// Definição do schema do Estoque
const estoqueSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    tipoEstante: { type: String, required: true },
    tipoProduto: { type: String, required: true },
    capacidadeTotal: { type: Number, required: true },
    numPrateleiras: { type: Number, required: true },
    espacoEntrePrateleiras: { type: Number, required: true },
    pesoMaximo: { type: Number, required: true },
    statusProduto: { type: String, required: true },
    localizacao: { type: String },
    produtos: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Produto',
            required: true,
        },
    ],
    volumePorPrateleira: { type: Number, required: true },
    totalVolumeOcupado: { type: Number, required: true },
    numCaixas: { type: Number, required: true },
    capacidadeUtilizada: { type: Number, required: true },

    metasRegistro: {
        metaMensal: { type: Number, required: true },
        metaMensalAtual: { type: Number, default: 0 },
    },
}, { timestamps: true });

const Estoque = mongoose.model('Estoque', estoqueSchema);


module.exports = Estoque;
