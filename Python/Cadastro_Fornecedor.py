from flask import Blueprint, jsonify, request, send_file
import xlsxwriter
import os
import re

# Definir o Blueprint
fornecedor_bp = Blueprint('fornecedor', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_fornecedores = os.path.join(os.getcwd(), 'Excel', 'Fornecedores')


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
        'ID', 'Nome', 'Email', 'Descrição', 'Observações', 'País', 'Cidade', 'Estado',
        'CEP', 'Número', 'Site', 'CNPJ', 'Telefone', 'Código Fornecedor', 
        'Funcionário ID', 'Foto Fornecedor', 'Produtos', 'Data Cadastro', 'Inativo'
    ]

    # Estilo para os cabeçalhos
    header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1, 'align': 'center'})

    # Adicionar os cabeçalhos e ajustar largura das colunas
    for col_num, header in enumerate(headers):
        worksheet.write(0, col_num, header, header_format)
        worksheet.set_column(col_num, col_num, 20)  # Ajustar largura das colunas

    return worksheet


# Função para preencher os dados do fornecedor na planilha
def preencher_dados(worksheet, fornecedor):
    # Dados do fornecedor
    valores = [
        fornecedor.get('_id', ''),
        fornecedor.get('nome', ''),
        fornecedor.get('email', ''),
        fornecedor.get('descricao', ''),
        fornecedor.get('observacoes', ''),
        fornecedor.get('pais', ''),
        fornecedor.get('cidade', ''),
        fornecedor.get('estado', ''),
        fornecedor.get('cep', ''),
        fornecedor.get('numero', ''),
        fornecedor.get('site', ''),
        fornecedor.get('cnpj', ''),
        fornecedor.get('telefone', ''),
        fornecedor.get('codigo_fornecedor', ''),
        fornecedor.get('idFuncionario', ''),
        fornecedor.get('fotoFornecedor', ''),
        ", ".join(str(produto) for produto in fornecedor.get('produtos', [])),  # Lista de produtos como string
        fornecedor.get('dataCadastro', ''),
        "Sim" if fornecedor.get('inativo', False) else "Não"
    ]

    # Escrever os valores na segunda linha (linha 1 no índice zero-based)
    for col_num, valor in enumerate(valores):
        worksheet.write(1, col_num, valor)


# Rota para gerar o Excel com os dados do fornecedor específico
@fornecedor_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        # Recuperar os dados do fornecedor do corpo da requisição
        fornecedor = request.json

        # Verificar se os dados foram recebidos
        if not fornecedor:
            return jsonify({"error": "Nenhum dado foi enviado"}), 400

        # Verificar se a pasta 'Fornecedores' existe, caso contrário, criá-la
        criar_pasta_se_necessario(pasta_fornecedores)

        # Nome do arquivo Excel
        nome_arquivo = limpar_nome_arquivo(fornecedor.get('nome', f"fornecedor_{fornecedor['codigo_fornecedor']}"))
        caminho_excel = os.path.join(pasta_fornecedores, f"{nome_arquivo}.xlsx")

        # Criar o arquivo Excel
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = configurar_planilha(workbook)
        preencher_dados(worksheet, fornecedor)
        workbook.close()

        # Retornar o arquivo gerado para download
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log do erro detalhado
        print(f"Erro ao gerar Excel para fornecedor {fornecedor.get('nome', fornecedor.get('codigo_fornecedor'))}: {str(e)}")
        return jsonify({"error": str(e)}), 500
