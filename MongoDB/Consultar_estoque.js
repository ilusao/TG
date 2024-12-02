let estoqueIdSelecionado = null;

// Função para mostrar os estoques
async function mostrarEstoques() {
    const estoques = await fetch('/estoques');
    const estoquesData = await estoques.json();
    const listaEstoques = estoquesData.map(estoque => {
        return `<button class="btn btn-secondary m-2" onclick="selecionarEstoque('${estoque._id}')">${estoque.nome}</button>`;
    }).join('');
    document.getElementById('estoque-selecionado').innerHTML = `
        <h3 class="mb-3">Escolher Estoque</h3>
        <div class="text-center">${listaEstoques}</div>
    `;
}

// Função para selecionar o estoque
async function selecionarEstoque(id) {
    if (!id) {
        alert('Erro: Estoque inválido selecionado.');
        return;
    }
    estoqueIdSelecionado = id;

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
        const estoqueResponse = await fetch(`/estoques/${estoqueId}`);
        if (!estoqueResponse.ok) {
            throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
        }
        const estoque = await estoqueResponse.json();

        const produtosResponse = await fetch(`/produtos/por-estoque/${encodeURIComponent(estoque.nome)}/registrados-mes`);
        if (!produtosResponse.ok) {
            throw new Error(`Erro ao buscar produtos: ${produtosResponse.statusText}`);
        }
        const { produtosPorEstoque, produtosRegistradosMes } = await produtosResponse.json();

        await FuncionarioQueMaisCadastrou();

        const capacidadeTotal = estoque.capacidadeTotal || 0;
        const volumeOcupado = produtosPorEstoque.reduce((total, produto) => total + (produto.volume || 0), 0);
        const ocupacaoAtual = capacidadeTotal > 0 ? ((volumeOcupado / capacidadeTotal) * 100).toFixed(2) : 0;
        const custoTotal = produtosPorEstoque.reduce((total, produto) => total + (produto.preco || 0), 0).toFixed(2);

        document.getElementById('capacidade-total').innerText = capacidadeTotal;
        document.getElementById('volume-ocupado').innerText = volumeOcupado;
        document.getElementById('ocupacao-atual').innerText = `${ocupacaoAtual}%`;
        document.getElementById('custo-total').innerText = custoTotal;
        document.getElementById('num-produtos').innerText = produtosPorEstoque.length;

        if (estoque.metasRegistro) {
            const metaMensal = estoque.metasRegistro.metaMensal || 0;
            const metaMensalAtual = estoque.metasRegistro.metaMensalAtual || 0;
            const progressoMeta = metaMensal > 0
                ? (metaMensalAtual / metaMensal * 100).toFixed(2)
                : 0;

            document.getElementById('metaRegistroValor').innerText = metaMensal;
            document.getElementById('produtos-registrados-no-mes').innerText = metaMensalAtual;
            document.getElementById('progressoMeta').innerText = `${progressoMeta}%`;
        }

        const produtosRegistradosElement = document.getElementById('produtos-registrados-no-mes');
        if (produtosRegistradosElement) {
            produtosRegistradosElement.innerText = produtosRegistradosMes.length;
        }
    } catch (error) {
        alert(`Erro ao carregar os dados do estoque: ${error.message}`);
    }
}



async function atualizarProdutosRegistradosMes() {
    try {
        if (!estoqueIdSelecionado) {
            alert('Erro: Nenhum estoque selecionado.');
            return;
        }

        const estoqueResponse = await fetch(`/estoques/${estoqueIdSelecionado}`);
        if (!estoqueResponse.ok) {
            throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
        }
        const estoque = await estoqueResponse.json();

        const response = await fetch(`/produtos/por-estoque/${encodeURIComponent(estoque.nome)}/registrados-mes`);
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos registrados no mês: ${response.statusText}`);
        }

        const { produtosPorEstoque, produtosRegistradosMes } = await response.json();
        const produtosRegistrados = produtosRegistradosMes.length;

        const produtosRegistradosElement = document.getElementById('produtos-registrados-no-mes');
        if (produtosRegistradosElement) {
            produtosRegistradosElement.innerText = produtosRegistrados;
        }

        const metaMensal = estoque.metasRegistro ? estoque.metasRegistro.metaMensal || 0 : 0;
        const progressoMeta = metaMensal > 0
            ? (produtosRegistrados / metaMensal * 100).toFixed(2)
            : 0;

        document.getElementById('progressoMeta').innerText = `${progressoMeta}%`;
    } catch (error) {
        alert('Erro ao atualizar produtos registrados no mês.');
    }
}



// Função para atualizar os funcionários que mais cadastraram no mês e no período
async function FuncionarioQueMaisCadastrou() {
    try {
        if (!estoqueIdSelecionado) {
            alert('Erro: Nenhum estoque selecionado.');
            return;
        }

        const estoqueResponse = await fetch(`/estoques/${estoqueIdSelecionado}`);
        if (!estoqueResponse.ok) {
            throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
        }
        const estoque = await estoqueResponse.json();
        const produtosResponse = await fetch(`/produtos/por-estoque/${encodeURIComponent(estoque.nome)}/registrados-mes`);
        if (!produtosResponse.ok) {
            throw new Error(`Erro ao buscar produtos registrados no mês: ${produtosResponse.statusText}`);
        }
        const { produtosPorEstoque, produtosRegistradosMes } = await produtosResponse.json();
        function contarFuncionario(produtos) {
            const contador = {};
            produtos.forEach(produto => {
                const idFuncionario = produto.idFuncionario;
                if (idFuncionario != null) {
                    const idFuncionarioString = idFuncionario.toString(); 
                    contador[idFuncionarioString] = (contador[idFuncionarioString] || 0) + 1;
                }
            });
            return contador;
        }

        const contadorMes = contarFuncionario(produtosRegistradosMes);
        const funcionarioMesId = Object.entries(contadorMes).reduce((a, b) => {
            if (!a || b[1] > a[1]) return b;
            return a;
        }, null)?.[0];
        const contadorPeriodo = contarFuncionario(produtosPorEstoque);
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
        const funcionarioMesElement = document.getElementById('Funcionario-Mes');
        if (funcionarioMesElement) {
            if (funcionarioMesId) {
                const funcionarioMes = await buscarFuncionario(funcionarioMesId);
                funcionarioMesElement.innerText = `${funcionarioMes.nome} (${funcionarioMes.codigoFuncionario})`;
            } else {
                funcionarioMesElement.innerText = "Nenhum funcionário";
            }
        }
        const funcionarioPeriodoElement = document.getElementById('Funcionario-Periodo');
        if (funcionarioPeriodoElement) {
            if (funcionarioPeriodoId) {
                const funcionarioPeriodo = await buscarFuncionario(funcionarioPeriodoId);
                funcionarioPeriodoElement.innerText = `${funcionarioPeriodo.nome} (${funcionarioPeriodo.codigoFuncionario})`;
            } else {
                funcionarioPeriodoElement.innerText = "Nenhum funcionário";
            }
        }

    } catch (error) {
        console.error('Erro ao atualizar os funcionários:', error);
        alert('Erro ao atualizar os funcionários.');
    }
}

// Função para editar a meta de registro de produtos
function editarMetaRegistro() {
    const modal = new bootstrap.Modal(document.getElementById('editarMetaModal'));
    modal.show();
}

function salvarNovaMeta() {
    const novaMeta = parseInt(document.getElementById('novaMeta').value, 10);
    const errorMessage = document.getElementById('error-message');

    if (!estoqueIdSelecionado) {
        alert('Erro: Estoque não selecionado.');
        return;
    }

    if (novaMeta && novaMeta > 0) {
        fetch(`/estoques/${estoqueIdSelecionado}/metaRegistro`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ metaMensal: novaMeta })
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro ao atualizar meta: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                if (data && data.estoque && data.estoque.metasRegistro) {
                    const { metaMensal, metaMensalAtual } = data.estoque.metasRegistro;
                    const progressoMeta = metaMensal > 0
                        ? (metaMensalAtual / metaMensal * 100).toFixed(2)
                        : 0;

                    document.getElementById('metaRegistroValor').innerText = metaMensal;
                    document.getElementById('produtos-registrados-no-mes').innerText = metaMensalAtual;
                    document.getElementById('progressoMeta').innerText = `${progressoMeta}%`;
                }
            })
            .catch(error => {
                console.error('Erro ao salvar nova meta:', error);
                alert('Erro ao salvar a meta.');
            });
    } else {
        errorMessage.style.display = 'block';
    }
}
