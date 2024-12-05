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
    return re.sub(r'[^a-zA-Z0-9_]+', '_', nome)


# Função para criar a pasta, caso ela não exista
def criar_pasta_se_necessario(caminho):
    if not os.path.exists(caminho):
        os.makedirs(caminho)


# Função para configurar as colunas e cabeçalhos da planilha
def configurar_planilha(workbook):
    worksheet = workbook.add_worksheet()

    # Definir os cabeçalhos
    headers = [
        'Código Produto', 'Nome', 'Descrição PDV', 'Grupo', 'Sub-Grupo', 'Fornecedor',
        'Marca', 'Localização', 'Destino', 'Almoxarifado', 'Data Entrada', 'Data Saída',
        'Preço', 'Inflamável', 'Frágil', 'Foto Produto', 'ID Funcionário',
        'Data de Criação', 'Data de Atualização', 'Data de Validade'
    ]

    # Estilo para os cabeçalhos
    header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1, 'align': 'center'})

    # Adicionar os cabeçalhos e ajustar largura das colunas
    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header, header_format)
        worksheet.set_column(col_num, col_num, 20)  # Ajustar largura das colunas

    return worksheet


# Função para preencher os dados do produto na planilha
def preencher_dados(worksheet, produto):
    # Dados do produto
    valores = [
        produto.get('codigo_produto', ''),
        produto.get('nome', ''),
        produto.get('descricao_pdv', ''),
        produto.get('grupo', ''),
        produto.get('sub_grupo', ''),
        produto.get('fornecedor', ''),
        produto.get('marca', ''),
        produto.get('localizacao', ''),
        produto.get('destino', ''),
        produto.get('almoxerifado', ''),
        produto.get('data_entrada', ''),
        produto.get('data_saida', ''),
        produto.get('preco', 0),
        "Sim" if produto.get('inflamavel', False) else "Não",
        "Sim" if produto.get('fragil', False) else "Não",
        produto.get('fotoProduto', ''),
        produto.get('idFuncionario', ''),
        produto.get('createdAt', ''),
        produto.get('updatedAt', ''),
        produto.get('data_validade', '')
    ]

    # Escrever os valores na segunda linha (linha 1 no índice zero-based)
    for col_num, valor in enumerate(valores):
        worksheet.write(1, col_num, valor)


# Rota para gerar o Excel com os dados do produto específico
@produto_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        # Recuperar os dados do produto do corpo da requisição
        produto = request.json

        # Verificar se os dados foram recebidos
        if not produto:
            return jsonify({"error": "Nenhum dado foi enviado"}), 400

        # Verificar se a pasta 'Produtos' existe, caso contrário, criá-la
        criar_pasta_se_necessario(pasta_produtos)

        # Nome do arquivo Excel
        nome_arquivo = limpar_nome_arquivo(produto.get('nome', f"produto_{produto['codigo_produto']}"))
        caminho_excel = os.path.join(pasta_produtos, f"{nome_arquivo}.xlsx")

        # Criar o arquivo Excel
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = configurar_planilha(workbook)
        preencher_dados(worksheet, produto)
        workbook.close()

        # Retornar o arquivo gerado para download
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log do erro detalhado
        print(f"Erro ao gerar Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500
