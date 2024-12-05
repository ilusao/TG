let idFornecedorOriginal = null;
// Função para carregar fornecedores no dropdown
function carregarFornecedoresDropdown() {
    console.log("Carregando fornecedores...");

    fetch('/fornecedores')
        .then(response => {
            if (!response.ok) {
                console.error('Erro ao buscar fornecedores, status:', response.status);
                throw new Error('Erro ao buscar fornecedores');
            }
            return response.json();
        })
        .then(fornecedores => {
            console.log('Fornecedores encontrados:', fornecedores);

            const dropdown = document.getElementById('fornecedor-select');
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

            dropdown.addEventListener('change', function () {
                const idSelecionado = this.value;
                console.log('Fornecedor selecionado, ID:', idSelecionado);

                desabilitarCampos();

                if (idSelecionado) {
                    fetch(`/fornecedores/${idSelecionado}`)
                        .then(response => {
                            if (!response.ok) {
                                console.error('Erro ao buscar detalhes do fornecedor, status:', response.status);
                                throw new Error('Erro ao buscar detalhes do fornecedor');
                            }
                            return response.json();
                        })
                        .then(fornecedor => {
                            console.log('Detalhes do fornecedor:', fornecedor);
                            preencherCamposFornecedor(fornecedor);
                            fetch('/api/FornecedorProduto', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    codigo_fornecedor: fornecedor.codigo_fornecedor
                                })
                            })
                                .then(response => {
                                    if (!response.ok) {
                                        console.error('Erro ao buscar produtos, status:', response.status);
                                        throw new Error('Erro ao buscar produtos');
                                    }
                                    return response.json();
                                })
                                .then(produtos => {
                                    console.log('Produtos encontrados:', produtos);
                                    const campoProdutos = document.getElementById('produtos');
                                    if (produtos.length > 0) {
                                        const produtosIds = produtos.map(produto => produto._id);
                                        campoProdutos.value = produtos.map(produto => produto.nome).join(', ');

                                        window.produtosIds = produtosIds;
                                    } else {
                                        campoProdutos.value = 'Nenhum produto encontrado';
                                        window.produtosIds = [];
                                    }
                                })
                                .catch(error => console.error('Erro ao buscar produtos:', error));
                        })
                        .catch(error => console.error('Erro ao carregar os detalhes do fornecedor:', error));

                    const mudarFotoBtn = document.getElementById('mudarFotoBtn');
                    mudarFotoBtn.disabled = true;
                } else {
                    idFornecedorOriginal = null;
                    desabilitarSalvar();
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar fornecedores:', error);
            alert('Erro ao carregar fornecedores. Tente novamente mais tarde.');
        });
}



// data sem horario
function formatarData(data) {
    if (!data) return 'erro data não encontrada';

    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
}
function preencherCamposFornecedor(fornecedor) {
    idFornecedorOriginal = fornecedor._id;

    document.getElementById('codigo_fornecedor').value = fornecedor.codigo_fornecedor;
    document.getElementById('nome').value = fornecedor.nome;
    document.getElementById('cnpj').value = fornecedor.cnpj;
    document.getElementById('email').value = fornecedor.email;
    document.getElementById('telefone').value = fornecedor.telefone || 'não foi cadastrado o telefone';
    document.getElementById('site').value = fornecedor.site || '';
    document.getElementById('pais').value = fornecedor.pais || '';
    document.getElementById('estado').value = fornecedor.estado || '';
    document.getElementById('cidade').value = fornecedor.cidade || '';
    document.getElementById('cep').value = fornecedor.cep || '';
    document.getElementById('numero').value = fornecedor.numero || '';
    document.getElementById('descricao').value = fornecedor.descricao || 'sem descrição';
    document.getElementById('produtos').value = fornecedor.produtos?.join(', ') || 'Sem produtos';
    document.getElementById('dataCadastro').value = formatarData(new Date(fornecedor.dataCadastro));
    document.getElementById('inativo').value = fornecedor.inativo ? 'true' : 'false';

    const colaboradorElement = document.getElementById('colaboradorCadastrador');
    const cargoFuncionario = localStorage.getItem('cargo');

    if (cargoFuncionario === 'Gerente') {
        if (fornecedor.idFuncionario) {
            if (fornecedor.idFuncionario.nome) {
                colaboradorElement.innerHTML = `<strong>Colaborador:</strong> ${fornecedor.idFuncionario.nome} (ID: ${fornecedor.idFuncionario._id})`;
            } else {
                colaboradorElement.innerHTML = '<strong>Colaborador:</strong> Nome não encontrado';
            }
        } else {
            colaboradorElement.innerHTML = '<strong>Colaborador:</strong> Não informado';
        }
    } else {
        colaboradorElement.innerHTML = '';
    }

    const fotoFornecedor = fornecedor.fotoFornecedor || '/midia/FornecedorOriginal.png'; 

    const fornecedorImagem = document.getElementById('fornecedorImagem');

    fornecedorImagem.src = fotoFornecedor;

    fornecedorImagem.onerror = function() {
        fornecedorImagem.src = '/midia/FornecedorOriginal.png';
    };
}


// Função para desabilitar os campos
function desabilitarCampos() {
    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select');
    inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });
}
// botão editar
function habilitarEdicao() {
    if (!idFornecedorOriginal) {
        alert('Nenhum fornecedor selecionado. Selecione um fornecedor primeiro.');
        return;
    }

    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select');
    
    inputs.forEach(input => {
        if (input.id !== 'dataCadastro') { 
            input.setAttribute('data-original', input.value);
            input.removeAttribute('disabled');
            input.addEventListener('input', monitorarAlteracoes);
        }
    });
    desabilitarSalvar(); 
}

// Função para habilitar o botão "Salvar"
function habilitarSalvar() {
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.removeAttribute('disabled');
}

// Função para desabilitar o botão "Salvar"
function desabilitarSalvar() {
    const btnSalvar = document.getElementById('btnSalvar');
    btnSalvar.setAttribute('disabled', 'disabled');
}

// Função para monitorar alterações nos campos do formulário
function monitorarAlteracoes() {
    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select');
    
    let algumaAlteracao = false;

    inputs.forEach(input => {
        if (input.value !== input.getAttribute('data-original')) {
            algumaAlteracao = true;
        }
    });
    if (algumaAlteracao) {
        habilitarSalvar();
    } else {
        desabilitarSalvar();
    }
}

// botão limpar: limpa os inputs, desativa campos, limpa lista de fornecedores, e reseta o botão de buscar
function limparCampos() {
    // Limpa todos os campos de entrada do formulário
    const inputs = document.querySelectorAll('#fornecedorForm input, #fornecedorForm select, #fornecedorForm textarea');
    inputs.forEach(input => {
        if (input.tagName === 'SELECT' && input.id === 'fornecedor-select') {
            input.value = ''; // Limpa o dropdown de fornecedores
        } else {
            input.value = ''; // Limpa os outros campos
        }
        input.setAttribute('disabled', 'disabled'); // Desabilita todos os campos
    });

    // Limpa a variável de ID do fornecedor original
    idFornecedorOriginal = null;

    // Limpa os elementos de fornecedor na página
    document.getElementById('Buscarfornecedor').innerHTML = '';
    document.getElementById('colaboradorCadastrador').innerHTML = '';

    carregarFornecedoresDropdown();

    const fornecedorImagem = document.getElementById('fornecedorImagem');
    fornecedorImagem.src = '/Midia/FornecedorOriginal.png';

    const mudarFotoBtn = document.getElementById('mudarFotoBtn');
    mudarFotoBtn.disabled = true;

    desabilitarSalvar();

    buscaAtivada = false;

    const buscaBtn = document.getElementById('buscarBtn');
    buscaBtn.innerHTML = 'Buscar';
    buscaBtn.disabled = false;
}

let buscaAtivada = false;

function habilitarBusca() {
    if (!buscaAtivada) {
        habilitarCamposBusca();
        return;
    }

    const codigoFornecedor = document.getElementById('codigo_fornecedor').value.trim();
    const nomeFornecedor = document.getElementById('nome').value.trim();
    const cnpjFornecedor = document.getElementById('cnpj').value.trim();
    const emailFornecedor = document.getElementById('email').value.trim();
    const telefoneFornecedor = document.getElementById('telefone').value.trim();
    const siteFornecedor = document.getElementById('site').value.trim();
    const paisFornecedor = document.getElementById('pais').value.trim();
    const estadoFornecedor = document.getElementById('estado').value.trim();
    const cidadeFornecedor = document.getElementById('cidade').value.trim();
    const cepFornecedor = document.getElementById('cep').value.trim();

    const filtro = {};
    if (codigoFornecedor) filtro.codigo_fornecedor = codigoFornecedor;
    if (nomeFornecedor) filtro.nome = nomeFornecedor;
    if (cnpjFornecedor) filtro.cnpj = cnpjFornecedor;
    if (emailFornecedor) filtro.email = emailFornecedor;
    if (telefoneFornecedor) filtro.telefone = telefoneFornecedor;
    if (siteFornecedor) filtro.site = siteFornecedor;
    if (paisFornecedor) filtro.pais = paisFornecedor;
    if (estadoFornecedor) filtro.estado = estadoFornecedor;
    if (cidadeFornecedor) filtro.cidade = cidadeFornecedor;
    if (cepFornecedor) filtro.cep = cepFornecedor;

    if (Object.keys(filtro).length === 0) {
        alert('Por favor, preencha pelo menos um campo para buscar.');
        return;
    }

    buscarFornecedores(filtro);
}

function habilitarCamposBusca() {
    document.getElementById('codigo_fornecedor').removeAttribute('disabled');
    document.getElementById('nome').removeAttribute('disabled');
    document.getElementById('cnpj').removeAttribute('disabled');
    document.getElementById('email').removeAttribute('disabled');
    document.getElementById('telefone').removeAttribute('disabled');
    document.getElementById('site').removeAttribute('disabled');
    document.getElementById('pais').removeAttribute('disabled');
    document.getElementById('estado').removeAttribute('disabled');
    document.getElementById('cidade').removeAttribute('disabled');
    document.getElementById('cep').removeAttribute('disabled');

    buscaAtivada = true;
}

function buscarFornecedores(filtro) {
    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'block';

    fetch('/api/buscarFornecedores', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filtro)
    })
    .then(response => response.json())
    .then(fornecedores => {
        loadingIndicator.style.display = 'none';

        if (fornecedores.length > 0) {
            preencherResultadosFornecedores(fornecedores);
            const mudarFotoBtn = document.getElementById('mudarFotoBtn');
            mudarFotoBtn.disabled = false;
        } else {
            alert('Nenhum fornecedor encontrado com os critérios fornecidos.');
        }
    })
    .catch(error => {
        loadingIndicator.style.display = 'none';
        console.error('Erro ao buscar fornecedores:', error);
    });
}

// Função para validar o formulário antes de salvar
function validarFormulario() {
    const cnpjInput = document.getElementById('cnpj');
    const codigoFornecedorInput = document.getElementById('codigo_fornecedor');
    const cnpjOriginal = cnpjInput.getAttribute('data-original');
    const codigoFornecedorOriginal = codigoFornecedorInput.getAttribute('data-original');

    let alterouCnpj = false;
    let alterouCodigo = false;

    if (cnpjInput.value !== cnpjOriginal) {
        alterouCnpj = true;
    }

    if (codigoFornecedorInput.value !== codigoFornecedorOriginal) {
        alterouCodigo = true;
    }

    if (alterouCnpj) {
        const confirmCnpjChange = confirm('Tem certeza que deseja alterar o CNPJ do fornecedor?');
        
        if (!confirmCnpjChange) {
            return;  
        }

        if (!validarCNPJ(cnpjInput.value)) {
            alert('O CNPJ informado não é válido. Verifique e tente novamente.');
            return;
        }
    }
    if (alterouCodigo) {
        const confirmCodigoChange = confirm('Tem certeza que deseja alterar o Código do Fornecedor?');
        
        if (!confirmCodigoChange) {
            return;
        }
    }

    salvarAlteracoes();
}


// Função para enviar os dados do produto ao backend e gerar consigo uma lista
function Excell() {
    fetch('http://localhost:5000/Cfornecedor/gerar-list-excel', { 
        method: 'POST',
    })
    .then(response => {
        if (response.ok) {
            return response.blob();
        }
        throw new Error('Falha ao gerar Excel');
    })
    .then(blob => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'fornecedores_list.xlsx';
        link.click();
    })
    .catch(error => {
        console.error('Erro:', error);
    });
}

// Função para validar CNPJ (Regra simples de validação de CNPJ)
function validarCNPJ(cnpj) {
    cnpj = cnpj.replace(/[^\d]+/g, '');

    if (cnpj.length !== 14) {
        return false;
    }

    let soma = 0;
    let pos = 5;

    for (let i = 0; i < 12; i++) {
        soma += cnpj[i] * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    let resultado = soma % 11;
    if (resultado < 2) {
        resultado = 0;
    } else {
        resultado = 11 - resultado;
    }

    if (resultado !== parseInt(cnpj[12])) {
        return false;
    }

    soma = 0;
    pos = 6;
    for (let i = 0; i < 13; i++) {
        soma += cnpj[i] * pos--;
        if (pos < 2) {
            pos = 9;
        }
    }

    resultado = soma % 11;
    if (resultado < 2) {
        resultado = 0;
    } else {
        resultado = 11 - resultado;
    }

    if (resultado !== parseInt(cnpj[13])) {
        return false;
    }

    return true;
}

// Função para salvar as alterações no fornecedor
function salvarAlteracoes() {
    if (!idFornecedorOriginal) {
        alert('Nenhum fornecedor selecionado. Por favor, selecione um fornecedor antes de salvar.');
        return;
    }

    const fornecedorForm = document.getElementById('fornecedorForm');
    const formData = new FormData(fornecedorForm);
    const dadosAlterados = {};

    formData.forEach((value, key) => {
        if (key !== 'foto') { 
            dadosAlterados[key] = value;
        }
    });

    dadosAlterados.produtos = window.produtosIds || [];
    const payload = JSON.stringify(dadosAlterados);

    fetch(`/fornecedores/${idFornecedorOriginal}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: payload,
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar as alterações');
            }
            return response.json();
        })
        .then(data => {
            alert('Fornecedor atualizado com sucesso!');
            document.getElementById('fornecedorImagem').src = data.novaFotoUrl || '/Midia/FornecedorOriginal.png';
            desabilitarCampos();
        })
        .catch(error => {
            console.error('Erro ao salvar alterações:', error);
            alert('Erro ao salvar as alterações. Tente novamente mais tarde.');
        });
}



function preencherResultadosFornecedores(fornecedores) {
    const container = document.getElementById('Buscarfornecedor');
    container.innerHTML = '';

    const titulo = document.createElement('h5');
    titulo.textContent = 'Fornecedores encontrados 👇';
    container.appendChild(titulo);
    const lista = document.createElement('ul');
    lista.classList.add('list-group');

    fornecedores.forEach(fornecedor => {
        document.getElementById('fotoFornecedorInput').disabled = false;
        const item = document.createElement('li');
        item.classList.add('list-group-item');
        item.textContent = `${fornecedor.nome} - CNPJ: ${fornecedor.cnpj}`;
        item.addEventListener('click', () => {
            fetch(`/fornecedores/${fornecedor._id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erro ao buscar detalhes do fornecedor');
                    }
                    return response.json();
                })
                .then(detalhesFornecedor => {
                    preencherCamposFornecedor(detalhesFornecedor);
                })
                .catch(error => {
                    console.error('Erro ao carregar os detalhes do fornecedor:', error);
                    alert('Erro ao carregar os detalhes do fornecedor. Tente novamente mais tarde.');
                });
        });

        lista.appendChild(item);
    });
    container.appendChild(lista);
}

function exibirImagemSelecionada(event) {
    const fotoInput = event.target;
    const fornecedorImagem = document.getElementById('fornecedorImagem');

    if (!idFornecedorOriginal) {
        alert('Por favor, selecione um fornecedor antes de fazer o upload de uma imagem.');
        fotoInput.value = '';
        return;
    }

    if (fotoInput.files && fotoInput.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            fornecedorImagem.src = e.target.result;
            fornecedorImagem.style.display = 'block';
        };
        reader.readAsDataURL(fotoInput.files[0]);

        const formData = new FormData();
        formData.append('foto', fotoInput.files[0]);

        fetch(`/foto/fornecedor/${idFornecedorOriginal}/mudar-foto`, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao salvar a foto no servidor.');
            }
            return response.json();
        })
        .then(data => {
            fornecedorImagem.src = data.novaFotoUrl || '/Midia/FornecedorOriginal.png';
            alert('Foto atualizada com sucesso!');
        })
        .catch(error => {
            console.error('Erro ao salvar a imagem:', error);
            alert('Erro ao salvar a foto. Tente novamente mais tarde.');
        });
    } else {
        fornecedorImagem.src = '/Midia/FornecedorOriginal.png';
    }

    fotoInput.disabled = true;
}


// Função que será chamada quando o botão "Mudar foto" for clicado
document.getElementById('mudarFotoBtn').addEventListener('click', function () {
    const fotoInput = document.getElementById('fotoFornecedorInput');
    fotoInput.disabled = false;
    fotoInput.click();
});

// Função que é executada quando a página é carregada
window.onload = function () {
    
    document.getElementById('fotoFornecedorInput').disabled = true;
    const mudarFotoBtn = document.getElementById('mudarFotoBtn');

    mudarFotoBtn.disabled = true; // Inicialmente desabilitado
    const fornecedorSelect = document.getElementById('fornecedor-select');
    fornecedorSelect.addEventListener('change', function () {
        if (this.value) {
            mudarFotoBtn.disabled = false;
        } else {
            mudarFotoBtn.disabled = true;
        }
    });
};

carregarFornecedoresDropdown();
