
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

        const validateForm = () => {
            let isValid = true;

            // Lista de todos os campos a serem validados
            const fieldsToValidate = [
                'nome', 'descricao', 'grupo', 'subgrupo',
                'fornecedor', 'marca', 'codigoProduto',
                'localizacao', 'destino', 'almoxerifado', 'preco'
            ];

            // Loop através dos campos e validação individual
            fieldsToValidate.forEach((fieldId) => {
                const field = document.getElementById(fieldId);
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            // Validar os selects
            const inflamavelSelect = document.getElementById('inflamavel');
            const fragilSelect = document.getElementById('fragil');
            if (!validateField(inflamavelSelect) || !validateField(fragilSelect)) {
                isValid = false;
            }

            return isValid;
        };

        document.getElementById('productForm').addEventListener('submit', (event) => {
            if (!validateForm()) {
                event.preventDefault(); // Previne o envio se algum campo não estiver válido
            }
        });

        // Validação do formulário
        (() => {
            'use strict';
            const form = document.querySelector('#productForm');

            form.addEventListener('submit', (event) => {
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                form.classList.add('was-validated');
            });
        })();

        document.addEventListener('DOMContentLoaded', function() {
        // Seleciona o formulário, o botão "Consultar" e todos os campos de input e select dentro do formulário
        const form = document.getElementById('productForm');
        const consultButton = document.getElementById('Consult');
        const inputs = form.querySelectorAll('input, select');

        // Função para verificar se todos os campos obrigatórios estão preenchidos
        function checkForm() {
            let allFilled = true;

            // Verifica cada campo de input e select
            inputs.forEach(function(input) {
                // Se o campo for obrigatório e estiver vazio, a variável allFilled é definida como false
                if (input.hasAttribute('required') && !input.value) {
                    allFilled = false;
                }
            });

            // Ativa o botão "Consultar" se todos os campos obrigatórios estiverem preenchidos
            // Caso contrário, o botão permanece desativado
            consultButton.disabled = !allFilled;
        }

        // Adiciona um event listener para cada campo de input e select
        // Ele será acionado toda vez que o conteúdo de um campo for alterado
        inputs.forEach(function(input) {
            input.addEventListener('input', checkForm); // Para inputs de texto, número, etc.
            input.addEventListener('change', checkForm); // Para selects e inputs de data
        });
    });

    document.addEventListener('DOMContentLoaded', function() {
        const groupSelect = document.getElementById('groupSelect');
        const subgroupSelect = document.getElementById('subgroupSelect');

        // Mapeamento dos sub-grupos para cada grupo
        const subgroups = {
            materias_primas: ['Metais', 'Polímeros', 'Cerâmicas', 'Madeiras', 'Têxteis', 'Químicos'],
            componentes_pecas: ['Mecânicos', 'Elétricos', 'Eletrônicos', 'Hidráulicos'],
            produtos_semiacabados: ['Perfis de Metal', 'Componentes Plásticos', 'Subconjuntos Mecânicos'],
            materiais_manutencao: ['Lubrificantes', 'Produtos de Limpeza', 'Revestimentos e Pinturas', 'Equipamentos de Proteção Individual (EPI)'],
            materiais_auxiliares: ['Ferramentas', 'Embalagens', 'Suprimentos de Escritório']
        };

        // Função para atualizar o subgrupo com base no grupo selecionado
        function updateSubgroups() {
            // Limpa as opções de subgrupo existentes
            subgroupSelect.innerHTML = '';

            // Obtém o grupo selecionado
            const selectedGroup = groupSelect.value;

            // Verifica se há subgrupos para o grupo selecionado
            if (subgroups[selectedGroup]) {
                // Adiciona as novas opções de subgrupo
                subgroups[selectedGroup].forEach(function(subgroup) {
                    const option = document.createElement('option');
                    option.value = subgroup;
                    option.textContent = subgroup;
                    subgroupSelect.appendChild(option);
                });
            }
        }

        // Atualiza os subgrupos ao alterar o grupo selecionado
        groupSelect.addEventListener('change', updateSubgroups);

        // Chama a função inicialmente para popular os subgrupos baseados na primeira opção
        updateSubgroups();
    });