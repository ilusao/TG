const mongoose = require('mongoose');

const estoqueSchema = new mongoose.Schema({
    codigo_produto: { type: Number, required: true },
    nome: { type: String, required: true },
    descricao_pdv: { type: String },
    grupo: { type: String },
    sub_grupo: { type: String },
    fornecedor: { type: String },
    marca: { type: String },
    localizacao: { type: String },
    destino: { type: String },
    almoxerifado: { type: String, required: true },
    quantidade: { type: Number, required: true },
    unidade_medida: { type: String, default: 'unidade' },
    data_entrada: { type: Date, default: Date.now },
    data_saida: { type: Date },
    preco_custo: { type: Number, required: true },
    preco_venda: { type: Number },
    inflamavel: { type: Boolean, default: false },
    fragil: { type: Boolean, default: false },
    validade: { type: Date },
    status: { type: String, enum: ['disponível', 'reservado', 'vendido'], default: 'disponível' }
});

const Estoque = mongoose.model('Estoque', estoqueSchema);

module.exports = Estoque;
