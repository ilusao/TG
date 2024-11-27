from flask import Blueprint, jsonify, request, send_from_directory
from pymongo import MongoClient
import os

# Definir o Blueprint
estoque_bp = Blueprint('estoque', __name__)

# Configuração do MongoDB
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
colecao_config = db['configuracoes']

@estoque_bp.route('/configuracao')
def configuracao():
    caminho_html = os.path.join(os.getcwd(), 'Paginas/configuracao')
    return send_from_directory(caminho_html, 'configuracao.html')

# Rota para salvar a configuração
@estoque_bp.route('/salvar-configuracao', methods=['POST'])
def salvar_configuracao():
    dados = request.json
    resultado = colecao_config.insert_one(dados)
    return jsonify({"mensagem": "Configuração salva com sucesso!", "id": str(resultado.inserted_id)})

