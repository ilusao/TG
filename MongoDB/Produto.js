const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    codigo_produto: { type: String, required: true },
    nome: { type: String, required: true },
    descricao_pdv: String,
    grupo: String,
    sub_grupo: String,
    fornecedor: String,
    marca: String,
    localizacao: String,
    destino: String,
    almoxerifado: String,
    data_entrada: Date,
    data_saida: Date,
    preco: Number,
    inflamavel:  Boolean,
    fragil: Boolean, 
    fotoProduto: String, 
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
