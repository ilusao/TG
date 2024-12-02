const mongoose = require('mongoose');

const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    contato: String,
    departamento: String,
    codigoFuncionario: String,
    turno: String,
    servico: String,
    inativo: Boolean,
    cargo: String,
    fotoPerfil: String,
    senha: { type: String, required: true },
    dataContratacao: { type: Date, required: true },
    dataPromocao: Date,
    comportamento: { type: String, maxlength: 1000 },
    produtosCadastrados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Produto' }],
    metasCumpridas: [{ type: String }],
    metaMensalAtual: { type: Number, default: 0 },
}, { timestamps: true });

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

module.exports = Funcionario;
