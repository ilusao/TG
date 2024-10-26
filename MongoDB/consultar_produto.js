// serve para não bugar os codigos dos produtos.
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

            dropdown.addEventListener('change', function() {
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

    document.getElementById('nome').value = produto.nome || '';
    document.getElementById('descricao').value = produto.descricao_pdv || '';
    document.getElementById('subgrupo').value = produto.sub_grupo || '';
    document.getElementById('almoxerifado').value = produto.almoxerifado || '';
    document.getElementById('grupo').value = produto.grupo || '';
    document.getElementById('fornecedor').value = produto.fornecedor || '';
    document.getElementById('marca').value = produto.marca || '';
    document.getElementById('codigo').value = produto.codigo_produto || '';
    document.getElementById('preco').value = produto.preco || '';

    if (produto.fotoProduto) {
        document.getElementById('produtoImagem').src = produto.fotoProduto;
    } else {
        document.getElementById('produtoImagem').src = '/Midia/Originalproduto.png'; 
    }
}

// Função para habilitar a edição dos campos
function habilitarEdicao() {
    const inputs = document.querySelectorAll('#productForm input, #productForm select');
    inputs.forEach(input => input.removeAttribute('disabled'));
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

// Função de validação e envio (atualizar ou salvar os dados do produto)
function validarFormulario() {
    const nome = document.getElementById('nome').value;
    const codigo = document.getElementById('codigo').value;
    const preco = document.getElementById('preco').value;

    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return false;
    }

    if (!codigo) {
        alert('O campo Código do Produto é obrigatório.');
        return false;
    }

    if (!preco || isNaN(preco)) {
        alert('O campo Preço deve ser numérico.');
        return false;
    }

    alert('Formulário validado com sucesso! Enviando...');

    const dadosProduto = {
        nome: nome,
        codigo_produto: codigo,
        preco: parseFloat(preco),
        descricao_pdv: document.getElementById('descricao').value,
        sub_grupo: document.getElementById('subgrupo').value,
        almoxerifado: document.getElementById('almoxerifado').value,
        grupo: document.getElementById('grupo').value,
        fornecedor: document.getElementById('fornecedor').value,
        marca: document.getElementById('marca').value,
        gtin: document.getElementById('gtin').value,
        servico: document.getElementById('servico').value,
        tipo: document.getElementById('tipo').value,
        inativo: document.getElementById('inativo').value
    };

    // Atualiza o produto com base no ID armazenado
    if (idProdutoOriginal) {
        fetch(`/api/produto/${idProdutoOriginal}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({...dadosProduto, id: idProdutoOriginal}) 
        })
        .then(response => {
            if (response.ok) {
                mostrarMensagemSucesso('Produto atualizado com sucesso!');
            } else {
                return response.json().then(err => {
                    alert(`Erro ao atualizar o produto: ${err.message || 'Tente novamente.'}`);
                });
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o formulário:', error);
            alert('Ocorreu um erro ao tentar atualizar o produto.');
        });
    } else {
        fetch('/api/produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosProduto)
        })
        .then(response => {
            if (response.ok) {
                mostrarMensagemSucesso('Produto salvo com sucesso!');
            } else {
                alert('Erro ao salvar o produto. Tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar o formulário:', error);
            alert('Ocorreu um erro ao tentar salvar o produto.');
        });
    }
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

// Função para alterar a foto do produto
function mudarFoto() {
    if (!idProdutoOriginal) {
        alert('Você não escolheu nenhum produto');
        return;
    }

    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = 'image/*';
    inputFile.style.display = 'none';

    inputFile.addEventListener('change', function() {
        const file = inputFile.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append('foto', file);

        fetch(`/produto/${idProdutoOriginal}/mudar-foto`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => { 
                    throw new Error(text); 
                });
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                document.getElementById('produtoImagem').src = data.novaFotoUrl;
                alert('Foto do produto alterada com sucesso!');
            } else {
                alert('Erro ao alterar a foto do produto. Tente novamente.');
            }
        })
        .catch(error => {
            console.error('Erro ao enviar a nova foto:', error);
            alert('Ocorreu um erro ao tentar enviar a nova foto.');
        });
    });

    inputFile.click();
}

// Função para limpar os campos
function limparCampos() {
    document.getElementById("productForm").reset();
}

// Carregar produtos no dropdown ao iniciar
carregarProdutosDropdown();
