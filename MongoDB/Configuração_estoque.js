function gerarFormulariosEstoques() {
    const numEstoques = parseInt(document.getElementById("numEstoques").value);
    const estoquesContainer = document.getElementById("estoques");
    estoquesContainer.innerHTML = '';


    for (let i = 1; i <= numEstoques; i++) {
        const estoqueDiv = document.createElement("div");
        estoqueDiv.classList.add("card", "p-4", "mb-4");
        estoqueDiv.innerHTML = `
            <h4>Configuração do Estoque ${i}</h4>
            <div class="mb-3">
                <label for="nomeEstoque${i}" class="form-label">Nome do Estoque</label>
                <input type="text" id="nomeEstoque${i}" class="form-control" required>
            </div>
             <div class="mb-3">
                 <label for="localizacao${i}" class="form-label">Localização do Estoque (Dom Amaury Castanho)</label>
                 <input type="text" id="localizacao${i}" class="form-control" required>
             </div>
            <div class="mb-3">
                <label for="tipoEstante${i}" class="form-label">Tipo de Estantes ou Sistemas Utilizados</label>
                <select id="tipoEstante${i}" class="form-select" required onchange="atualizarDimensaoPrateleira(${i})">
                    <option value="convencional">Convencional</option>
                    <option value="porta-paletes">Porta-Paletes</option>
                    <option value="drive-in">Drive-In</option>
                    <option value="cantilever">Cantilever</option>
                    <option value="prateleira-flutuante">Prateleira Flutuante</option>
                    <option value="estante-movel">Estante Móvel</option>
                </select>
            </div>
            <div id="descricaoTipoEstante${i}" class="mb-3">
            </div>
            <div class="mb-3">
                <label for="tipoProduto${i}" class="form-label">Tipo de Bens Armazenados</label>
                <select id="tipoProduto${i}" class="form-select" required>
                    <option value="solido">Sólidos</option>
                    <option value="liquido">Líquidos</option>
                    <option value="perecivel">Perecíveis</option>
                    <option value="geral">Outros</option>
                    <option value="perigosos">Perigosos</option>
                    <option value="fragil">Frágil</option>
                </select>
            </div>
            <div class="mb-3">
                <label for="capacidadeTotal${i}" class="form-label">Capacidade Total do Armazém (m³)</label>
                <input type="number" id="capacidadeTotal${i}" class="form-control" required>
            </div>
            <div class="mb-3">
                <label for="numPrateleiras${i}" class="form-label">Número de Prateleiras</label>
                <input type="number" id="numPrateleiras${i}" class="form-control" min="1" required>
            </div>
            <div class="mb-3">
                <label for="espacoEntrePrateleiras${i}" class="form-label">Espaçamento entre Prateleiras (cm)</label>
                <input type="number" id="espacoEntrePrateleiras${i}" class="form-control" min="1" required>
            </div>
            <div class="mb-3">
                <label for="pesoMaximo${i}" class="form-label">Peso Máximo por Prateleira (kg)</label>
                <input type="number" id="pesoMaximo${i}" class="form-control" min="1" required>
            </div>
            <button type="button" class="btn btn-custom" onclick="calcularEspaco(${i})">Calcular Estoque ${i}</button>
        `;
        estoquesContainer.appendChild(estoqueDiv);
        
        atualizarDimensaoPrateleira(i);
    }
}

// Função para atualizar a descrição do tipo de estante selecionado
function atualizarDimensaoPrateleira(estoqueId) {
    const tipoEstante = document.getElementById(`tipoEstante${estoqueId}`).value;
    const descricaoDiv = document.getElementById(`descricaoTipoEstante${estoqueId}`);
    let descricao = "";

    switch(tipoEstante) {
        case "convencional":
            descricao = "Estante convencional: ótima para armazenar caixas e produtos menores, com prateleiras fixas.";
            break;
        case "porta-paletes":
            descricao = "Estante porta-paletes: ideal para armazenar paletes, com maior capacidade de peso.";
            break;
        case "drive-in":
            descricao = "Estante drive-in: otimiza o uso do espaço para produtos paletizados, permitindo acesso por um único lado.";
            break;
        case "cantilever":
            descricao = "Estante cantilever: ideal para armazenar produtos longos, como tubos e madeiras.";
            break;
        case "prateleira-flutuante":
            descricao = "Prateleira flutuante: estante modular que oferece flexibilidade na disposição dos produtos.";
            break;
        case "estante-movel":
            descricao = "Estante móvel: sistema de estantes que pode ser movido para otimizar o uso do espaço.";
            break;
        default:
            descricao = "Escolha um tipo de estante para visualizar a descrição.";
    }

    descricaoDiv.innerHTML = `<p>${descricao}</p>`;
}


// Função para calcular o espaço de cada estoque
function calcularEspaco(estoqueIndex) {
    const tipoEstante = document.getElementById(`tipoEstante${estoqueIndex}`).value;
    const capacidadeTotal = parseFloat(document.getElementById(`capacidadeTotal${estoqueIndex}`).value);
    const numPrateleiras = parseInt(document.getElementById(`numPrateleiras${estoqueIndex}`).value);
    const pesoMaximoPorPrateleira = parseFloat(document.getElementById(`pesoMaximo${estoqueIndex}`).value);

    if (capacidadeTotal > 0 && numPrateleiras > 0 && pesoMaximoPorPrateleira > 0) {
        let volumePorPrateleira = 0;

        switch(tipoEstante) {
            case "convencional":
                volumePorPrateleira = 5;
                break;
            case "porta-paletes":
                volumePorPrateleira = 10;
                break;
            case "drive-in":
                volumePorPrateleira = 8;
                break;
            case "cantilever":
                volumePorPrateleira = 15;
                break;
            case "prateleira-flutuante":
                volumePorPrateleira = 6;
                break;
            case "estante-movel":
                volumePorPrateleira = 7;
                break;
            default:
                volumePorPrateleira = 0;
        }

        const totalVolumeOcupado = numPrateleiras * volumePorPrateleira; 
        const comprimentoCaixa = 22.5 / 100;
        const larguraCaixa = 33.0 / 100;  
        const alturaCaixa = 16.5 / 100;    

        const volumeCaixa = comprimentoCaixa * larguraCaixa * alturaCaixa;

        const numCaixasTotal = Math.floor(capacidadeTotal / volumeCaixa);

        const resultadoTexto = `
            <h5>Estoque ${estoqueIndex}:</h5>
            <p><strong>Capacidade Total do Estoque:</strong> ${capacidadeTotal} m³</p>
            <p><strong>Tipo de Estante:</strong> ${tipoEstante}</p>
            <p><strong>Número de Prateleiras:</strong> ${numPrateleiras}</p>
            <p><strong>Volume por Prateleira:</strong> ${volumePorPrateleira} m³</p>
            <p><strong>Total de Volume Ocupado pelas Prateleiras:</strong> ${totalVolumeOcupado} m³</p>
            <p><strong>Total de Caixas que Podem Ser Armazenadas (caixas padrão):</strong> ${numCaixasTotal}</p>
            <p><strong>Peso Máximo por Prateleira:</strong> ${pesoMaximoPorPrateleira} kg</p>
            <p><strong>Capacidade Utilizada:</strong> ${((totalVolumeOcupado / capacidadeTotal) * 100).toFixed(2)}% do volume total do estoque</p>
        `;
        document.getElementById("resultadosTexto").innerHTML += resultadoTexto;
        document.getElementById("resultadoCalculo").classList.remove("d-none");
    } else {
        alert("Por favor, insira valores válidos.");
    }
}


function salvarEstoques() {
    const numEstoques = parseInt(document.getElementById("numEstoques").value);
    const estoques = [];

    for (let i = 1; i <= numEstoques; i++) {
        const nome = document.getElementById(`nomeEstoque${i}`).value;
        const tipoEstante = document.getElementById(`tipoEstante${i}`).value;
        const tipoProduto = document.getElementById(`tipoProduto${i}`).value;
        const capacidadeTotal = parseFloat(document.getElementById(`capacidadeTotal${i}`).value);
        const numPrateleiras = parseInt(document.getElementById(`numPrateleiras${i}`).value);
        const espacoEntrePrateleiras = parseInt(document.getElementById(`espacoEntrePrateleiras${i}`).value);
        const pesoMaximo = parseFloat(document.getElementById(`pesoMaximo${i}`).value);
        const localizacao = document.getElementById(`localizacao${i}`).value; 
        let volumePorPrateleira = 0;
        switch (tipoEstante) {
            case "convencional": volumePorPrateleira = 5; break;
            case "porta-paletes": volumePorPrateleira = 10; break;
            case "drive-in": volumePorPrateleira = 8; break;
            case "cantilever": volumePorPrateleira = 15; break;
            case "prateleira-flutuante": volumePorPrateleira = 6; break;
            case "estante-movel": volumePorPrateleira = 7; break;
            default: volumePorPrateleira = 0;
        }

        const totalVolumeOcupado = numPrateleiras * volumePorPrateleira;

        const numCaixasPorPrateleira = Math.floor(pesoMaximo / 500);
        const numCaixas = numPrateleiras * numCaixasPorPrateleira;
        const capacidadeUtilizada = ((totalVolumeOcupado / capacidadeTotal) * 100).toFixed(2);

        const estoque = {
            nome,
            tipoEstante,
            tipoProduto,
            capacidadeTotal,
            numPrateleiras,
            espacoEntrePrateleiras,
            pesoMaximo,
            localizacao,
            statusProduto: "ativo",
            produtos: [],
            volumePorPrateleira,
            totalVolumeOcupado,
            numCaixas,
            capacidadeUtilizada
        };

        estoques.push(estoque);
    }

    fetch('/estoques', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estoques })
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    })
    .catch(error => {
        console.error('Erro ao salvar estoques:', error);
        alert('Erro ao salvar estoques.');
    });
}



// Função para listar todos os estoques salvos
function listarEstoques() {
    const estoquesContainer = document.getElementById("estoques");
    estoquesContainer.innerHTML = '';

    fetch('/estoques')
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar estoques.");
            return response.json();
        })
        .then(estoques => {
            if (estoques.length === 0) {
                estoquesContainer.innerHTML = '<p>Não há estoques salvos.</p>';
                return;
            }

            estoques.forEach((estoque, index) => {
                const estoqueDiv = document.createElement("div");
                estoqueDiv.classList.add("card", "p-4", "mb-4");
                estoqueDiv.innerHTML = `
                    <h4>Estoque ${index + 1}: ${estoque.tipoEstante}</h4>
                    <p><strong>Tipo de Produto:</strong> ${estoque.tipoProduto}</p>
                    <p><strong>Capacidade Total:</strong> ${estoque.capacidadeTotal} m³</p>
                    <p><strong>Número de Prateleiras:</strong> ${estoque.numPrateleiras}</p>
                    <button type="button" class="btn btn-custom" onclick="exibirEdicaoEstoque('${estoque._id}')">Editar Estoque</button>
                `;
                estoquesContainer.appendChild(estoqueDiv);
            });
        })
        .catch(error => {
            console.error('Erro ao listar estoques:', error);
            estoquesContainer.innerHTML = '<p>Erro ao carregar estoques.</p>';
        });
}

// Função para exibir informações de um estoque específico e permitir edição
function exibirEdicaoEstoque(estoqueId) {
    const estoquesContainer = document.getElementById("estoques");
    estoquesContainer.innerHTML = '';

    fetch(`/estoques/${estoqueId}`)
        .then(response => {
            if (!response.ok) throw new Error("Erro ao buscar estoque.");
            return response.json();
        })
        .then(estoque => {
            const estoqueDiv = document.createElement("div");
            estoqueDiv.classList.add("card", "p-4", "mb-4");
            estoqueDiv.innerHTML = `
                <h4>Editando Estoque: ${estoque.tipoEstante}</h4>
                <form id="formEdicaoEstoque">
                <div class="mb-3">
                        <label for="editNome" class="form-label">Nome do estoque</label>
                        <input type="text" id="NomeEstoque" class="form-control" value="${estoque.nome}">
                    </div>
                    <div class="mb-3">
                        <label for="editNome" class="form-label">Local onde o produto esta</label>
                        <input type="text" id="NomeEstoque" class="form-control" value="${estoque.localizacao}">
                    </div>
                    <div class="mb-3">
                        <label for="editTipoEstante" class="form-label">Tipo de Estantes</label>
                        <select id="editTipoEstante" class="form-select">
                            <option value="convencional" ${estoque.tipoEstante === 'convencional' ? 'selected' : ''}>Convencional</option>
                            <option value="porta-paletes" ${estoque.tipoEstante === 'porta-paletes' ? 'selected' : ''}>Porta-Paletes</option>
                            <option value="drive-in" ${estoque.tipoEstante === 'drive-in' ? 'selected' : ''}>Drive-In</option>
                            <option value="cantilever" ${estoque.tipoEstante === 'cantilever' ? 'selected' : ''}>Cantilever</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="editTipoProduto" class="form-label">Tipo de Produto</label>
                        <select id="editTipoProduto" class="form-select">
                            <option value="solido" ${estoque.tipoProduto === 'solido' ? 'selected' : ''}>Sólidos</option>
                            <option value="liquido" ${estoque.tipoProduto === 'liquido' ? 'selected' : ''}>Líquidos</option>
                            <option value="perecivel" ${estoque.tipoProduto === 'perecivel' ? 'selected' : ''}>Perecíveis</option>
                            <option value="geral" ${estoque.tipoProduto === 'geral' ? 'selected' : ''}>Outros</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="editCapacidadeTotal" class="form-label">Capacidade Total</label>
                        <input type="number" id="editCapacidadeTotal" class="form-control" value="${estoque.capacidadeTotal}">
                    </div>
                    <div class="mb-3">
                        <label for="editNumPrateleiras" class="form-label">Número de Prateleiras</label>
                        <input type="number" id="editNumPrateleiras" class="form-control" value="${estoque.numPrateleiras}">
                    </div>
                </form>
                <button type="button" class="btn btn-success btn-custom" onclick="salvarEdicaoEstoque('${estoque._id}')">Salvar Alterações</button>
                <br>
                <button type="button" class="btn btn-secondary btn-custom" onclick="listarEstoques()">Voltar</button>
            `;
            estoquesContainer.appendChild(estoqueDiv);
        })
        .catch(error => {
            console.error('Erro ao buscar estoque:', error);
            estoquesContainer.innerHTML = '<p>Erro ao carregar informações do estoque.</p>';
        });
}

// Atualiza o estoque 
function salvarEdicaoEstoque(estoqueId) {
    const tipoEstante = document.getElementById("editTipoEstante").value;
    const tipoProduto = document.getElementById("editTipoProduto").value;
    const capacidadeTotal = parseFloat(document.getElementById("editCapacidadeTotal").value);
    const numPrateleiras = parseInt(document.getElementById("editNumPrateleiras").value);

    fetch(`/estoques/${estoqueId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            tipoEstante,
            tipoProduto,
            capacidadeTotal,
            numPrateleiras
        }),
    })
        .then(response => {
            if (!response.ok) throw new Error("Erro ao salvar alterações.");
            return response.json();
        })
        .then(() => {
            alert('Estoque atualizado com sucesso!');
            listarEstoques();
        })
        .catch(error => {
            console.error('Erro ao salvar alterações:', error);
            alert('Erro ao salvar alterações do estoque.');
        });
}
