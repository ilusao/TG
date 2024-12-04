// Função para validar cada campo individualmente
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
const submitForm = async (formData, exportarParaExcel) => {
    try {
        console.log('Iniciando o envio dos dados para o backend...');
        console.log('Dados:', formData);
        console.log('Exportar para Excel:', exportarParaExcel);

        if (exportarParaExcel) {
            console.log('Enviando dados para gerar Excel...');
            const response = await fetch('http://localhost:5000/produto/gerar-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Status da resposta:', response.status);

            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'produto.xlsx';
                link.click();
                console.log('Excel gerado e baixado com sucesso.');
            } else {
                console.error('Erro ao gerar Excel no Flask:', response.statusText);
                alert('Erro ao gerar o Excel.');
            }
        } else {
            console.log('Enviando dados para MongoDB...');
            const response = await fetch('/api/produto', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert('Produto cadastrado com sucesso!');
                form.reset();
            } else {
                const errorData = await response.json();
                alert(`Erro ao cadastrar o produto: ${errorData.error}`);
            }
        }
    } catch (error) {
        alert('Erro ao conectar com o servidor.');
        console.error('Erro:', error);
    }
};

const Estoques = async () => {
    try {
        const response = await fetch('/estoques');
        if (!response.ok) {
            throw new Error('Erro ao buscar estoques');
        }

        const estoques = await response.json(); 
        populateEstoqueSelect(estoques); 
    } catch (error) {
        console.error(error);
        alert('Erro ao carregar os estoques.');
    }
};

// Função para mostrar os nomes dos estoques no datalist
const populateEstoqueSelect = (estoques) => {
    const almoxerifadoDatalist = document.getElementById('estoques');
    almoxerifadoDatalist.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um estoque';
    almoxerifadoDatalist.appendChild(defaultOption);
    estoques.forEach(estoque => {
        const option = document.createElement('option');
        option.value = estoque.nome; 
        almoxerifadoDatalist.appendChild(option);
    });
};

// Validação do formulário e envio dos dados
(() => {
    'use strict';

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            event.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        // Coleta os dados do formulário
        const formData = {
            codigo_produto: document.getElementById('codigoProduto').value,
            nome: document.getElementById('nome').value,
            descricao_pdv: document.getElementById('descricao').value,
            grupo: document.getElementById('groupSelect').value,
            sub_grupo: document.getElementById('subgroupSelect').value,
            fornecedor: document.getElementById('fornecedor').value,
            marca: document.getElementById('marca').value,
            localizacao: document.getElementById('localizacao').value || "Dom Amaury Castanho", 
            destino: document.getElementById('destino').value || null,
            almoxerifado: document.getElementById('almoxerifado').value || null,
            peso: parseFloat(document.getElementById('pesoProduto').value),
            volume: parseFloat(document.getElementById('volumeProduto').value),
            data_entrada: document.getElementById('dataEntrada').value.split('T')[0],
            data_saida: document.getElementById('dataSaida').value.split('T')[0] || null, 
            preco: parseFloat(document.getElementById('preco').value.replace(/\./g, '').replace(',', '.')),
            inflamavel: document.getElementById('inflamavel').value === 'sim',
            fragil: document.getElementById('fragil').value === 'sim',
            idFuncionario: localStorage.getItem('funcionarioId')
        };

        if (formData.grupo === '' || formData.grupo === 'Selecione um grupo') {
            alert('Por favor, selecione um grupo válido.');
            return;
        }

        if (formData.sub_grupo === '' || formData.sub_grupo === 'Selecione um subgrupo') {
            alert('Por favor, selecione um subgrupo válido.');
            return;
        }

        const exportarParaExcel = document.getElementById('exportarExcel').classList.contains('btn-success');

        console.log('Exportar para Excel:', exportarParaExcel); 

        submitForm(formData, exportarParaExcel);
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    const exportarButton = document.getElementById('exportarExcel');
    const statusSpan = document.getElementById('statusExportarExcel');
    let exportarParaExcel = false;

    exportarButton.addEventListener('click', function () {
        exportarParaExcel = !exportarParaExcel;
        if (exportarParaExcel) {
            exportarButton.classList.add('btn-success');
            exportarButton.classList.remove('btn-danger');
        } else {
            exportarButton.classList.remove('btn-success');
            exportarButton.classList.add('btn-danger');
        }
        statusSpan.textContent = exportarParaExcel ? 'Sim' : 'Não';

        console.log('Botão de exportação para Excel foi clicado. Novo estado:', exportarParaExcel);
    });
});

// botão registrar
document.addEventListener('DOMContentLoaded', function() {
    const inputs = form.querySelectorAll('input, select');
    document.getElementById('Consult').disabled = true;

    function checkForm() {
        let allFilled = true;

        inputs.forEach(function(input) {
            if (input.hasAttribute('required') && input.id !== 'localizacao' && input.id !== 'destino' && !input.value.trim()) {
                allFilled = false;
            }
        });

        document.getElementById('Consult').disabled = !allFilled;
    }

    inputs.forEach(function(input) {
        input.addEventListener('input', checkForm);
    });

    checkForm();
});

// Armazena grupos e subgrupos no localStorage
let grupos = JSON.parse(localStorage.getItem('grupos')) || [];
let subgrupos = JSON.parse(localStorage.getItem('subgrupos')) || {};

if (!Array.isArray(grupos)) {
    grupos = [];
}

if (typeof subgrupos !== 'object' || subgrupos === null) {
    subgrupos = {};
}

// Atualiza as opções de grupos e subgrupos
const updateGroupOptions = () => {
    const groupSelect = document.getElementById('groupSelect');
    groupSelect.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um grupo';
    groupSelect.appendChild(defaultOption);

    if (Array.isArray(grupos) && grupos.length > 0) {
        grupos.forEach(grupo => {
            const option = document.createElement('option');
            option.value = grupo;
            option.textContent = grupo;
            groupSelect.appendChild(option);
        });
    }
};

const updateSubgroupOptions = () => {
    const subgroupSelect = document.getElementById('subgroupSelect');
    subgroupSelect.innerHTML = ''; 

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Selecione um subgrupo'; 
    subgroupSelect.appendChild(defaultOption);

    const selectedGroup = document.getElementById('groupSelect').value;
    
    if (subgrupos[selectedGroup]) {
        subgrupos[selectedGroup].forEach(subgrupo => {
            const option = document.createElement('option');
            option.value = subgrupo;
            option.textContent = subgrupo;
            subgroupSelect.appendChild(option);
        });
    }
};

// Adiciona evento para adicionar grupos
document.getElementById('addGroup').addEventListener('click', () => {
    const newGroup = prompt('Insira o nome do novo grupo:');
    if (newGroup) {
        if (!grupos.includes(newGroup)) { 
            grupos.push(newGroup);
            localStorage.setItem('grupos', JSON.stringify(grupos));
            updateGroupOptions();
        } else {
            alert('Grupo já existe!');
        }
    }
});

// Adiciona evento para adicionar subgrupos
document.getElementById('addSubgroup').addEventListener('click', () => {
    const selectedGroup = document.getElementById('groupSelect').value;
    const newSubgroup = prompt('Insira o nome do novo subgrupo:');
    
    if (newSubgroup && selectedGroup) {
        if (!subgrupos[selectedGroup]) {
            subgrupos[selectedGroup] = []; 
        }

        if (!subgrupos[selectedGroup].includes(newSubgroup)) { 
            subgrupos[selectedGroup].push(newSubgroup);
            localStorage.setItem('subgrupos', JSON.stringify(subgrupos));
            updateSubgroupOptions();
        } else {
            alert('Subgrupo já existe!');
        }
    } else {
        alert('Selecione um grupo antes de adicionar um subgrupo.');
    }
});

// para mostrar os estoques
document.addEventListener('DOMContentLoaded', () => {
    Estoques();
});

// Atualiza as opções no carregamento da página
document.addEventListener('DOMContentLoaded', () => {
    updateGroupOptions();
    updateSubgroupOptions();
});

// Adiciona evento para atualizar a lista de subgrupos quando o grupo selecionado mudar
document.getElementById('groupSelect').addEventListener('change', () => {
    updateSubgroupOptions();
});
