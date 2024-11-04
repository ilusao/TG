const mongoose = require('mongoose');

const produtoSchema = new mongoose.Schema({
    codigo_produto: { type: String, required: true, unique: true },
    nome: { type: String, required: true },
    descricao_pdv: { type: String, maxlength: 255 },
    grupo: { type: String },
    sub_grupo: { type: String },
    fornecedor: { type: String },
    marca: { type: String },
    localizacao: { type: String },
    destino: { type: String },
    almoxerifado: { type: String },
    data_entrada: { type: Date, default: Date.now },
    data_saida: { type: Date },
    preco: { type: Number, min: 0 },
    inflamavel: { type: Boolean, default: false },
    fragil: { type: Boolean, default: false },
    fotoProduto: { type: String },
}, {
    timestamps: true
});

produtoSchema.pre('save', function (next) {
    if (this.data_saida && this.data_saida < this.data_entrada) {
        return next(new Error('A data de saída não pode ser anterior à data de entrada.'));
    }
    next();
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;
