from flask import Blueprint, jsonify, request, send_file
import xlsxwriter
import os
import re
from datetime import datetime

# Definir o Blueprint
funcionario_bp = Blueprint('funcionario', __name__)

# Caminho onde os arquivos Excel serão armazenados
pasta_funcionarios = os.path.join(os.getcwd(), 'Excel', 'Funcionarios')

# Função para limpar o nome do arquivo, substituindo caracteres especiais por underscores
def limpar_nome_arquivo(nome):
    # Substitui caracteres especiais por underscores
    nome_limpo = re.sub(r'[^a-zA-Z0-9_]+', '_', nome)
    return nome_limpo

# Rota para gerar o Excel com os dados do funcionário específico
@funcionario_bp.route('/gerar-excel', methods=['POST'])
def gerar_excel():
    try:
        # Dados do funcionário recebidos do frontend
        funcionario = request.json

        # Verifica se a pasta 'Funcionarios' existe, caso contrário, cria
        if not os.path.exists(pasta_funcionarios):
            os.makedirs(pasta_funcionarios)

        # Nome do arquivo Excel: Usando o nome do funcionário ou o código dele
        nome_arquivo = limpar_nome_arquivo(funcionario['nome']) if funcionario.get('nome') else f"funcionario_{funcionario['codigoFuncionario']}"
        caminho_excel = os.path.join(pasta_funcionarios, f"funcionario_{nome_arquivo}.xlsx")

        # Criando o arquivo Excel no caminho desejado
        workbook = xlsxwriter.Workbook(caminho_excel)
        worksheet = workbook.add_worksheet()

        # Adicionando o cabeçalho (com todos os campos)
        worksheet.write('A1', 'Nome')
        worksheet.write('B1', 'Contato')
        worksheet.write('C1', 'Departamento')
        worksheet.write('D1', 'Código Funcionário')
        worksheet.write('E1', 'Turno')
        worksheet.write('F1', 'Serviço')
        worksheet.write('G1', 'Inativo')
        worksheet.write('H1', 'Cargo')
        worksheet.write('I1', 'Foto Perfil')
        worksheet.write('J1', 'Data Contratação')
        worksheet.write('K1', 'Data Promoção')
        worksheet.write('L1', 'Comportamento')
        worksheet.write('M1', 'Produtos Cadastrados')
        worksheet.write('N1', 'Metas Cumpridas')
        worksheet.write('O1', 'Tempo na Empresa (Dias)')
        worksheet.write('P1', 'Tempo na Empresa (Meses)')
        worksheet.write('Q1', 'Tempo na Empresa (Anos)')

        # Calculando o tempo na empresa
        def calcular_tempo_na_empresa(data_contratacao):
            contratacao_date = datetime.strptime(data_contratacao, '%Y-%m-%dT%H:%M:%S.%fZ')
            today = datetime.now()
            diff_in_days = (today - contratacao_date).days
            anos = diff_in_days // 365
            meses = (diff_in_days % 365) // 30
            dias = (diff_in_days % 365) % 30
            return anos, meses, dias

        anos, meses, dias = calcular_tempo_na_empresa(funcionario['dataContratacao'])

        # Preenchendo os dados do funcionário
        worksheet.write(1, 0, funcionario['nome'])
        worksheet.write(1, 1, funcionario.get('contato', ''))
        worksheet.write(1, 2, funcionario.get('departamento', ''))
        worksheet.write(1, 3, funcionario.get('codigoFuncionario', ''))
        worksheet.write(1, 4, funcionario.get('turno', ''))
        worksheet.write(1, 5, funcionario.get('servico', ''))
        worksheet.write(1, 6, funcionario.get('inativo', False))
        worksheet.write(1, 7, funcionario.get('cargo', ''))
        worksheet.write(1, 8, funcionario.get('fotoPerfil', ''))
        worksheet.write(1, 9, funcionario.get('dataContratacao', ''))
        worksheet.write(1, 10, funcionario.get('dataPromocao', ''))
        worksheet.write(1, 11, funcionario.get('comportamento', ''))

        # Produtos cadastrados e metas cumpridas
        produtos_cadastrados = ", ".join(funcionario.get('produtosCadastrados', []))
        metas_cumpridas = ", ".join(funcionario.get('metasCumpridas', []))

        worksheet.write(1, 12, produtos_cadastrados)
        worksheet.write(1, 13, metas_cumpridas)
        worksheet.write(1, 14, dias)
        worksheet.write(1, 15, meses)
        worksheet.write(1, 16, anos)

        # Fechando o arquivo Excel
        workbook.close()

        # Adicionando o print para verificar o caminho do arquivo
        print(f"Excel gerado com sucesso: {caminho_excel}")

        # Usando send_file para enviar o arquivo
        return send_file(caminho_excel, as_attachment=True)

    except Exception as e:
        # Log de erro detalhado para facilitar depuração
        print(f"Erro ao gerar Excel para funcionário {funcionario.get('nome', funcionario.get('codigoFuncionario'))}: {str(e)}")
        return jsonify({"error": str(e)}), 500
