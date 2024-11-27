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
    # Substitui caracteres especiais por underscores
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com os dados do fornecedor específico
@fornecedor_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        # Dados do fornecedor recebidos do Node.js
        fornecedor = request.json

        # Verifica se a pasta 'Fornecedores' existe, caso contrário, cria
        if not os.path.exists(pasta_fornecedores):
            os.makedirs(pasta_fornecedores)

        # Nome do arquivo Excel: Usando o nome do fornecedor ou o código dele
        nome_arquivo = limpar_nome_arquivo(fornecedor['nome']) if fornecedor.get('nome') else f"fornecedor_{fornecedor['codigo_fornecedor']}"
        caminho_excel = os.path.join(pasta_fornecedores, f"fornecedor_{nome_arquivo}.xlsx")

        # Criando o arquivo Excel no caminho desejado
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = workbook.add_worksheet()

        # Adicionando o cabeçalho (com todos os campos)
        worksheet.write('A1', 'ID')
        worksheet.write('B1', 'Nome')
        worksheet.write('C1', 'Email')
        worksheet.write('D1', 'Descrição')
        worksheet.write('E1', 'Observações')
        worksheet.write('F1', 'Pais')
        worksheet.write('G1', 'Cidade')
        worksheet.write('H1', 'Estado')
        worksheet.write('I1', 'CEP')
        worksheet.write('J1', 'Número')
        worksheet.write('K1', 'Site')
        worksheet.write('L1', 'CNPJ')
        worksheet.write('M1', 'Telefone')
        worksheet.write('N1', 'Código Fornecedor')
        worksheet.write('O1', 'Funcionario ID')
        worksheet.write('P1', 'Foto Fornecedor')
        worksheet.write('Q1', 'Produtos')
        worksheet.write('R1', 'Data Cadastro')
        worksheet.write('S1', 'Inativo')

        # Preenchendo os dados do fornecedor
        worksheet.write(2, 0, str(fornecedor['_id']))
        worksheet.write(2, 1, fornecedor['nome'])
        worksheet.write(2, 2, fornecedor['email'])
        worksheet.write(2, 3, fornecedor.get('descricao', ''))
        worksheet.write(2, 4, fornecedor.get('observacoes', ''))
        worksheet.write(2, 5, fornecedor.get('pais', ''))
        worksheet.write(2, 6, fornecedor.get('cidade', ''))
        worksheet.write(2, 7, fornecedor.get('estado', ''))
        worksheet.write(2, 8, fornecedor.get('cep', ''))
        worksheet.write(2, 9, fornecedor.get('numero', ''))
        worksheet.write(2, 10, fornecedor.get('site', ''))
        worksheet.write(2, 11, fornecedor['cnpj'])
        worksheet.write(2, 12, fornecedor.get('telefone', ''))
        worksheet.write(2, 13, fornecedor['codigo_fornecedor'])
        worksheet.write(2, 14, fornecedor['idFuncionario'])
        worksheet.write(2, 15, fornecedor.get('fotoFornecedor', ''))

        # Produtos podem ser uma lista de IDs, por isso vamos juntá-los em uma string separada por vírgulas
        produtos = ", ".join(str(produto) for produto in fornecedor.get('produtos', []))
        worksheet.write(2, 16, produtos)

        worksheet.write(2, 17, str(fornecedor['dataCadastro']))
        worksheet.write(2, 18, fornecedor['inativo'])

        # Fechando o arquivo Excel
        workbook.close()

        # Adicionando o print para verificar o caminho do arquivo
        print(f"Excel gerado com sucesso: {caminho_excel}")

        # Usando send_file para enviar o arquivo ao invés de send_from_directory
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log de erro detalhado para facilitar depuração
        print(f"Erro ao gerar Excel para fornecedor {fornecedor.get('nome', fornecedor.get('codigo_fornecedor'))}: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Abaixo segue a versão do código utilizando armazenamento em memória, sem salvar fisicamente o arquivo no servidor

# from flask import Blueprint, jsonify, request, send_file
# import xlsxwriter
# import os
# import re
# from io import BytesIO

# # Definir o Blueprint
# fornecedor_bp = Blueprint('fornecedor', __name__)

# # Caminho onde os arquivos Excel seriam armazenados (mas agora não será utilizado)
# pasta_fornecedores = os.path.join(os.getcwd(), 'Excel', 'Fornecedores')

# # Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
# def limpar_nome_arquivo(nome):
#     nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
#     return nome_limpo

# # Rota para gerar o Excel com os dados do fornecedor específico
# @fornecedor_bp.route('/gerar-excel', methods=['POST'])
# def gerar_excel():
#     try:
#         # Dados do fornecedor recebidos do Node.js
#         fornecedor = request.json

#         # Gerar Excel em memória
#         output = BytesIO()
#         workbook = xlsxwriter.Workbook(output)
#         worksheet = workbook.add_worksheet()

#         # Adicionando o cabeçalho
#         worksheet.write('A1', 'ID')
#         worksheet.write('B1', 'Nome')
#         worksheet.write('C1', 'Email')
#         worksheet.write('D1', 'Descrição')
#         worksheet.write('E1', 'Observações')
#         worksheet.write('F1', 'Pais')
#         worksheet.write('G1', 'Cidade')
#         worksheet.write('H1', 'Estado')
#         worksheet.write('I1', 'CEP')
#         worksheet.write('J1', 'Número')
#         worksheet.write('K1', 'Site')
#         worksheet.write('L1', 'CNPJ')
#         worksheet.write('M1', 'Telefone')
#         worksheet.write('N1', 'Código Fornecedor')
#         worksheet.write('O1', 'Funcionario ID')
#         worksheet.write('P1', 'Foto Fornecedor')
#         worksheet.write('Q1', 'Produtos')
#         worksheet.write('R1', 'Data Cadastro')
#         worksheet.write('S1', 'Inativo')

#         # Preenchendo os dados do fornecedor
#         worksheet.write(2, 0, str(fornecedor['_id']))
#         worksheet.write(2, 1, fornecedor['nome'])
#         worksheet.write(2, 2, fornecedor['email'])
#         worksheet.write(2, 3, fornecedor.get('descricao', ''))
#         worksheet.write(2, 4, fornecedor.get('observacoes', ''))
#         worksheet.write(2, 5, fornecedor.get('pais', ''))
#         worksheet.write(2, 6, fornecedor.get('cidade', ''))
#         worksheet.write(2, 7, fornecedor.get('estado', ''))
#         worksheet.write(2, 8, fornecedor.get('cep', ''))
#         worksheet.write(2, 9, fornecedor.get('numero', ''))
#         worksheet.write(2, 10, fornecedor.get('site', ''))
#         worksheet.write(2, 11, fornecedor['cnpj'])
#         worksheet.write(2, 12, fornecedor.get('telefone', ''))
#         worksheet.write(2, 13, fornecedor['codigo_fornecedor'])
#         worksheet.write(2, 14, fornecedor['idFuncionario'])
#         worksheet.write(2, 15, fornecedor.get('fotoFornecedor', ''))

#         # Produtos (caso existam)
#         produtos = ", ".join(str(produto) for produto in fornecedor.get('produtos', []))
#         worksheet.write(2, 16, produtos)

#         worksheet.write(2, 17, str(fornecedor['dataCadastro']))
#         worksheet.write(2, 18, fornecedor['inativo'])

#         # Fechando o workbook em memória
#         workbook.close()

#         # Rewind para o início do BytesIO
#         output.seek(0)

#         # Nome do arquivo para download
#         nome_arquivo = f"fornecedor_{limpar_nome_arquivo(fornecedor['nome'])}.xlsx"

#         # Enviar o arquivo Excel gerado diretamente para o cliente sem salvar fisicamente no servidor
#         return send_file(output, as_attachment=True, download_name=nome_arquivo, mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

#     except Exception as e:
#         print(f"Erro ao gerar Excel para fornecedor {fornecedor.get('nome', fornecedor.get('codigo_fornecedor'))}: {str(e)}")
#         return jsonify({"error": str(e)}), 500
