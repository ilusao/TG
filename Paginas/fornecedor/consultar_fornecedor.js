let idFornecedorOriginal = null;

// Função para carregar fornecedores no dropdown
function carregarFornecedoresDropdown() {
    fetch('/api/fornecedores')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar fornecedores');
            }
            return response.json();
        })
        .then(fornecedores => {
            const dropdown = document.getElementById('fornecedoresSelect');
            dropdown.innerHTML = '';

            if (fornecedores.length === 0) {
                alert('Nenhum fornecedor disponível');
                return;
            }

            const opcaoPadrao = document.createElement('option');
            opcaoPadrao.text = 'Selecione um fornecedor';
            opcaoPadrao.value = '';
            dropdown.add(opcaoPadrao);

            fornecedores.forEach(fornecedor => {
                const option = document.createElement('option');
                option.text = fornecedor.nome;
                option.value = fornecedor._id;
                dropdown.add(option);
            });

            dropdown.addEventListener('change', function() {
                const idSelecionado = this.value;

                desabilitarCampos();

                if (idSelecionado) {
                    fetch(`/api/fornecedor/${idSelecionado}`)
                        .then(response => {
                            if (!response.ok) throw new Error('Erro ao buscar detalhes do fornecedor');
                            return response.json();
                        })
                        .then(fornecedor => {
                            preencherCamposFornecedor(fornecedor);
                        })
                        .catch(error => console.error('Erro ao carregar os detalhes do fornecedor:', error));
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar fornecedores:', error);
            alert('Erro ao carregar fornecedores. Tente novamente mais tarde.');
        });
}

function preencherCamposFornecedor(fornecedor) {
    idFornecedorOriginal = fornecedor._id;

    document.getElementById('nome').value = fornecedor.nome || '';
    document.getElementById('email').value = fornecedor.email || '';
    document.getElementById('descricao').value = fornecedor.descricao || '';
    document.getElementById('pais').value = fornecedor.pais || '';
    document.getElementById('cidade').value = fornecedor.cidade || '';
    document.getElementById('estado').value = fornecedor.estado || '';
    document.getElementById('site').value = fornecedor.site || '';
    document.getElementById('cnpj').value = fornecedor.cnpj || '';
    document.getElementById('inativo').checked = fornecedor.inativo || false;
}

// Função para habilitar a edição dos campos
function habilitarEdicao() {
    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select');
    inputs.forEach(input => input.removeAttribute('disabled'));
}

// Função para desabilitar os campos
function desabilitarCampos() {
    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select');
    inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });
}

// Função para validar e enviar (atualizar ou salvar os dados do fornecedor)
function validarFormulario() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;

    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return false;
    }

    if (!email) {
        alert('O campo Email é obrigatório.');
        return false;
    }

    alert('Formulário validado com sucesso! Enviando...');

    const dadosFornecedor = {
        nome: nome,
        email: email,
        descricao: document.getElementById('descricao').value,
        pais: document.getElementById('pais').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value,
        site: document.getElementById('site').value,
        cnpj: document.getElementById('cnpj').value,
        inativo: document.getElementById('inativo').checked
    };

    // Atualiza o fornecedor com base no ID armazenado
    if (idFornecedorOriginal) {
        fetch(`/api/fornecedor/${idFornecedorOriginal}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...dadosFornecedor, id: idFornecedorOriginal})
        })
        .then(response => {
            if (response.ok) {
                mostrarMensagemSucesso('Fornecedor atualizado com sucesso!');
            } else {
                return response.json().then(err => {
                    alert(`Erro ao atualizar o fornecedor: ${err.message || 'Tente novamente.'}`);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o formulário:', error);
            alert('Ocorreu um erro ao tentar atualizar o fornecedor.');
        });
    } else {
        fetch('/api/fornecedor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosFornecedor)
        })
        .then(response => {
            if (response.ok) {
                mostrarMensagemSucesso('Fornecedor salvo com sucesso!');
            } else {
                alert('Erro ao salvar o fornecedor. Tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o formulário:', error);
            alert('Ocorreu um erro ao tentar salvar o fornecedor.');
        });
    }
}

// Função para limpar os campos
function limparCampos() {
    document.getElementById("fornecedorForm").reset();
}

// Carregar fornecedores no dropdown ao iniciar
carregarFornecedoresDropdown();
