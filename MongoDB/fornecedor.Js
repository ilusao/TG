const mongoose = require('mongoose');

const fornecedorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    descricao: { type: String },
    observacoes: { type: String },
    pais: { type: String },
    cidade: { type: String },
    estado: { type: String },
    site: { type: String },
    cnpj: { type: String, required: true },
    inativo: { type: Boolean, default: false },
    preco_proprietario: { type: String, enum: ['Vendas', 'Compras'], default: 'Vendas' }
});

const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema);

module.exports = Fornecedor;
