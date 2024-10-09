// Função para validação de cada campo individualmente
const validateField = (input) => {
    if (!input.value.trim()) {
        input.classList.add('is-invalid');
        return false;
    } else {
        input.classList.remove('is-invalid');
        input.classList.add('is-valid');
        return true;
    }
};

// Seleciona o formulário uma vez, para ser usado em várias partes
const form = document.getElementById('productForm');

// Função para enviar os dados do produto ao backend
const submitForm = async (formData) => {
    try {
        const response = await fetch('/api/produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Produto cadastrado com sucesso!');
            form.reset(); // Limpa o formulário após o cadastro bem-sucedido
        } else {
            const errorData = await response.json();
            alert(`Erro ao cadastrar o produto: ${errorData.error}`);
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro:', error);
    }
};

// Validação do formulário e envio dos dados
(() => {
    'use strict';

    form.addEventListener('submit', (event) => {
        event.preventDefault(); // Evita o envio padrão do formulário

        // Verifica se o formulário é válido
        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Coleta os dados do formulário
        const formData = {
            nome: document.getElementById('nome').value,
            descricao_pdv: document.getElementById('descricao').value,
            grupo: document.getElementById('groupSelect').value,
            sub_grupo: document.getElementById('subgroupSelect').value,
            fornecedor: document.getElementById('fornecedor').value,
            marca: document.getElementById('marca').value,
            codigo_produto: document.getElementById('codigoProduto').value,
            localizacao: document.getElementById('localizacao').value,
            destino: document.getElementById('destino').value,
            almoxerifado: document.getElementById('almoxerifado').value,
            data_entrada: document.getElementById('dataEntrada').value,
            data_saida: document.getElementById('dataSaida').value,
            preco: document.getElementById('preco').value,
            inflamavel: document.getElementById('inflamavel').value === 'sim',
            fragil: document.getElementById('fragil').value === 'sim',
        };

        // Envia os dados para o backend
        submitForm(formData);
    });
})();

// Função para verificar se todos os campos obrigatórios estão preenchidos
document.addEventListener('DOMContentLoaded', function() {
    const inputs = form.querySelectorAll('input, select');

    function checkForm() {
        let allFilled = true;

        inputs.forEach(function(input) {
            if (input.hasAttribute('required') && !input.value) {
                allFilled = false;
            }
        });

        // Ativa ou desativa o botão Consultar baseado nos campos obrigatórios
        document.getElementById('Consult').disabled = !allFilled;
    }

    inputs.forEach(function(input) {
        input.addEventListener('input', checkForm);
    });

    checkForm();
});
