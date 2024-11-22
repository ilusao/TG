document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#supplierForm');

    if (!form) {
        console.error('Formulário não encontrado');
        return; 
    }

    // Função para formatar o CNPJ enquanto o usuário digita
    function formatarCNPJ(cnpj) {
        return cnpj
            .replace(/\D/g, '')
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2') 
            .replace(/(-\d{2})\d+?$/, '$1');
    }

    // Função para validar o CNPJ
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/\D/g, '');
        if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
            return false;
        }

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) {
            return false; 
        }

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) {
            return false; 
        }

        return true;
    }

    // Seleciona o campo CNPJ e o botão de envio
    const cnpjInput = document.getElementById('cnpj');
    const cnpjFeedback = cnpjInput.closest('.col-md-6').querySelector('.invalid-feedback');

    if (!cnpjInput) {
        console.error('Campo de CNPJ não encontrado.');
        return;
    }

    // Evento para formatar o CNPJ enquanto o usuário digita
    cnpjInput.addEventListener('input', function () {
        let cnpjValue = this.value;
        this.value = formatarCNPJ(cnpjValue);
    });

    // Validação do formulário ao submeter
    form.addEventListener('submit', (event) => {
        event.preventDefault(); 

        const cnpjValido = validarCNPJ(cnpjInput.value);
        if (!cnpjValido) {
            cnpjInput.classList.add('is-invalid'); 
            cnpjFeedback.style.display = 'block';
            cnpjInput.focus();
            return;
        }

        cnpjInput.classList.remove('is-invalid');
        cnpjFeedback.style.display = 'none';

        const funcionarioId = localStorage.getItem('funcionarioId');
        if (!funcionarioId) {
            alert('Erro: ID do funcionário não encontrado. Faça login novamente.');
            console.error('Erro: ID do funcionário não encontrado');
            return;
        }

        // Validação e ajuste de dados antes de enviar ao backend
        const codigoFornecedor = document.getElementById('codigo_fornecedor').value.trim();
        if (!codigoFornecedor) {
            // Se desejar atribuir um valor padrão ou algum valor genérico:
            // codigoFornecedor = "valor-padrão";
        }

        // Montar os dados para envio
        const data = {
            nome: document.getElementById('nome').value,
            descricao: document.getElementById('descricao').value || null,
            email: document.getElementById('email').value,
            observacoes: document.getElementById('observacoes').value || '',
            pais: document.getElementById('pais').value,
            cidade: document.getElementById('cidade').value,
            estado: document.getElementById('estado').value,
            cep: document.getElementById('cep').value,
            numero: document.getElementById('numero').value,
            site: document.getElementById('site').value || null,
            cnpj: cnpjInput.value.replace(/\D/g, ''), // Formatação do CNPJ
            codigo_fornecedor: codigoFornecedor, // Garantindo que o campo não seja undefined
            inativo: document.getElementById('inativo').value === 'true',
            idFuncionario: funcionarioId
        };

        // Envio da requisição
        fetch('/fornecedores', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição: ' + response.statusText);
            }
            return response.json();
        })
        .then(result => alert('Fornecedor cadastrado com sucesso!'))
        .catch(error => {
            console.error('Erro ao cadastrar fornecedor:', error);
            alert('Erro ao cadastrar fornecedor: ' + error.message);
        });
    });
});