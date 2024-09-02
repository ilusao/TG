const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    codigo_produto: { type: Number, },
    nome: { type: String, },
    descricao_pdv: { type: String, },
    grupo: { type: String, },
    sub_grupo: { type: String, },
    fornecedor: { type: String, },
    marca: { type: String, },
    localizacao: { type: Number, },
    destino: { type: String, },
    almoxerifado: { type: String, },
    data_entrada: { type: Date, },
    data_saida: { type: Date },
    preco: { type: Number, },
    inflamavel: { type: Boolean, },
    fragil: { type: Boolean, }
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
