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

# Função para tratar e formatar datas
def formatar_data(data):
    if isinstance(data, str):
        try:
            # Tentando converter string para formato de data
            return datetime.strptime(data, '%Y-%m-%d')
        except ValueError:
            return None  # Retorna None caso o formato esteja errado
    elif isinstance(data, datetime):
        return data
    return None

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

        # Definir um estilo de formatação
        header_format = workbook.add_format({'bold': True, 'bg_color': '#D3D3D3', 'border': 1, 'align': 'center', 'valign': 'vcenter'})
        text_wrap_format = workbook.add_format({'text_wrap': True, 'border': 1, 'align': 'left', 'valign': 'top'})
        center_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'center'})
        date_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'center', 'num_format': 'yyyy-mm-dd'})
        number_format = workbook.add_format({'border': 1, 'align': 'center', 'valign': 'center', 'num_format': '#,##0.00'})

        # Definir as colunas
        colunas = ['Código Produto', 'Nome', 'Descrição', 'Grupo', 'Subgrupo', 'Fornecedor', 
                   'Marca', 'Localização', 'Peso', 'Volume', 'Destino', 'Almoxerifado', 
                   'Data Entrada', 'Data Saída', 'Data Validade', 'Preço', 'Inflamável', 'Frágil', 'Movimentações']

        # Adicionando os cabeçalhos na primeira linha
        for col_num, col_name in enumerate(colunas):
            worksheet.write(0, col_num, col_name, header_format)

        # Ajustar a largura das colunas com base no conteúdo
        worksheet.set_column('A:A', 20)  # Código Produto
        worksheet.set_column('B:B', 30)  # Nome
        worksheet.set_column('C:C', 50)  # Descrição
        worksheet.set_column('D:D', 20)  # Grupo
        worksheet.set_column('E:E', 20)  # Subgrupo
        worksheet.set_column('F:F', 20)  # Fornecedor
        worksheet.set_column('G:G', 20)  # Marca
        worksheet.set_column('H:H', 20)  # Localização
        worksheet.set_column('I:I', 10)  # Peso
        worksheet.set_column('J:J', 10)  # Volume
        worksheet.set_column('K:K', 20)  # Destino
        worksheet.set_column('L:L', 20)  # Almoxerifado
        worksheet.set_column('M:M', 15)  # Data Entrada
        worksheet.set_column('N:N', 15)  # Data Saída
        worksheet.set_column('O:O', 15)  # Data Validade
        worksheet.set_column('P:P', 10)  # Preço
        worksheet.set_column('Q:Q', 12)  # Inflamável
        worksheet.set_column('R:R', 12)  # Frágil
        worksheet.set_column('S:S', 12)  # Movimentações

        # Preencher a planilha com os dados dos produtos
        for row_num, produto in enumerate(produtos, start=1):
            # Obter e formatar as datas
            data_entrada = formatar_data(produto.get('data_entrada', None))
            data_saida = formatar_data(produto.get('data_saida', None))
            data_validade = formatar_data(produto.get('data_validade', None))

            # Se a "Data Saída" for None ou estiver ausente, podemos colocar "Não definida" ou uma célula vazia
            if not data_saida:
                data_saida = 'Não definida'  # Ou pode ser '' (célula vazia)

            # Escrever os dados na planilha
            worksheet.write(row_num, 0, produto.get('codigo_produto', ''), center_format)
            worksheet.write(row_num, 1, produto.get('nome', ''), center_format)
            worksheet.write(row_num, 2, produto.get('descricao_pdv', ''), text_wrap_format)
            worksheet.write(row_num, 3, produto.get('grupo', ''), center_format)
            worksheet.write(row_num, 4, produto.get('sub_grupo', ''), center_format)
            worksheet.write(row_num, 5, produto.get('fornecedor', ''), center_format)
            worksheet.write(row_num, 6, produto.get('marca', ''), center_format)
            worksheet.write(row_num, 7, produto.get('localizacao', ''), center_format)
            worksheet.write(row_num, 8, produto.get('peso', 0), number_format)
            worksheet.write(row_num, 9, produto.get('volume', 0), number_format)
            worksheet.write(row_num, 10, produto.get('destino', ''), center_format)
            worksheet.write(row_num, 11, produto.get('almoxerifado', ''), center_format)
            worksheet.write(row_num, 12, data_entrada if data_entrada else '', date_format)
            worksheet.write(row_num, 13, data_saida, text_wrap_format)
            worksheet.write(row_num, 14, data_validade if data_validade else '', date_format)
            worksheet.write(row_num, 15, produto.get('preco', 0), number_format)
            worksheet.write(row_num, 16, produto.get('inflamavel', False), center_format)
            worksheet.write(row_num, 17, produto.get('fragil', False), center_format)
            worksheet.write(row_num, 18, produto.get('movimentacoes', 0), number_format)

        # Adicionando as fórmulas de soma
        worksheet.write('B22', 'Total de Preço', header_format)
        worksheet.write_formula('B23', f'SUM(P2:P{len(produtos) + 1})', number_format)
        worksheet.write('B24', 'Total de Peso', header_format)
        worksheet.write_formula('B25', f'SUM(I2:I{len(produtos) + 1})', number_format)
        worksheet.write('B26', 'Total de Volume', header_format)
        worksheet.write_formula('B27', f'SUM(J2:J{len(produtos) + 1})', number_format)

        # Contar quantos produtos existem por almoxerifado
        almoxerifado_contagem = {}
        for produto in produtos:
            almoxerifado = produto.get('almoxerifado', '')
            if almoxerifado:
                if almoxerifado in almoxerifado_contagem:
                    almoxerifado_contagem[almoxerifado] += 1
                else:
                    almoxerifado_contagem[almoxerifado] = 1

        # Criar uma lista de almoxerifado e a quantidade correspondente
        almoxerifado_list = list(almoxerifado_contagem.items())

        # Escrever esses dados em uma nova seção da planilha
        worksheet.write('A30', 'Almoxerifado', header_format)
        worksheet.write('B30', 'Quantidade de Produtos', header_format)

        for row_num, (almoxerifado, quantidade) in enumerate(almoxerifado_list, start=30):
            worksheet.write(row_num, 0, almoxerifado, center_format)
            worksheet.write(row_num, 1, quantidade, center_format)

        # Adicionar um gráfico de barras para mostrar a quantidade de produtos por almoxerifado
        chart = workbook.add_chart({'type': 'column'})
        chart.add_series({
            'name': 'Quantidade de Produtos',
            'categories': f'=Produtos!$A$31:$A${30 + len(almoxerifado_list)}',
            'values': f'=Produtos!$B$31:$B${30 + len(almoxerifado_list)}',
        })
        chart.set_title({'name': 'Quantidade de Produtos por Almoxerifado'})
        chart.set_x_axis({'name': 'Almoxerifado'})
        chart.set_y_axis({'name': 'Quantidade de Produtos'})

        # Inserir o gráfico na planilha
        worksheet.insert_chart('D21', chart, {'x_offset': 25, 'y_offset': 25})

        # Salvar o arquivo em memória
        workbook.close()
        output.seek(0)

        # Salvar o arquivo com um nome único
        nome_arquivo = 'lista_produtos.xlsx'
        nome_arquivo_limpo = limpar_nome_arquivo(nome_arquivo)

        # Salvar o arquivo no diretório de produtos
        caminho_arquivo = os.path.join(pasta_produtos, nome_arquivo_limpo)
        with open(caminho_arquivo, 'wb') as f:
            f.write(output.read())

        # Enviar o arquivo Excel para o cliente
        return send_file(caminho_arquivo, as_attachment=True)

    except Exception as e:
        return jsonify({"message": f"Ocorreu um erro: {str(e)}"}), 500


# Registrar o Blueprint
app.register_blueprint(Consultar_produto_bp, url_prefix='/Cproduto')

# Rodar o aplicativo
if __name__ == '__main__':
    app.run(debug=True)
