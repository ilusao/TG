const mongoose = require('mongoose');

const fornecedorSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true },
    descricao: { type: String },
    observacoes: { type: String },
    pais: { type: String },
    cidade: { type: String },
    estado: { type: String },
    cep: { type: String },
    numero: { type: String },
    site: { type: String },
    cnpj: { type: String, required: true },
    telefone: { type: String },
    codigo_fornecedor: { type: String, required: true, unique: true },
    idFuncionario: { type: mongoose.Schema.Types.ObjectId, ref: 'Funcionario', required: true },
    fotoFornecedor: { type: String },
    produtos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }],
    dataCadastro: { type: Date, default: Date.now },
    inativo: { type: Boolean, default: false }
});

const Fornecedor = mongoose.model('Fornecedor', fornecedorSchema, 'fornecedores');

module.exports = Fornecedor;