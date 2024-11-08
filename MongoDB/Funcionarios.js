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
    tempoNaEmpresa: {
        dias: { type: Number, default: 0 },
        meses: { type: Number, default: 0 },
        anos: { type: Number, default: 0 }
    }
});

// Função para calcular tempo na empresa (em dias, meses, anos)
function calcularTempoNaEmpresa(dataContratacao) {
    const contratacaoDate = new Date(dataContratacao);
    const today = new Date();

    const diffInMs = today - contratacaoDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const anos = Math.floor(diffInDays / 365);
    const meses = Math.floor((diffInDays % 365) / 30);
    const dias = diffInDays % 30;

    return { anos, meses, dias };
}

// Criar a função assíncrona para buscar o funcionário
async function getFuncionarioTempo(req, res) {
    const funcionarioId = req.params.id;

    try {
        const funcionario = await Funcionario.findById(funcionarioId);

        if (!funcionario) {
            return res.status(404).json({ error: 'Funcionário não encontrado' });
        }
        
        const tempo = calcularTempoNaEmpresa(funcionario.dataContratacao);
        funcionario.tempoNaEmpresa = tempo;

        res.json(funcionario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar as informações do funcionário' });
    }
}

const Funcionario = mongoose.model('Funcionario', funcionarioSchema);

module.exports = { Funcionario, getFuncionarioTempo, calcularTempoNaEmpresa };