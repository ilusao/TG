// Função para carregar produtos no dropdown
async function carregarProdutosDropdown() {
    try {
        const response = await fetch('/api/produtos');

        if (!response.ok) {
            throw new Error('Erro ao buscar produtos');
        }

        const produtos = await response.json();
        const dropdown = document.getElementById('materiaisSelect');
        dropdown.innerHTML = '';

        if (produtos.length === 0) {
            alert('Nenhum produto disponível');
            return;
        }

        const opcaoPadrao = new Option('Selecione um produto', '');
        dropdown.add(opcaoPadrao);

        produtos.forEach(produto => {
            const option = new Option(produto.nome, produto.codigo_produto);
            dropdown.add(option);
        });

        dropdown.addEventListener('change', async function () {
            const codigoSelecionado = this.value;
            desabilitarCampos();

            if (codigoSelecionado) {
                try {
                    const produtoResponse = await fetch(`/api/produto/${codigoSelecionado}`);
                    if (!produtoResponse.ok) {
                        throw new Error('Produto não encontrado');
                    }
                    const produto = await produtoResponse.json();
                    preencherCamposProduto(produto);
                    atualizarImagemProduto(produto.fotoProduto); // Atualiza a imagem do produto
                    localStorage.setItem('codigo_produto', produto.codigo_produto); // Armazena o codigo_produto
                } catch (error) {
                    console.error('Erro ao carregar os detalhes do produto:', error);
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        alert('Erro ao carregar produtos. Tente novamente mais tarde.');
    }
}

function preencherCamposProduto(produto) {
    document.getElementById('nome').value = produto.nome || '';
    document.getElementById('descricao').value = produto.descricao_pdv || '';
    document.getElementById('subgrupo').value = produto.sub_grupo || '';
    document.getElementById('almoxerifado').value = produto.almoxerifado || '';
    document.getElementById('grupo').value = produto.grupo || '';
    document.getElementById('fornecedor').value = produto.fornecedor || '';
    document.getElementById('marca').value = produto.marca || '';
    document.getElementById('codigo').value = produto.codigo_produto || '';
    document.getElementById('preco').value = produto.preco || '';
    atualizarImagemProduto(produto.fotoProduto);
    localStorage.setItem('codigo_produto', produto.codigo_produto);
}

// Função para atualizar a imagem do produto
function atualizarImagemProduto(fotoProduto) {
    const fotoElemento = document.getElementById('fotoProduto');
    if (fotoElemento) {
        fotoElemento.src = `http://localhost:3000/${fotoProduto || 'midia/Produtooriginal.png'}`;
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

    if (codigo) {
        fetch(`/api/produto/${codigo}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosProduto)
        })
            .then(response => {
                if (response.ok) {
                    mostrarMensagemSucesso('Produto atualizado com sucesso!');
                } else {
                    alert('Erro ao atualizar o produto. Tente novamente.');
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
        const campos = ['nome', 'grupo', 'marca', 'codigo', 'fornecedor'];
        campos.forEach(id => document.getElementById(id).removeAttribute('disabled'));
        buscaAtivada = true;
    } else {
        buscarProdutosNoMongo();
    }
}

function buscarProdutosNoMongo() {
    const filtro = {
        nome: document.getElementById('nome').value || undefined,
        grupo: document.getElementById('grupo').value || undefined,
        marca: document.getElementById('marca').value || undefined,
        codigo_produto: document.getElementById('codigo').value || undefined,
        fornecedor: document.getElementById('fornecedor').value || undefined
    };

    // Remover chaves com valor undefined
    Object.keys(filtro).forEach(key => filtro[key] === undefined && delete filtro[key]);

    if (Object.keys(filtro).length === 0) {
        return alert('Preencha pelo menos um campo para buscar o produto.');
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
        item.addEventListener('click', () => {
            preencherCamposProduto(produto);
            atualizarImagemProduto(produto.fotoProduto);
            document.getElementById('materiaisSelect').value = produto.codigo_produto;
            document.getElementById('input-foto').style.display = 'block';
            document.getElementById('mensagem-aviso').style.display = 'none';
            localStorage.setItem('codigo_produto', produto.codigo_produto);
        });
        lista.appendChild(item);
    });

    container.appendChild(lista);
}

// Função para verificar se um produto foi selecionado antes de editar a foto
function verificarProdutoSelecionado() {
    const codigoSelecionado = document.getElementById('materiaisSelect').value;

    if (!codigoSelecionado) {
        alert('Por favor, selecione um produto primeiro!');
        return;
    }

    document.getElementById('input-foto').click();
}

// Função para fazer o upload da imagem do produto
async function uploadImage(file, codigoProduto) {
    const formData = new FormData();
    formData.append('imagem', file);

    try {
        const response = await fetch(`/api/produto/${codigoProduto}/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Erro ao fazer upload da imagem');
        }

        const resultado = await response.json();
        mostrarMensagemSucesso('Imagem enviada com sucesso!');
        atualizarImagemProduto(resultado.imageUrl); 
    } catch (error) {
        console.error('Erro ao enviar a imagem:', error);
        alert('Erro ao enviar a imagem. Tente novamente.');
    }
}

// Função para lidar com a alteração da foto do produto
document.getElementById('input-foto').addEventListener('change', function (event) {
    const file = event.target.files[0];
    const codigoSelecionado = document.getElementById('materiaisSelect').value;

    console.log('Código do produto selecionado:', codigoSelecionado);

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fotoElemento = document.getElementById('fotoProduto');
            fotoElemento.src = e.target.result; 
        };
        reader.readAsDataURL(file);
        if (codigoSelecionado) {
            uploadImage(file, codigoSelecionado);
        } else {
            alert('Por favor, selecione um produto primeiro!');
        }
    }
});

carregarProdutosDropdown();
