from flask import Blueprint, jsonify, request, send_file
import xlsxwriter
import os
import re

# Definir o Blueprint
produto_bp = Blueprint('produto', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_produtos = os.path.join(os.getcwd(), 'Excel', 'Produtos')

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com os dados do produto específico
@produto_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        produto = request.json

        # Verificando os dados do produto recebidos
        print("Dados recebidos:", produto)

        # Verifica se a pasta 'Produtos' existe, caso contrário, cria
        if not os.path.exists(pasta_produtos):
            os.makedirs(pasta_produtos)

        # Nome do arquivo Excel
        nome_arquivo = limpar_nome_arquivo(produto['nome']) if produto.get('nome') else f"produto_{produto['codigo_produto']}"
        caminho_excel = os.path.join(pasta_produtos, f"produto_{nome_arquivo}.xlsx")

        # Criando o arquivo Excel
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = workbook.add_worksheet()

        # Adicionando os cabeçalhos
        worksheet.write('A1', 'Código Produto')
        worksheet.write('B1', 'Nome')
        worksheet.write('C1', 'Descrição PDV')
        worksheet.write('D1', 'Grupo')
        worksheet.write('E1', 'Sub-Grupo')
        worksheet.write('F1', 'Fornecedor')
        worksheet.write('G1', 'Marca')
        worksheet.write('H1', 'Localização')
        worksheet.write('I1', 'Destino')
        worksheet.write('J1', 'Almoxarifado')
        worksheet.write('K1', 'Data Entrada')
        worksheet.write('L1', 'Data Saída')
        worksheet.write('M1', 'Preço')
        worksheet.write('N1', 'Inflamável')
        worksheet.write('O1', 'Frágil')
        worksheet.write('P1', 'Foto Produto')
        worksheet.write('Q1', 'ID Funcionário')
        worksheet.write('R1', 'Data de Criação')
        worksheet.write('S1', 'Data de Atualização')

        # Preenchendo os dados
        worksheet.write(1, 0, produto['codigo_produto'])
        worksheet.write(1, 1, produto['nome'])
        worksheet.write(1, 2, produto.get('descricao_pdv', ''))
        worksheet.write(1, 3, produto.get('grupo', ''))
        worksheet.write(1, 4, produto.get('sub_grupo', ''))
        worksheet.write(1, 5, produto.get('fornecedor', ''))
        worksheet.write(1, 6, produto.get('marca', ''))
        worksheet.write(1, 7, produto.get('localizacao', ''))
        worksheet.write(1, 8, produto.get('destino', ''))
        worksheet.write(1, 9, produto.get('almoxarifado', ''))
        worksheet.write(1, 10, produto.get('data_entrada', ''))
        worksheet.write(1, 11, produto.get('data_saida', ''))
        worksheet.write(1, 12, produto.get('preco', 0))
        worksheet.write(1, 13, produto.get('inflamavel', False))
        worksheet.write(1, 14, produto.get('fragil', False))
        worksheet.write(1, 15, produto.get('fotoProduto', ''))
        worksheet.write(1, 16, produto.get('idFuncionario', ''))
        worksheet.write(1, 17, produto.get('createdAt', ''))
        worksheet.write(1, 18, produto.get('updatedAt', ''))

        # Fechando o arquivo
        workbook.close()

        print(f"Excel gerado com sucesso: {caminho_excel}")

        # Enviando o arquivo gerado
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log do erro detalhado
        print(f"Erro ao gerar Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500
