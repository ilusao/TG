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
    fotoPerfil: String
});

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

module.exports = Funcionario;

