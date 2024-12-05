from flask import Flask, Blueprint, jsonify, send_file
import xlsxwriter
import os
import re
from pymongo import MongoClient
import io

# Configurações do Flask
app = Flask(__name__)

# Definir o Blueprint
Consultar_fornecedor_bp = Blueprint('Cfornecedor', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_fornecedores = os.path.join(os.getcwd(), 'Excel', 'Fornecedores')

# Conectar ao MongoDB (Atualize com o MongoDB Atlas ou seu MongoDB local)
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test'] 
collection = db['fornecedores']  # Atualizado para "fornecedores"

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com a lista de fornecedores
@Consultar_fornecedor_bp.route('/gerar-list-excel', methods=['POST'])
def gerar_list_excel():
    try:
        # Recuperar todos os fornecedores
        fornecedores = list(collection.find())

        # Verificar se há fornecedores para processar
        if not fornecedores:
            return jsonify({"message": "Nenhum fornecedor encontrado"}), 404

        # Criando o arquivo Excel em memória
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet('Fornecedores')

        # Definir as colunas
        colunas = [
            'Nome', 'Email', 'Descrição', 'Observações', 'País', 
            'Cidade', 'Estado', 'CEP', 'Número', 'Site', 
            'CNPJ', 'Código Fornecedor', 'ID Funcionário'
        ]

        # Adicionando os cabeçalhos na primeira linha
        for col_num, col_name in enumerate(colunas):
            worksheet.write(0, col_num, col_name)

        # Preencher a planilha com os dados dos fornecedores
        for row_num, fornecedor in enumerate(fornecedores, start=1):
            worksheet.write(row_num, 0, fornecedor.get('nome', ''))
            worksheet.write(row_num, 1, fornecedor.get('email', ''))
            worksheet.write(row_num, 2, fornecedor.get('descricao', ''))
            worksheet.write(row_num, 3, fornecedor.get('observacoes', ''))
            worksheet.write(row_num, 4, fornecedor.get('pais', ''))
            worksheet.write(row_num, 5, fornecedor.get('cidade', ''))
            worksheet.write(row_num, 6, fornecedor.get('estado', ''))
            worksheet.write(row_num, 7, fornecedor.get('cep', ''))
            worksheet.write(row_num, 8, fornecedor.get('numero', ''))
            worksheet.write(row_num, 9, fornecedor.get('site', ''))
            worksheet.write(row_num, 10, fornecedor.get('cnpj', ''))
            worksheet.write(row_num, 11, fornecedor.get('codigo_fornecedor', ''))
            # Verificar se "idFuncionario" existe e contém "$oid"
            worksheet.write(row_num, 12, fornecedor.get('idFuncionario', {}).get('$oid', ''))

        # Fechar o arquivo Excel (salvar em memória)
        workbook.close()

        # Voltar para o início do arquivo
        output.seek(0)

        # Enviar o arquivo Excel como resposta
        return send_file(
            output, 
            as_attachment=True, 
            download_name="fornecedores_list.xlsx", 
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    
    except Exception as e:
        print(f"Erro ao gerar Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Registrar Blueprint
app.register_blueprint(Consultar_fornecedor_bp, url_prefix='/Cfornecedor')

# Rodar o servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)