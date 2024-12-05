let estoqueIdSelecionado = null;
let custosTotaisMes = [60000, 65000, 70000, 75000, 80000];
let graficoCategoria;
let graficoSubcategoria;

// Função para mostrar os estoques
async function mostrarEstoques() {
    const estoques = await fetch('/estoques');
    const estoquesData = await estoques.json();
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
    buscarAlertasProdutos();
    atualizarGraficoCusto();
    carregarGraficoCategorias(estoqueIdSelecionado);
}

// Função para carregar os dados do estoque
async function carregarEstoque(estoqueId) {
    try {
        const estoqueResponse = await fetch(`/estoques/${estoqueId}`);
        if (!estoqueResponse.ok) {
            throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
        }
        const estoque = await estoqueResponse.json();
        const produtosResponse = await fetch(`/produtos/por-estoque/${encodeURIComponent(estoque.nome)}`);
        if (!produtosResponse.ok) {
            throw new Error(`Erro ao buscar produtos: ${produtosResponse.statusText}`);
        }
        const produtosPorEstoque = await produtosResponse.json();
        const capacidadeTotal = estoque.capacidadeTotal || 0;
        const volumeOcupado = produtosPorEstoque.reduce((total, produto) => total + (produto.volume || 0), 0);
        const ocupacaoAtual = capacidadeTotal > 0 ? ((volumeOcupado / capacidadeTotal) * 100).toFixed(2) : 0;
        const custoTotal = produtosPorEstoque.reduce((total, produto) => total + (produto.preco || 0), 0).toFixed(2);

        document.getElementById('capacidade-total').innerText = capacidadeTotal;
        document.getElementById('volume-ocupado').innerText = volumeOcupado;
        document.getElementById('ocupacao-atual').innerText = `${ocupacaoAtual}%`;
        document.getElementById('custo-total').innerText = custoTotal;
        document.getElementById('num-produtos').innerText = produtosPorEstoque.length;

        atualizarGraficos(capacidadeTotal, volumeOcupado, ocupacaoAtual);

    } catch (error) {
        console.error('Erro ao carregar dados do estoque:', error);
        alert(`Erro ao carregar os dados do estoque: ${error.message}`);
    }
}


// Função para atualizar o número total de produtos registrados no mês globalmente
async function atualizarProdutosRegistradosMes() {
    try {
        const response = await fetch('/produtos/registrados-mes'); 
        if (!response.ok) {
            throw new Error(`Erro ao buscar produtos registrados no mês: ${response.statusText}`);
        }

        const produtosRegistradosMesGlobal = await response.json(); 
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
        const response = await fetch(url, {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Erro: ${response.status} - ${response.statusText}`);
        }
        const movimentacoesData = await response.json();

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

let produtosAlertas = []; // Todos os alertas de produtos
let produtosAlertasExibidos = 0; // Número de alertas já exibidos
const produtosPorPagina = 10; // Quantidade de alertas por vez


// Função para carregar os alertas de vencimento
function carregarAlertas() {
    const alertasDiv = document.getElementById('produtos-vencimento-alertas');

    // Calcula o próximo lote de alertas a serem carregados
    let alertasHTML = '';
    for (let i = produtosAlertasExibidos; i < produtosAlertasExibidos + produtosPorPagina && i < produtosAlertas.length; i++) {
        const produto = produtosAlertas[i];
        const diasParaVencimento = calcularDiasParaVencimento(produto.data_validade);

        if (diasParaVencimento !== null) {
            const alertElement = document.createElement('div');
            alertElement.classList.add('alert', 'text-dark', 'mb-3', 'p-3', 'rounded');

            // Estilo com base nos dias restantes
            if (diasParaVencimento <= 10) {
                alertElement.classList.add('bg-danger', 'text-white');
            } else if (diasParaVencimento <= 20) {
                alertElement.classList.add('bg-warning');
            } else if (diasParaVencimento <= 30) {
                alertElement.classList.add('bg-info', 'text-white');
            }

            // Adiciona ícone de alerta
            alertElement.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i> 
                Produto ${produto.nome} - Vence em ${diasParaVencimento} dias!
            `;
            alertasDiv.appendChild(alertElement);
        }
    }

    // Atualiza o número de alertas exibidos
    produtosAlertasExibidos += produtosPorPagina;
}

async function buscarAlertasProdutos() {
    try {
        const response = await fetch('/api/produtos/alertas');
        const alertas = await response.json();

        produtosAlertas = alertas;
        produtosAlertasExibidos = 0;

        produtosAlertas.sort((a, b) => a.diasRestantes - b.diasRestantes);

        const alertasDiv = document.getElementById('produtos-vencimento-alertas');
        alertasDiv.innerHTML = '';

        if (!produtosAlertas || produtosAlertas.length === 0) {
            alertasDiv.style.display = 'none';
            return;
        }

        let alertaCritico = false;

        const calcularDiasParaVencimento = (dataValidade) => {
            const hoje = new Date();
            const vencimento = new Date(dataValidade);
            const diffTime = vencimento - hoje;
            return diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : null;
        };

        const carregarAlertas = () => {
            const alertasParaExibir = produtosAlertas.slice(produtosAlertasExibidos, produtosAlertasExibidos + 10);
            produtosAlertasExibidos += alertasParaExibir.length;

            alertasParaExibir.forEach(produto => {
                const diasParaVencimento = calcularDiasParaVencimento(produto.data_validade);
                if (diasParaVencimento !== null) {
                    const alertElement = document.createElement('div');
                    alertElement.classList.add('alert', 'text-dark', 'mb-3', 'p-3', 'rounded');

                    if (diasParaVencimento <= 10) {
                        alertElement.classList.add('bg-danger', 'text-white');
                        alertaCritico = true;
                    } else if (diasParaVencimento <= 20) {
                        alertElement.classList.add('bg-warning');
                    } else if (diasParaVencimento <= 30) {
                        alertElement.classList.add('bg-info', 'text-white');
                    }

                    alertElement.innerHTML = `
                        <i class="bi bi-exclamation-triangle"></i> 
                        Produto ${produto.nome} - Vence em ${diasParaVencimento} dias!
                    `;
                    alertasDiv.appendChild(alertElement);
                }
            });

            if (alertaCritico) {
                const alertaModal = new bootstrap.Modal(document.getElementById('alertaCriticoModal'));
                alertaModal.show();
            }

            alertasDiv.style.display = 'block';
        };
        carregarAlertas();

        alertasDiv.addEventListener('scroll', function() {
            const div = this;
            if (div.scrollTop + div.clientHeight >= div.scrollHeight) {
                // Se chegou no final da lista, carrega mais alertas
                if (produtosAlertasExibidos < produtosAlertas.length) {
                    carregarAlertas();
                }
            }
        });

    } catch (error) {
        console.error('Erro ao buscar alertas de produtos:', error);
        alert('Erro ao buscar alertas de produtos.');
    }
}


function calcularDiasParaVencimento(dataVencimento) {
    if (!dataVencimento) return null;
    const hoje = new Date();
    const vencimento = new Date(dataVencimento);
    if (isNaN(vencimento)) return null;
    const diffTime = vencimento - hoje;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Função para atualizar o gráfico de custo total ao longo do tempo
function atualizarGraficoCusto() {
    if (custosTotaisMes.length < 12) {
        const custoAtual = parseFloat(document.getElementById('custo-total').innerText.replace('R$', '').trim());
        custosTotaisMes.push(custoAtual);

        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        
        // Simulação para os 3 meses anteriores
        const mesesFicticios = [55000, 58000, 62000];
        const custosTotaisSimulados = [...mesesFicticios, custoAtual];

        // Meses do gráfico, colocando Set, Out e Nov antes de Dezembro
        const mesesSimulados = ["Set", "Out", "Nov"];
        mesesSimulados.push("Dez");

        const dadosCusto = {
            labels: mesesSimulados,
            datasets: [{
                label: "Custo Total (R$)",
                data: custosTotaisSimulados,
                borderColor: "#8a2be2",
                backgroundColor: "rgba(138, 43, 226, 0.2)"
            }]
        };
        
        const ctx = document.getElementById("graficoCusto").getContext("2d");
        
        if (window.chartCusto) {
            window.chartCusto.data = dadosCusto;
            window.chartCusto.update();
        } else {
            window.chartCusto = new Chart(ctx, {
                type: "line",
                data: dadosCusto
            });
        }
    }
}

// Função para atualizar os gráficos com os dados calculados
function atualizarGraficos(capacidadeTotal, volumeOcupado, ocupacaoAtual) {
    const dadosOcupacao = {
        labels: ["Capacidade Total", "Ocupação Atual"],
        datasets: [{
            data: [capacidadeTotal, volumeOcupado],
            backgroundColor: ["#8a2be2", "#6a0dad"]
        }]
    };

    new Chart(document.getElementById("graficoOcupacao"), {
        type: "pie",
        data: dadosOcupacao
    });
    const dadosOcupacaoPercentual = {
        labels: ["Capacidade Total", "Ocupação Atual"],
        datasets: [{
            data: [ocupacaoAtual, 100 - ocupacaoAtual],
            backgroundColor: ["#8a2be2", "#6a0dad"]
        }]
    };

    new Chart(document.getElementById("graficoOcupacaoPercentual"), {
        type: "doughnut",
        data: dadosOcupacaoPercentual
    });
}

// Função para criar gráfico de categorias
// Na função carregarGraficoCategorias:
async function carregarGraficoCategorias(estoqueId) {
    if (!estoqueId) {
        console.error('O estoqueId não foi definido!');
        return;
    }

    const estoqueResponse = await fetch(`/estoques/${estoqueId}`);
    if (!estoqueResponse.ok) {
        throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
    }

    try {
        const estoque = await estoqueResponse.json();
        const produtosResponse = await fetch(`/produtos/grupos?estoqueNome=${encodeURIComponent(estoque.nome)}`);
        if (!produtosResponse.ok) {
            throw new Error(`Erro ao buscar produtos do estoque: ${produtosResponse.statusText}`);
        }
        const produtos = await produtosResponse.json();
        console.log('Grupos de produtos:', produtos);

        const categorias = produtos.reduce((acc, produto) => {
            const categoria = produto._id || "Sem Categoria";
            acc[categoria] = (acc[categoria] || 0) + produto.total;
            return acc;
        }, {});

        const labels = Object.keys(categorias);
        const data = Object.values(categorias);

        const ctx = document.getElementById("graficoCategoria").getContext("2d");

        if (graficoCategoria) {
            graficoCategoria.destroy();
        }

        graficoCategoria = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: ["#8a2be2", "#6a0dad", "#1a1a2e", "#ffffff", "#ff6347", "#3cb371"]
                }]
            },
            options: {
                onClick: async (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index;
                        const categoriaSelecionada = labels[index];
                        await carregarGraficoSubcategorias(estoqueId, categoriaSelecionada);
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar gráfico de categorias:', error);
        alert('Erro ao carregar gráfico de categorias.');
    }
}

async function carregarGraficoSubcategorias(estoqueId, grupo) {
    if (!estoqueId) {
        console.error('O estoqueId não foi definido!');
        return;
    }

    const estoqueResponse = await fetch(`/estoques/${estoqueId}`);
    if (!estoqueResponse.ok) {
        throw new Error(`Erro ao buscar estoque: ${estoqueResponse.statusText}`);
    }

    try {
        const estoque = await estoqueResponse.json();
        const subgruposResponse = await fetch(`/produtos/subgrupos?estoqueNome=${encodeURIComponent(estoque.nome)}&grupo=${encodeURIComponent(grupo)}`);
        if (!subgruposResponse.ok) {
            throw new Error(`Erro ao buscar subgrupos do estoque: ${subgruposResponse.statusText}`);
        }
        const subgrupos = await subgruposResponse.json();
        console.log('Subgrupos de produtos:', subgrupos);
        const labels = subgrupos.map(subgrupo => subgrupo._id || "Sem Subgrupo");
        const data = subgrupos.map(subgrupo => subgrupo.total);

        const ctx = document.getElementById("graficoSubcategoria").getContext("2d");

        if (graficoSubcategoria) {
            graficoSubcategoria.destroy();
        }

        // Criando o gráfico
        graficoSubcategoria = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    data,
                    backgroundColor: [
                        "#8a2be2", "#6a0dad", "#1a1a2e", "#ffffff", "#ff6347", "#3cb371"
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: {
                        labels: {
                            generateLabels: function(chart) {
                                const labels = chart.data.labels;
                                return labels.map((label, index) => {
                                    return {
                                        text: label || "Sem Subgrupo", // Corrigir rótulos
                                        fillStyle: chart.data.datasets[0].backgroundColor[index]
                                    };
                                });
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Erro ao carregar gráfico de subcategorias:', error);
        alert('Erro ao carregar gráfico de subcategorias.');
    }
}
