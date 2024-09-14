const mongoose = require('mongoose');

const estoqueSchema = new mongoose.Schema({
    codigo_produto: { type: Number, required: true },
    nome: { type: String, required: true },
    descricao_pdv: { type: String },
    grupo: { type: String },
    sub_grupo: { type: String },
    fornecedor: { type: String },
    marca: { type: String },
    localizacao: { type: String }, // Pode ser um código ou nome de setor
    destino: { type: String }, // Exemplo: Loja, Cliente, etc.
    almoxerifado: { type: String, required: true }, // Local do armazenamento
    quantidade: { type: Number, required: true }, // Quantidade em estoque
    unidade_medida: { type: String, default: 'unidade' }, // Exemplos: kg, unidade, caixa
    data_entrada: { type: Date, default: Date.now }, // Data de entrada no estoque
    data_saida: { type: Date },
    preco_custo: { type: Number, required: true }, // Preço de compra/custo
    preco_venda: { type: Number }, // Preço de venda
    inflamavel: { type: Boolean, default: false }, // Identificação de item inflamável
    fragil: { type: Boolean, default: false }, // Identificação de item frágil
    validade: { type: Date }, // Data de validade, se aplicável
    status: { type: String, enum: ['disponível', 'reservado', 'vendido'], default: 'disponível' } // Status do item
});

const Estoque = mongoose.model('Estoque', estoqueSchema);

module.exports = Estoque;
