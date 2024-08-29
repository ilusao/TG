const mongoose = require('mongoose');

const funcionarioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    observacoes: String,
    departamento: String,
    codigoFuncionario: String,
    turno: String,
    servico: String,
    inativo: Boolean,
    cargo: String
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

module.exports = Funcionario;

