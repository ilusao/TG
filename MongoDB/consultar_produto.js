// serve para não bugar os codigos dos produtos.
let codigoProdutoOriginal = null;
let codigoFornecedorOriginal = null; 

let alteracoes = {};
let idProdutoOriginal = null;

// Função para carregar produtos no dropdown
function carregarProdutosDropdown() {
    fetch('/api/produtos')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar produtos');
            }
            return response.json();
        })
        .then(produtos => {
            const dropdown = document.getElementById('materiaisSelect');
            dropdown.innerHTML = '';

            if (produtos.length === 0) {
                alert('Nenhum produto disponível');
                return;
            }

            const opcaoPadrao = document.createElement('option');
            opcaoPadrao.text = 'Selecione um produto';
            opcaoPadrao.value = '';
            dropdown.add(opcaoPadrao);

            produtos.forEach(produto => {
                const option = document.createElement('option');
                option.text = produto.nome;
                option.value = produto._id;
                dropdown.add(option);
            });

            dropdown.addEventListener('change', function () {
                const idSelecionado = this.value;

                desabilitarCampos();

                if (idSelecionado) {
                    fetch(`/api/produto/${idSelecionado}`)
                        .then(response => {
                            if (!response.ok) throw new Error('Erro ao buscar detalhes do produto');
                            return response.json();
                        })
                        .then(produto => {
                            preencherCamposProduto(produto);
                        })
                        .catch(error => console.error('Erro ao carregar os detalhes do produto:', error));
                }
            });
        })
        .catch(error => {
            console.error('Erro ao carregar produtos:', error);
            alert('Erro ao carregar produtos. Tente novamente mais tarde.');
        });
}

function preencherCamposProduto(produto) {
    idProdutoOriginal = produto._id;

    document.getElementById('nome').value = produto.nome;
    document.getElementById('descricao').value = produto.descricao_pdv;
    document.getElementById('subgrupo').value = produto.sub_grupo;
    document.getElementById('almoxerifado').value = produto.almoxerifado;
    document.getElementById('grupo').value = produto.grupo;
    document.getElementById('fornecedor').value = produto.fornecedor;
    document.getElementById('marca').value = produto.marca;
    document.getElementById('codigo').value = produto.codigo_produto;
    document.getElementById('preco').value = produto.preco;

    const fotoProduto = produto.fotoProduto || '/midia/Originalproduto.png'; 
    console.log(`Tentando carregar a imagem do produto: ${fotoProduto}`);

    document.getElementById('produtoImagem').src = fotoProduto;

    const imagem = document.getElementById('produtoImagem');
    imagem.onerror = function() {
        console.log(`Erro ao carregar a imagem ${fotoProduto}. Carregando a imagem padrão.`);
        imagem.src = '/midia/Originalproduto.png';
    };

    const colaboradorElement = document.getElementById('colaboradorCadastrador');

    // Verifica o cargo do funcionário no localStorage
    const cargoFuncionario = localStorage.getItem('cargo');

    // Se o cargo for "Gerente", exibe o nome e ID do colaborador
    if (cargoFuncionario === 'Gerente') {
        if (produto.idFuncionario) {
            if (produto.idFuncionario.nome) {
                colaboradorElement.innerHTML = `<strong>Colaborador:</strong> ${produto.idFuncionario.nome} (ID: ${produto.idFuncionario._id})`;
            } else {
                colaboradorElement.innerHTML = '<strong>Colaborador:</strong> Nome não encontrado';
            }
        } else {
            colaboradorElement.innerHTML = '<strong>Colaborador:</strong> Não informado';
        }
    } else {
        // Caso o cargo não seja "Gerente", não exibe o colaborador
        colaboradorElement.innerHTML = '';
    }
}


// Função para habilitar edição
function habilitarEdicao() {
    const dropdown = document.getElementById('materiaisSelect');
    const produtoSelecionado = dropdown.value;

    if (!produtoSelecionado) {
        alert('Selecione um produto antes de editar.');
        return;
    }

    const inputs = document.querySelectorAll('#productForm input, #productForm select');
    inputs.forEach(input => {
        if (input.id !== 'materiaisSelect') {
            input.removeAttribute('disabled');
            input.addEventListener('input', monitorarAlteracoes);
        }
    });

    // Armazenar o código do fornecedor original para comparações
    codigoProdutoOriginal = document.getElementById('codigo').value;
    codigoFornecedorOriginal = document.getElementById('fornecedor').value; 

    document.getElementById('nome').focus();
}

// Monitorar alterações nos inputs para habilitar o botão Salvar
function monitorarAlteracoes(event) {
    const input = event.target;
    const campo = input.id;
    const valorAtual = input.value;

    alteracoes[campo] = valorAtual;
    document.getElementById('salvarBtn').removeAttribute('disabled');
}


// Função para desabilitar os campos
function desabilitarCampos() {
    const inputs = document.querySelectorAll('#productForm input, #productForm select');
    inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });
}

// Cria um elemento de alerta para mostrar a mensagem de sucesso
function mostrarMensagemSucesso(mensagem) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.textContent = mensagem;

    document.body.appendChild(alertDiv);

    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// Função para validar o código do produto
function validarCodigoProduto(codigoProdutoAtual) {
    if (codigoProdutoAtual !== codigoProdutoOriginal) {
        const confirmacaoProduto = confirm('Tem certeza que deseja alterar o código do produto?');
        if (!confirmacaoProduto) {
            document.getElementById('codigo').value = codigoProdutoOriginal;
            return false;
        }
        return fetch('/api/buscarProdutos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo_produto: codigoProdutoAtual })
        })
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                alert('Este código já está em uso por outro produto.');
                document.getElementById('codigo').value = codigoProdutoOriginal;
                return false;
            }
            return true;
        });
    }
    return true;
}

// Função para validar o código do fornecedor
function validarCodigoFornecedor(codigoFornecedorAtual) {
    if (codigoFornecedorAtual !== codigoFornecedorOriginal) {
        const confirmacaoFornecedor = confirm('Tem certeza que deseja alterar o código do fornecedor?');

        if (!confirmacaoFornecedor) {
            document.getElementById('fornecedor').value = alteracoes['fornecedor'] || '';
            return false;
        }

        return fetch('/api/buscarFornecedores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ codigo_fornecedor: codigoFornecedorAtual })
        })
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                alert('Nenhum fornecedor encontrado com esse código. Por favor, cadastre o fornecedor primeiro.');
                document.getElementById('fornecedor').value = '';
                return false;
            }
            return true;
        });
    }
    return true;
}

// Função para validar o formulário, incluindo o código do produto e fornecedor
async function validarFormulario() {
    const nome = document.getElementById('nome').value;
    const codigoAtual = document.getElementById('codigo').value;
    const preco = document.getElementById('preco').value;
    const fornecedorCodigo = document.getElementById('fornecedor').value;

    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return false;
    }

    if (!codigoAtual) {
        alert('O campo Código do Produto é obrigatório.');
        return false;
    }

    if (!preco || isNaN(preco)) {
        alert('O campo Preço deve ser numérico.');
        return false;
    }

    // Validar código do produto
    const produtoValido = await validarCodigoProduto(codigoAtual);
    if (!produtoValido) return false;

    // Validar código do fornecedor
    const fornecedorValido = await validarCodigoFornecedor(fornecedorCodigo);
    if (!fornecedorValido) return false;

    // Se tudo estiver ok, enviar o formulário
    enviarFormulario();
}

function enviarFormulario() {
    const dadosProduto = {
        nome: document.getElementById('nome').value,
        descricao_pdv: document.getElementById('descricao').value,
        sub_grupo: document.getElementById('subgrupo').value,
        almoxerifado: document.getElementById('almoxerifado').value,
        grupo: document.getElementById('grupo').value,
        fornecedor: document.getElementById('fornecedor').value,
        marca: document.getElementById('marca').value,
        codigo_produto: document.getElementById('codigo').value,
        preco: document.getElementById('preco').value,
    };

    fetch(`/api/produto/${idProdutoOriginal}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosProduto),
    })
    .then(response => {
        if (response.ok) {
            alert('Produto atualizado com sucesso!');
            codigoProdutoOriginal = dadosProduto.codigo_produto;
            mostrarMensagemSucesso('Produto salvo com sucesso!');
        } else {
            alert('Erro ao atualizar o produto. Tente novamente.');
        }
    })
    .catch(error => {
        console.error('Erro ao salvar o produto:', error);
        alert('Erro ao salvar o produto. Tente novamente.');
    });
}

// Função para habilitar a busca (primeiro clique no botão "Buscar")
let buscaAtivada = false;

function habilitarBusca() {
    if (!buscaAtivada) {
        document.getElementById('nome').removeAttribute('disabled');
        document.getElementById('grupo').removeAttribute('disabled');
        document.getElementById('marca').removeAttribute('disabled');
        document.getElementById('codigo').removeAttribute('disabled');
        document.getElementById('fornecedor').removeAttribute('disabled');
        buscaAtivada = true;
    } else {
        buscarProdutosNoMongo();
    }
}

function buscarProdutosNoMongo() {
    const nome = document.getElementById('nome').value;
    const grupo = document.getElementById('grupo').value;
    const marca = document.getElementById('marca').value;
    const codigo = document.getElementById('codigo').value;
    const fornecedor = document.getElementById('fornecedor').value;

    const filtro = {
        ...(nome && { nome }),
        ...(grupo && { grupo }),
        ...(marca && { marca }),
        ...(codigo && { codigo_produto: codigo }),
        ...(fornecedor && { fornecedor })
    };

    if (Object.keys(filtro).length === 0) {
        alert('Preencha pelo menos um campo para buscar o produto.');
        return;
    }

    const loadingIndicator = document.getElementById('loading');
    loadingIndicator.style.display = 'block'; 

    fetch('/api/buscarProdutos', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filtro)
    })
    .then(response => response.json())
    .then(produtos => {
        loadingIndicator.style.display = 'none';
        if (produtos.length > 0) {
            preencherResultadosProdutos(produtos);
        } else {
            alert('Nenhum produto encontrado com os critérios de busca.');
        }
    })
    .catch(error => {
        loadingIndicator.style.display = 'none';
        console.error('Erro ao buscar produtos no MongoDB:', error);
    });
}

// Função para exibir os produtos encontrados no painel "Selecione um Produto"
function preencherResultadosProdutos(produtos) {
    const container = document.getElementById('produtosEncontrados');
    container.innerHTML = '';

    const titulo = document.createElement('h5');
    titulo.textContent = 'Produtos encontrados 👇';
    container.appendChild(titulo);

    const lista = document.createElement('ul');
    lista.classList.add('list-group');

    produtos.forEach(produto => {
        const item = document.createElement('li');
        item.classList.add('list-group-item');
        item.textContent = `${produto.codigo_produto} - ${produto.nome}`;
        item.addEventListener('click', () => preencherCamposProduto(produto));
        lista.appendChild(item);
    });

    container.appendChild(lista);
}

async function mudarFoto() {
    if (!idProdutoOriginal) {
        alert('Você não escolheu nenhum produto');
        return;
    }

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.style.display = 'none';

    inputFile.addEventListener('change', async function() {
        const file = inputFile.files[0];

        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('foto', file);

        try {
            const response = await fetch(`/foto/produto/${idProdutoOriginal}/mudar-foto`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();

            if (data.success) {
                document.getElementById('produtoImagem').src = data.novaFotoUrl;
                alert('Foto do produto alterada com sucesso!');
            } else {
                alert('Erro ao alterar a foto do produto. Tente novamente.');
            }
        } catch (error) {
            alert('Ocorreu um erro ao tentar enviar a nova foto.');
            console.error('Erro:', error); // Registra o erro para depuração
        }
    });

    inputFile.click();
}



// Botão Limpar Campos
function limparCampos() {
    const form = document.getElementById("productForm");
    if (form) {
        form.reset();
        desabilitarCampos();
        document.getElementById('produtoImagem').src = '/midia/Originalproduto.png';
        document.getElementById('produtosEncontrados').innerHTML = '';
        document.getElementById('colaboradorCadastrador').innerHTML = '';
    }
    carregarProdutosDropdown();
    buscaAtivada = false;
}


// Função para desabilitar todos os campos
function desabilitarCampos() {
    const inputs = document.querySelectorAll('#productForm input, #productForm select');
    inputs.forEach(input => {
        input.setAttribute('disabled', 'disabled');
    });
}

// Carregar produtos no dropdown ao iniciar
carregarProdutosDropdown();
