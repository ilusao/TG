from flask import Flask, Blueprint, jsonify, send_file
import xlsxwriter
import os
import re
from pymongo import MongoClient
import io

# Configurações do Flask
app = Flask(__name__)

# Definir o Blueprint
Consultar_produto_bp = Blueprint('Cproduto', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_produtos = os.path.join(os.getcwd(), 'Excel', 'Produtos')

# Conectar ao MongoDB (Atualize com o MongoDB Atlas ou seu MongoDB local)
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test'] 
collection = db['produtos']

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com a lista de produtos
@Consultar_produto_bp.route('/gerar-list-excel', methods=['POST'])
def gerar_list_excel():
    try:
        # Recuperar todos os produtos
        produtos = list(collection.find())

        # Verificar se há produtos para processar
        if not produtos:
            return jsonify({"message": "Nenhum produto encontrado"}), 404

        # Criando o arquivo Excel em memória
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet('Produtos')

        # Definir as colunas
        colunas = ['Código Produto', 'Nome', 'Descrição', 'Grupo', 'Subgrupo', 'Fornecedor', 
                   'Marca', 'Localização', 'Peso', 'Volume', 'Destino', 'Almoxerifado', 
                   'Data Entrada', 'Data Saída', 'Data Validade', 'Preço', 'Inflamável', 'Frágil', 'Movimentações']

        # Adicionando os cabeçalhos na primeira linha
        for col_num, col_name in enumerate(colunas):
            worksheet.write(0, col_num, col_name)

        # Preencher a planilha com os dados dos produtos
        for row_num, produto in enumerate(produtos, start=1):
            worksheet.write(row_num, 0, produto.get('codigo_produto', ''))
            worksheet.write(row_num, 1, produto.get('nome', ''))
            worksheet.write(row_num, 2, produto.get('descricao_pdv', ''))
            worksheet.write(row_num, 3, produto.get('grupo', ''))
            worksheet.write(row_num, 4, produto.get('sub_grupo', ''))
            worksheet.write(row_num, 5, produto.get('fornecedor', ''))
            worksheet.write(row_num, 6, produto.get('marca', ''))
            worksheet.write(row_num, 7, produto.get('localizacao', ''))
            worksheet.write(row_num, 8, produto.get('peso', ''))
            worksheet.write(row_num, 9, produto.get('volume', ''))
            worksheet.write(row_num, 10, produto.get('destino', ''))
            worksheet.write(row_num, 11, produto.get('almoxerifado', ''))
            worksheet.write(row_num, 12, str(produto.get('data_entrada', '')))
            worksheet.write(row_num, 13, str(produto.get('data_saida', '')))
            worksheet.write(row_num, 14, str(produto.get('data_validade', '')))
            worksheet.write(row_num, 15, produto.get('preco', ''))
            worksheet.write(row_num, 16, produto.get('inflamavel', False))
            worksheet.write(row_num, 17, produto.get('fragil', False))
            worksheet.write(row_num, 18, produto.get('movimentacoes', 0))

        # Fechar o arquivo Excel (salvar em memória)
        workbook.close()

        # Voltar para o início do arquivo
        output.seek(0)

        # Enviar o arquivo Excel como resposta
        return send_file(output, as_attachment=True, download_name="produtos_list.xlsx", mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    
    except Exception as e:
        print(f"Erro ao gerar Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Registrar Blueprint
app.register_blueprint(Consultar_produto_bp, url_prefix='/Cproduto')

# Rodar o servidor
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
