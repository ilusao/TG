document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#supplierForm');
    const exportButton = document.getElementById('exportarExcel');
    const statusExportarExcel = document.getElementById('statusExportarExcel');

    let exportarParaExcel = false; // Inicializa como 'false'

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

    // Evento para alternar o estado de exportação para Excel
    exportButton.addEventListener('click', function () {
        exportarParaExcel = !exportarParaExcel;
        statusExportarExcel.textContent = exportarParaExcel ? 'Sim' : 'Não';
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

        const codigoFornecedor = document.getElementById('codigo_fornecedor').value.trim();

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
            telefone: document.getElementById('telefone').value,
            site: document.getElementById('site').value || null,
            cnpj: cnpjInput.value.replace(/\D/g, ''),
            codigo_fornecedor: codigoFornecedor,
            inativo: document.getElementById('inativo').value === 'true',
            idFuncionario: funcionarioId,
            exportarParaExcel
        };

        console.log(data); 

        fetch('/api/fornecedor', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            alert('Fornecedor cadastrado com sucesso!');
        
            if (exportarParaExcel) {
                fetch('/fornecedores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data) 
                    
                })
                .then(response => response.blob())
                .then(blob => {
                    console.log("Dados enviados ao Flask:", {
                        ...req.body,
                        _id: req.body._id,
                        cnpj,
                        idFuncionario
                    });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'fornecedor.xlsx';
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                })
                .catch(error => {
                    console.error('Erro ao gerar Excel:', error);
                    alert('Erro ao gerar Excel: ' + error.message);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao cadastrar fornecedor:', error);
            alert('Erro ao cadastrar fornecedor: ' + error.message);
        });
    });
});
