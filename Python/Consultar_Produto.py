from flask import Blueprint, jsonify, request, send_file
import xlsxwriter
import os
import re

# Definir o Blueprint
Consultar_produto_bp = Blueprint('Cproduto', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_produtos = os.path.join(os.getcwd(), 'Excel', 'Produtos')

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

@Consultar_produto_bp.route('/gerar-list-excel', methods=['POST'])
def gerar_list_excel():
    try:
        # Criando o arquivo Excel
        workbook = xlsxwriter.Workbook(caminho_excel)
    
     # Recuperar todos os documentos da coleção
        documentos = list(collection.find())

        # Verificar se há dados para processar
        if not documentos:
            print("Nenhum registro encontrado na coleção.")
            return

        # Converter os documentos em um DataFrame do pandas
        df = pd.DataFrame(documentos)

        # Opcional: remover o campo '_id' se não for necessário no Excel
        if '_id' in df.columns:
            df.drop(columns=['_id'], inplace=True)

       
        # Nome do arquivo Excel
        nome_arquivo = limpar_nome_arquivo(produto['nome']) if produto.get('nome') else f"produto_{produto['codigo_produto']}"
        caminho_excel = os.path.join(pasta_produtos, f"produto_{nome_arquivo}.xlsx")

    except Exception as e:
        print(f"Erro ao gerar o arquivo Excel: {e}")
     # Fechando o arquivo
        workbook.close()

        print(f"Excel gerado com sucesso: {caminho_excel}")

        # Enviando o arquivo gerado
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log do erro detalhado
        print(f"Erro ao gerar Excel: {str(e)}")
        return jsonify({"error": str(e)}), 500