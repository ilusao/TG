from flask import Flask, Blueprint, jsonify, send_file
import xlsxwriter
import os
import re
from pymongo import MongoClient
import io
from datetime import datetime

# Configurações do Flask
app = Flask(__name__)

# Definir o Blueprint
Consultar_fornecedor_bp = Blueprint('Cfornecedor', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_fornecedores = os.path.join(os.getcwd(), 'Excel', 'Fornecedores')

# Conectar ao MongoDB (Atualize com o MongoDB Atlas ou seu MongoDB local)
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
collection = db['fornecedores']

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Função para tratar e formatar datas
def formatar_data(data):
    if isinstance(data, str):
        try:
            return datetime.strptime(data, '%Y-%m-%d')
        except ValueError:
            return None
    elif isinstance(data, datetime):
        return data
    return None

# Rota para gerar o Excel com a lista de fornecedores
@Consultar_fornecedor_bp.route('/gerar-list-excel', methods=['POST'])
def gerar_list_excel():
    try:
        # Recuperar todos os fornecedores
        fornecedores = list(collection.find())

        # Verificar se há fornecedores para processar
        if not fornecedores:
            return jsonify({"message": "Nenhum fornecedor encontrado"}), 404

        # Criar o arquivo Excel em memória
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet('Fornecedores')

        # Definir um estilo de formatação
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1, 'align': 'center', 'valign': 'vcenter'})
        text_wrap_format = workbook.add_format({'text_wrap': True, 'border': 1, 'align': 'left', 'valign': 'top'})
        center_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'center'})
        date_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'center', 'num_format': 'yyyy-mm-dd'})

        # Definir as colunas
        colunas = [
            'Código Fornecedor', 'Nome', 'Email', 'Descrição', 'Observações', 
            'País', 'Cidade', 'Estado', 'CEP', 'Número', 'Site', 'CNPJ', 
            'Telefone', 'Produtos Vinculados', 'Data Cadastro', 'Inativo'
        ]

        # Adicionar cabeçalhos na primeira linha
        for col_num, col_name in enumerate(colunas):
            worksheet.write(0, col_num, col_name, header_format)

        # Ajustar largura das colunas com base no conteúdo
        worksheet.set_column('A:A', 20)  # Código Fornecedor
        worksheet.set_column('B:B', 30)  # Nome
        worksheet.set_column('C:C', 30)  # Email
        worksheet.set_column('D:D', 50)  # Descrição
        worksheet.set_column('E:E', 50)  # Observações
        worksheet.set_column('F:F', 20)  # País
        worksheet.set_column('G:G', 20)  # Cidade
        worksheet.set_column('H:H', 20)  # Estado
        worksheet.set_column('I:I', 15)  # CEP
        worksheet.set_column('J:J', 10)  # Número
        worksheet.set_column('K:K', 30)  # Site
        worksheet.set_column('L:L', 20)  # CNPJ
        worksheet.set_column('M:M', 15)  # Telefone
        worksheet.set_column('N:N', 50)  # Produtos Vinculados
        worksheet.set_column('O:O', 15)  # Data Cadastro
        worksheet.set_column('P:P', 10)  # Inativo

        # Preencher a planilha com os dados dos fornecedores
        for row_num, fornecedor in enumerate(fornecedores, start=1):
            produtos = ", ".join([str(produto) for produto in fornecedor.get('produtos', [])])

            worksheet.write(row_num, 0, fornecedor.get('codigo_fornecedor', ''), center_format)
            worksheet.write(row_num, 1, fornecedor.get('nome', ''), center_format)
            worksheet.write(row_num, 2, fornecedor.get('email', ''), center_format)
            worksheet.write(row_num, 3, fornecedor.get('descricao', ''), text_wrap_format)
            worksheet.write(row_num, 4, fornecedor.get('observacoes', ''), text_wrap_format)
            worksheet.write(row_num, 5, fornecedor.get('pais', ''), center_format)
            worksheet.write(row_num, 6, fornecedor.get('cidade', ''), center_format)
            worksheet.write(row_num, 7, fornecedor.get('estado', ''), center_format)
            worksheet.write(row_num, 8, fornecedor.get('cep', ''), center_format)
            worksheet.write(row_num, 9, fornecedor.get('numero', ''), center_format)
            worksheet.write(row_num, 10, fornecedor.get('site', ''), center_format)
            worksheet.write(row_num, 11, fornecedor.get('cnpj', ''), center_format)
            worksheet.write(row_num, 12, fornecedor.get('telefone', ''), center_format)
            worksheet.write(row_num, 13, produtos, text_wrap_format)
            worksheet.write(row_num, 14, fornecedor.get('dataCadastro', ''), date_format)
            worksheet.write(row_num, 15, "Sim" if fornecedor.get('inativo', False) else "Não", center_format)

        # Salvar o arquivo em memória
        workbook.close()
        output.seek(0)

        # Salvar o arquivo com um nome único
        nome_arquivo = 'lista_fornecedores.xlsx'
        nome_arquivo_limpo = limpar_nome_arquivo(nome_arquivo)

        # Salvar o arquivo no diretório de fornecedores
        caminho_arquivo = os.path.join(pasta_fornecedores, nome_arquivo_limpo)
        with open(caminho_arquivo, 'wb') as f:
            f.write(output.read())

        # Enviar o arquivo Excel para o cliente
        return send_file(caminho_arquivo, as_attachment=True)

    except Exception as e:
        return jsonify({"message": f"Ocorreu um erro: {str(e)}"}), 500


# Registrar o Blueprint
app.register_blueprint(Consultar_fornecedor_bp, url_prefix='/Cfornecedor')

# Rodar o aplicativo
if __name__ == '__main__':
    app.run(debug=True)
