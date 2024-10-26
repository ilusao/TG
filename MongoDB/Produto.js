const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    codigo_produto: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    descricao_pdv: { type: String },
    grupo: { type: String },
    sub_grupo: { type: String },
    fornecedor: { type: String },
    marca: { type: String },
    localizacao: { type: String },
    destino: { type: String }, 
    almoxerifado: { type: String },
    data_entrada: { type: Date },
    data_saida: { type: Date },
    preco: { type: Number },
    inflamavel: { type: Boolean, default: false },
    fragil: { type: Boolean, default: false },
    fotoProduto: { type: String },
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;