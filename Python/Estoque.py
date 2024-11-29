from flask import Blueprint, jsonify, request, send_file
import xlsxwriter
import os
import re

# Definir o Blueprint
estoque_bp = Blueprint('estoque', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_estoques = os.path.join(os.getcwd(), 'Excel', 'Estoques')

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com os dados do estoque
@estoque_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        # Dados do estoque recebidos do frontend
        estoque = request.json

        # Verifica se a pasta 'Estoques' existe, caso contrário, cria
        if not os.path.exists(pasta_estoques):
            os.makedirs(pasta_estoques)

        # Nome do arquivo Excel: Usando o tipo de estante como referência
        nome_arquivo = limpar_nome_arquivo(estoque['tipoEstante']) if estoque.get('tipoEstante') else "estoque_desconhecido"
        caminho_excel = os.path.join(pasta_estoques, f"estoque_{nome_arquivo}.xlsx")

        # Criando o arquivo Excel no caminho desejado
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = workbook.add_worksheet()

        # Adicionando o cabeçalho (com todos os campos)
        worksheet.write('A1', 'Tipo Estante')
        worksheet.write('B1', 'Tipo Produto')
        worksheet.write('C1', 'Capacidade Total')
        worksheet.write('D1', 'Número de Prateleiras')
        worksheet.write('E1', 'Status Produto')
        worksheet.write('F1', 'Produtos')
        worksheet.write('G1', 'Criado Em')
        worksheet.write('H1', 'Atualizado Em')

        # Preenchendo os dados do estoque
        worksheet.write(1, 0, estoque['tipoEstante'])
        worksheet.write(1, 1, estoque['tipoProduto'])
        worksheet.write(1, 2, estoque['capacidadeTotal'])
        worksheet.write(1, 3, estoque['numPrateleiras'])
        worksheet.write(1, 4, estoque['statusProduto'])

        # Produtos: convertendo lista de IDs em string separada por vírgulas
        produtos = ", ".join(str(produto) for produto in estoque.get('produtos', []))
        worksheet.write(1, 5, produtos)

        # Criado em e atualizado em
        worksheet.write(1, 6, estoque.get('createdAt', ''))
        worksheet.write(1, 7, estoque.get('updatedAt', ''))

        # Fechando o arquivo Excel
        workbook.close()

        # Adicionando o print para verificar o caminho do arquivo
        print(f"Excel gerado com sucesso: {caminho_excel}")

        # Usando send_file para enviar o arquivo
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log de erro detalhado para facilitar depuração
        print(f"Erro ao gerar Excel para o estoque {estoque.get('tipoEstante', 'desconhecido')}: {str(e)}")
        return jsonify({"error": str(e)}), 500
