let estoqueIdSelecionado = null;

// Função para mostrar os estoques
async function mostrarEstoques() {
    const estoques = await fetch('/estoques');
    const estoquesData = await estoques.json();
    console.log('Dados de estoques recebidos:', estoquesData);
    const listaEstoques = estoquesData.map(estoque => {
        return `<button class="btn btn-secondary m-2" onclick="selecionarEstoque('${estoque._id}')">${estoque.nome}</button>`;
    }).join('');
    document.getElementById('estoque-selecionado').innerHTML = `
        <h3 class="mb-3 text-center">Escolher Estoque</h3>
        <div class="text-center">${listaEstoques}</div>
    `;
}

async function selecionarEstoque(id) {
    if (!id) {
        alert('Erro: Estoque inválido selecionado.');
        return;
    }
    estoqueIdSelecionado = id;
    console.log('Estoque selecionado:', estoqueIdSelecionado);

    await carregarEstoque(id);

    document.getElementById('estoque-selecionado').style.display = 'none';
    document.getElementById('estoque-info').style.display = 'block';
    document.getElementById('metas').style.display = 'block';
    document.getElementById('graficos').style.display = 'flex';
    document.getElementById('produtos-vencimento-custo').style.display = 'flex';

    const graficosContainer = document.getElementById('graficos');
    graficosContainer.classList.add('row');
    const produtosContainer = document.getElementById('produtos-vencimento-custo');
    produtosContainer.classList.add('row');
    await atualizarProdutosRegistradosMes();
    atualizarMetas();
    atualizarFuncionarios();
    mostrarMovimentacoes();
}



// Dados fictícios para os gráficos
const dadosOcupacao = {
    labels: ["Capacidade Total", "Ocupação Atual"],
    datasets: [{
        data: [500, 350],
        backgroundColor: ["#8a2be2", "#6a0dad"]
    }]
};

const dadosCategoria = {
    labels: ["Eletrônicos", "Alimentos", "Medicamentos", "Outros"],
    datasets: [{
        data: [150, 100, 50, 50],
        backgroundColor: ["#8a2be2", "#6a0dad", "#1a1a2e", "#ffffff"]
    }]
};

const dadosCusto = {
    labels: ["Jan", "Fev", "Mar", "Abr", "Mai"],
    datasets: [{
        label: "Custo Total (R$)",
        data: [60000, 65000, 70000, 75000, 80000],
        borderColor: "#8a2be2",
        backgroundColor: "rgba(138, 43, 226, 0.2)"
    }]
};

// Renderizar gráficos
new Chart(document.getElementById("graficoOcupacao"), {
    type: "pie",
    data: dadosOcupacao
});

new Chart(document.getElementById("graficoCategoria"), {
    type: "doughnut",
    data: dadosCategoria
});

new Chart(document.getElementById("graficoCusto"), {
    type: "line",
    data: dadosCusto
});

// Função para carregar os dados do estoque
async function carregarEstoque(estoqueId) {
    try {
        console.log('Carregando dados do estoque para o ID:', estoqueId);
        const estoqueResponse = await fetch(`/estoques/${estoqueId}`);
        if (!estoqueResponse.ok) {
            throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
        }
        const estoque = await estoqueResponse.json();
        console.log('Dados do estoque:', estoque);

        const produtosResponse = await fetch(`/produtos/por-estoque/${encodeURIComponent(estoque.nome)}`);
        if (!produtosResponse.ok) {
            throw new Error(`Erro ao buscar produtos: ${produtosResponse.statusText}`);
        }
        const produtosPorEstoque = await produtosResponse.json();
        console.log('Produtos por estoque:', produtosPorEstoque);

        const capacidadeTotal = estoque.capacidadeTotal || 0;
        const volumeOcupado = produtosPorEstoque.reduce((total, produto) => total + (produto.volume || 0), 0);
        const ocupacaoAtual = capacidadeTotal > 0 ? ((volumeOcupado / capacidadeTotal) * 100).toFixed(2) : 0;
        const custoTotal = produtosPorEstoque.reduce((total, produto) => total + (produto.preco || 0), 0).toFixed(2);

        document.getElementById('capacidade-total').innerText = capacidadeTotal;
        document.getElementById('volume-ocupado').innerText = volumeOcupado;
        document.getElementById('ocupacao-atual').innerText = `${ocupacaoAtual}%`;
        document.getElementById('custo-total').innerText = custoTotal;
        document.getElementById('num-produtos').innerText = produtosPorEstoque.length;

    } catch (error) {
        console.error('Erro ao carregar dados do estoque:', error);
        alert(`Erro ao carregar os dados do estoque: ${error.message}`);
    }
}


// Função para atualizar o número total de produtos registrados no mês globalmente
async function atualizarProdutosRegistradosMes() {
    try {
        console.log('Atualizando produtos registrados no mês...');
        const response = await fetch('/produtos/registrados-mes'); 
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos registrados no mês: ${response.statusText}`);
        }

        const produtosRegistradosMesGlobal = await response.json(); 
        console.log('Produtos registrados no mês:', produtosRegistradosMesGlobal);
        const produtosRegistradosElement = document.getElementById('produtos-registrados-no-mes');
        if (produtosRegistradosElement) {
            produtosRegistradosElement.innerText = produtosRegistradosMesGlobal.length; 
        }
    } catch (error) {
        console.error('Erro ao atualizar produtos registrados no mês:', error);
        alert('Erro ao atualizar produtos registrados no mês.');
    }
}
// Função para calcular o funcionário que mais cadastrou
function calcularFuncionarioQueMaisCadastrou(produtos) {
    const contador = {};
    produtos.forEach(produto => {
        const idFuncionario = produto.idFuncionario._id.toString();
        contador[idFuncionario] = (contador[idFuncionario] || 0) + 1;
    });
    return contador;
}

// Função para obter os funcionários mais cadastradores
async function atualizarFuncionarios() {
    try {
        const response = await fetch('/produtos/contagem-funcionarios');
        const data = await response.json();
        const { produtosNoMes, produtosPorPeriodo } = data;
        const contadorMes = calcularFuncionarioQueMaisCadastrou(produtosNoMes);
        const funcionarioMesId = Object.entries(contadorMes).reduce((a, b) => {
            if (!a || b[1] > a[1]) return b;
            return a;
        }, null)?.[0];

        const contadorPeriodo = calcularFuncionarioQueMaisCadastrou(produtosPorPeriodo);
        const funcionarioPeriodoId = Object.entries(contadorPeriodo).reduce((a, b) => {
            if (!a || b[1] > a[1]) return b;
            return a;
        }, null)?.[0];

        async function buscarFuncionario(idFuncionario) {
            if (!idFuncionario) return null;
            const response = await fetch(`/funcionario/${idFuncionario}`);
            if (!response.ok) {
                throw new Error(`Erro ao buscar funcionário: ${response.statusText}`);
            }
            return response.json();
        }
        const funcionarioMes = funcionarioMesId ? await buscarFuncionario(funcionarioMesId) : null;
        const funcionarioPeriodo = funcionarioPeriodoId ? await buscarFuncionario(funcionarioPeriodoId) : null;
        const funcionarioMesElement = document.getElementById('Funcionario-Mes');
        const funcionarioCodigo = document.getElementById('Codigo-Mes');
        const funcionarioMesCount = contadorMes[funcionarioMesId] || 0;

        if (funcionarioMesElement) {
            if (funcionarioMes) {
                funcionarioMesElement.innerText = `Nome: ${funcionarioMes.nome} - Produtos cadastrados: ${funcionarioMesCount}`;
                funcionarioCodigo.innerText = `${funcionarioMes.codigoFuncionario}`;
            } else {
                funcionarioMesElement.innerText = "Nenhum funcionário";
            }
        }
        const funcionarioPeriodoElement = document.getElementById('Funcionario-Periodo');
        const funcionarioCodigoPeriodo = document.getElementById('Codigo-Periodo');
        const funcionarioPeriodoCount = contadorPeriodo[funcionarioPeriodoId] || 0;

        if (funcionarioPeriodoElement) {
            if (funcionarioPeriodo) {
                funcionarioPeriodoElement.innerText = `Nome: ${funcionarioPeriodo.nome} - Produtos cadastrados: ${funcionarioPeriodoCount}`;
                funcionarioCodigoPeriodo.innerText = `${funcionarioPeriodo.codigoFuncionario}`;
            } else {
                funcionarioPeriodoElement.innerText = "Nenhum funcionário";
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar os funcionários:', error);
        alert('Erro ao atualizar os funcionários.');
    }
}

// Função para mostrar o calculo feito na api das movimentações dos produtos...
async function mostrarMovimentacoes() {
    try {
        const url = '/movimentacoes';
        console.log(`Chamando a URL: ${url}`);

        const response = await fetch(url, {
            method: 'GET',
        });
        console.log(`Status da resposta: ${response.status}`);
        console.log(`Resposta completa: ${response}`);
        if (!response.ok) {
            throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        const movimentacoesData = await response.json();
        console.log('Dados recebidos da API:', movimentacoesData);

        const movimentacoesElement = document.getElementById('Movimentacao-produtos');
        if (movimentacoesElement) {
            console.log(`Total de movimentações a ser exibido: ${movimentacoesData.totalMovimentacoes}`);
            movimentacoesElement.innerText = `Total de movimentações: ${movimentacoesData.totalMovimentacoes || 0}`;
        }
    } catch (error) {
        console.error('Erro ao obter movimentações:', error);
        alert('Erro ao obter movimentações.');
    }
}


// Função para editar a meta de registro de produtos
function editarMetaRegistro() {
    const modal = new bootstrap.Modal(document.getElementById('editarMetaModal'));
    modal.show();
}

// Função para salvar a nova meta de registro de produtos para todos os estoques
function salvarNovaMeta() {
    const novaMeta = parseInt(document.getElementById('novaMeta').value, 10);
    const errorMessage = document.getElementById('error-message');

    if (novaMeta && novaMeta > 0) {
        fetch('/estoques/metaRegistro', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ metaMensal: novaMeta })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Erro ao atualizar as metas: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            atualizarMetas();

            const modal = bootstrap.Modal.getInstance(document.getElementById('editarMetaModal'));
            modal.hide(); 
        })
        .catch(error => {
            console.error('Erro ao salvar a meta:', error);
            alert('Erro ao salvar a meta.');
        });
    } else {
        errorMessage.style.display = 'block';
    }
}

// Função para atualizar as metas exibidas e calcular o progresso da meta
async function atualizarMetas() {
    if (estoqueIdSelecionado) {
        try {
            const estoqueResponse = await fetch(`/estoques/${estoqueIdSelecionado}`);
            const estoque = await estoqueResponse.json();
            const metaMensal = estoque.metasRegistro ? estoque.metasRegistro.metaMensal : 0;
            const metaRegistroValorElement = document.getElementById('metaRegistroValor');
            if (metaRegistroValorElement) {
                metaRegistroValorElement.innerText = metaMensal;
            }

            const produtosResponse = await fetch('/produtos/registrados-mes');
            const produtosRegistradosMes = await produtosResponse.json();
            const produtosRegistradosNoMes = produtosRegistradosMes.length;
            const produtosRegistradosElement = document.getElementById('produtos-registrados-no-mes');
            if (produtosRegistradosElement) {
                produtosRegistradosElement.innerText = produtosRegistradosNoMes;
            }
            const progressoMeta = metaMensal > 0 ? ((produtosRegistradosNoMes / metaMensal) * 100).toFixed(2) : 0;
            const progressoMetaElement = document.getElementById('progressoMeta');
            if (progressoMetaElement) {
                progressoMetaElement.innerText = `${progressoMeta}%`;
            }
        } catch (error) {
            console.error('Erro ao atualizar as metas:', error);
            alert('Erro ao atualizar as metas.');
        }
    } else {
        alert('Erro: Nenhum estoque selecionado.');
    }
}

