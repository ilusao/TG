var map = L.map('map').setView([-23.2644, -47.2992], 13);
        var errorMessage = document.getElementById('error-message');
        var loadingIndicator = document.getElementById('loading');
        let tempLocationMarker = null; 
        let produtos = []; 

        // para a animção do produto sendo enviando
        const redIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41], 
            popupAnchor: [1, -34]
        });
      // para produtos que vão ser enviados
        const grayIcon = L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
        });

        function initMap() {
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }

        function showErrorMessage(message) {
            errorMessage.innerText = message;
            errorMessage.style.display = 'block';
        }

        let markers = [];

        async function carregarProdutos() {
            try {
                const response = await fetch('/api/buscarProdutos', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({})
                });
                
                if (!response.ok) {
                    throw new Error('Falha ao buscar produtos');
                }
                
                const produtosData = await response.json();
                produtos = produtosData;
        
                const hoje = new Date().toISOString().split("T")[0];
        
                // Limpa os marcadores existentes
                markers.forEach(marker => map.removeLayer(marker));
                markers = [];
        
                for (let produto of produtos) {
                    if (produto.destino && produto.data_entrada) {
                        const dataEntrada = new Date(produto.data_entrada).toISOString().split("T")[0];
                        if (dataEntrada === hoje) {
                            produto.localizacao = produto.destino;
                            produto.destino = "";
                            await atualizarLocalizacaoProduto(produto.codigo_produto, produto.localizacao, produto.destino);
                        }
                    }
        
                    if (produto.localizacao) {
                        const dataLoc = await buscarLocalizacaoAPI(produto.localizacao);
                        if (dataLoc.length > 0) {
                            const { lat, lon } = dataLoc[0];
                            produto.coordenadas = { lat, lon };
        
                            let marker, popupContent;
        
                            // Verifica se o destino é nulo ou não
                            if (produto.destino) {
                                // Produto com destino definido - usa ícone cinza
                                marker = L.marker([lat, lon], { icon: grayIcon }).addTo(map);
                                popupContent = `
                                    Produto: ${produto.nome} <br>
                                    Localização: ${produto.localizacao} <br>
                                    Código: ${produto.codigo_produto} <br>
                                    Produto será enviado para: ${produto.destino} no dia: ${new Date().toLocaleDateString()} <!-- Mensagem -->
                                `;
                            } else {
                                // Produto sem destino - usa ícone normal
                                marker = L.marker([lat, lon]).addTo(map);
                                popupContent = `
                                    Produto: ${produto.nome} <br>
                                    Localização: ${produto.localizacao} <br>
                                    Código: ${produto.codigo_produto} <br>
                                    Nenhum destino definido.
                                `;
                            }
        
                            // Adiciona o popup ao marcador
                            marker.bindPopup(popupContent);
                            markers.push(marker);
                        } else {
                            console.warn(`Localização não encontrada para o produto ${produto.nome}`);
                        }
                    } else {
                        console.warn(`Produto ${produto.nome} não possui localização`);
                    }
                }
            } catch (error) {
                console.error('Erro ao carregar produtos:', error);
                showErrorMessage("Ocorreu um erro ao carregar os produtos.");
            }
        }

        

        async function buscarLocalizacaoAPI(localizacao) {
            try {
                const responseLoc = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${localizacao}`);
                if (!responseLoc.ok) {
                    throw new Error("Falha ao buscar localização");
                }
                return await responseLoc.json();
            } catch (error) {
                console.error('Erro ao buscar localização:', error);
                showErrorMessage("Infelizmente, não conseguimos se conectar ao OpenStreetMap para buscar a localização.");
                return [];
            }
        }

        document.getElementById('buscarLocal').addEventListener('click', buscarLocalizacao);

        async function iniciarRoteamento(coordenadasIniciais, coordenadasFinais) {
    if (!coordenadasFinais || !coordenadasFinais.lat || !coordenadasFinais.lon) {
        alert("Coordenadas de destino inválidas.");
        return;
    }

    // Armazena o controle de rota para removê-lo depois
    const routingControl = L.Routing.control({
        waypoints: [
            L.latLng(coordenadasIniciais.lat, coordenadasIniciais.lon),
            L.latLng(coordenadasFinais.lat, coordenadasFinais.lon)
        ],
        routeWhileDragging: true
    }).addTo(map);

    return new Promise((resolve) => {
        routingControl.on('routesfound', function(e) {
            const route = e.routes[0];
            animarRota(route.coordinates, coordenadasIniciais, coordenadasFinais, routingControl);
            resolve();
        });
    });
}

      // no site o botão "buscar localização" não vai funcinar bem com os dois imputs, então resolvi adicinar a função da tecla 'enter'.
      // então é só aperta 'enter' para funcinar os imputs: Codigo do produto e Localização...
      const codigoProdutoInput = document.getElementById('codigoProduto');
const localizacaoInput = document.getElementById('localizacao');

// Adiciona o evento "Enter" para ambos os campos em um único trecho de código
[codigoProdutoInput, localizacaoInput].forEach(input => {
    input.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Impede o comportamento padrão de submit
            buscarLocalizacao(); // Chama a função de busca
        }
    });
});

// Modifica a função buscarLocalizacao para buscar pelo código do produto ou pela localização
async function buscarLocalizacao() {
    const codigoProduto = codigoProdutoInput.value;
    const localizacao = localizacaoInput.value;

    if (codigoProduto) {
        const produtoEncontrado = produtos.find(prod => prod.codigo_produto === codigoProduto);

        if (produtoEncontrado && produtoEncontrado.coordenadas) {
            const { lat, lon } = produtoEncontrado.coordenadas;

            if (tempLocationMarker) {
                map.removeLayer(tempLocationMarker);
            }

            const popupContent = `
                <b>Produto:</b> ${produtoEncontrado.nome} <br>
                <b>Código do Produto:</b> ${produtoEncontrado.codigo_produto} <br>
                <b>Grupo:</b> ${produtoEncontrado.grupo || 'N/A'} <br>
                <b>Fornecedor:</b> ${produtoEncontrado.fornecedor || 'N/A'} <br>
                <b>Localização:</b> ${produtoEncontrado.localizacao} <br>
                <b>Destino:</b> ${produtoEncontrado.destino || 'N/A'} <br>
                <b>Data de Entrada:</b> ${new Date(produtoEncontrado.data_entrada).toLocaleDateString()} <br>
                ${produtoEncontrado.data_saida ? `<b>Data de Saída:</b> ${new Date(produtoEncontrado.data_saida).toLocaleDateString()} <br>` : ''}
                <b>Inflamável:</b> ${produtoEncontrado.inflamavel ? 'Sim' : 'Não'} <br>
                <b>Frágil:</b> ${produtoEncontrado.fragil ? 'Sim' : 'Não'}
            `;

            tempLocationMarker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(popupContent)
                .openPopup();
            map.setView([lat, lon], 13);
            return;
        } else {
            alert("Produto não encontrado ou sem localização disponível.");
            return;
        }
    }

    if (localizacao) {
        const dataLoc = await buscarLocalizacaoAPI(localizacao);
        if (dataLoc.length > 0) {
            const { lat, lon } = dataLoc[0];

            if (tempLocationMarker) {
                map.removeLayer(tempLocationMarker);
            }

            tempLocationMarker = L.marker([lat, lon])
                .addTo(map)
                .bindPopup(`<b>Localização:</b> ${localizacao}`)
                .openPopup();
            map.setView([lat, lon], 13);
        } else {
            alert("Localização não encontrada.");
        }
    } else {
        alert("Por favor, preencha o Código do Produto ou a Localização.");
    }
}

async function animarRota(coordenadas, coordenadasIniciais, coordenadasFinais, routingControl) {
    let marker = L.marker([coordenadasIniciais.lat, coordenadasIniciais.lon], { icon: redIcon }).addTo(map);
    let index = 0;
    function moveMarker() {
        if (index < coordenadas.length) {
            marker.setLatLng([coordenadas[index].lat, coordenadas[index].lng]);
            index++;
        } else {
            clearInterval(animationInterval);
            atualizarProduto(coordenadasFinais.lat, coordenadasFinais.lon);
            map.removeControl(routingControl);
            
            // Define a nova posição do marcador ao final da animação
            marker.setLatLng([coordenadasFinais.lat, coordenadasFinais.lon]);
            const produtoEncontrado = produtos.find(prod => prod.coordenadas.lat === coordenadasIniciais.lat && prod.coordenadas.lon === coordenadasIniciais.lon);
            if (produtoEncontrado) {
                const popupContent = `
                    <b>Produto:</b> ${produtoEncontrado.nome} <br>
                    <b>Código do Produto:</b> ${produtoEncontrado.codigo_produto} <br>
                    <b>Grupo:</b> ${produtoEncontrado.grupo || 'N/A'} <br>
                    <b>Fornecedor:</b> ${produtoEncontrado.fornecedor || 'N/A'} <br>
                    <b>Localização:</b> ${produtoEncontrado.localizacao} <br>
                    <b>Destino:</b> ${produtoEncontrado.destino || 'N/A'} <br>
                    <b>Data de Entrada:</b> ${new Date(produtoEncontrado.data_entrada).toLocaleDateString()} <br>
                    ${produtoEncontrado.data_saida ? `<b>Data de Saída:</b> ${new Date(produtoEncontrado.data_saida).toLocaleDateString()} <br>` : ''}
                    <b>Inflamável:</b> ${produtoEncontrado.inflamavel ? 'Sim' : 'Não'} <br>
                    <b>Frágil:</b> ${produtoEncontrado.fragil ? 'Sim' : 'Não'}
                `;
                marker.bindPopup(popupContent).openPopup();
            }

            // Remove o marcador vermelho após a animação
            map.removeLayer(marker);

            map.setView([coordenadasFinais.lat, coordenadasFinais.lon], 13);
        }
    }

    const animationInterval = setInterval(moveMarker, 500);
}

async function atualizarProduto() {
    const codigoProduto = document.getElementById('codigoProdutoEnviar').value;
    const localizacaoEnviar = document.getElementById('localizacaoEnviar').value;

    try {
        const response = await fetch('/api/enviarProduto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ codigo_produto: codigoProduto, localizacao: localizacaoEnviar })
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar produto');
        }

        alert("Produto atualizado com sucesso!");

        // Chama a função para atualizar a visualização do produto no mapa
        await carregarProdutos(); // Recarrega os produtos após atualização
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        alert("Ocorreu um erro ao atualizar o produto.");
    }
}

async function atualizarLocalizacaoProduto(codigo_produto, novaLocalizacao, novoDestino) {
    try {
        const response = await fetch('/api/enviarProduto', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                codigo_produto,
                localizacao: novaLocalizacao,
                destino: novoDestino
            })
        });

        if (!response.ok) {
            throw new Error('Falha ao atualizar produto');
        }

        console.log(`Produto ${codigo_produto} atualizado com nova localização e destino.`);
    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
    }
}

// Ao iniciar o roteamento
async function iniciarRoteamento(coordenadasIniciais, coordenadasFinais) {
    if (!coordenadasFinais || !coordenadasFinais.lat || !coordenadasFinais.lon) {
        alert("Coordenadas de destino inválidas.");
        return;
    }

    const routingControl = L.Routing.control({
        waypoints: [
            L.latLng(coordenadasIniciais.lat, coordenadasIniciais.lon),
            L.latLng(coordenadasFinais.lat, coordenadasFinais.lon)
        ],
        routeWhileDragging: true
    }).addTo(map);

    return new Promise((resolve) => {
        routingControl.on('routesfound', function(e) {
            const route = e.routes[0];
            animarRota(route.coordinates, coordenadasIniciais, coordenadasFinais, routingControl);
            resolve();
        });
    });
}


        document.getElementById('enviarProduto').addEventListener('click', async function() {
            const codigoProduto = document.getElementById('codigoProdutoEnviar').value;
            const localizacaoEnviar = document.getElementById('localizacaoEnviar').value;

            if (!codigoProduto || !localizacaoEnviar) {
                alert("Por favor, preencha todos os campos.");
                return;
            }

            const produtoEncontrado = produtos.find(prod => prod.codigo_produto === codigoProduto);
            if (!produtoEncontrado || !produtoEncontrado.coordenadas) {
                alert("Produto não encontrado ou sem coordenadas.");
                return;
            }

            loadingIndicator.style.display = 'block'; // Exibir indicador de carregamento

            const destinoData = await buscarLocalizacaoAPI(localizacaoEnviar);
            if (!destinoData.length) {
                alert("Localização de envio não encontrada.");
                loadingIndicator.style.display = 'none'; // Ocultar indicador de carregamento
                return;
            }

            const destino = destinoData[0]; // A primeira localização encontrada
            const { lat, lon } = produtoEncontrado.coordenadas;

            // Iniciar o roteamento
            await iniciarRoteamento(produtoEncontrado.coordenadas, destino);

            loadingIndicator.style.display = 'none'; // Ocultar indicador de carregamento
        });

        // Inicializa o mapa e carrega os produtos
        initMap();
        carregarProdutos();