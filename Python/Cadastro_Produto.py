from flask import Blueprint, jsonify, request, send_from_directory
from pymongo import MongoClient
import os

# Definir o Blueprint
produto_bp = Blueprint('produto', __name__)

# Configuração do MongoDB
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
colecao = db['produtos']

@produto_bp.route('/cadastro-produto')
def cadastro_produto():
    # Caminho absoluto para o diretório onde está o HTML
    caminho_html = os.path.join(os.getcwd(), 'Paginas/produtos')
    return send_from_directory(caminho_html, 'cadastro_produto.html')

# Rota para registrar o produto
@produto_bp.route('/registrar', methods=['POST'])
def registrar_produto():
    dados = request.json
    resultado = colecao.insert_one(dados)
    return jsonify({"mensagem": "Produto registrado com sucesso!", "id": str(resultado.inserted_id)})
