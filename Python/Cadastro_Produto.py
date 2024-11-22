from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Habilitar CORS

# Configuração do MongoDB
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
colecao = db['produtos']

# Rota para servir o HTML
@app.route('/cadastro-produto')
def cadastro_produto():
    # Caminho absoluto para o diretório onde está o HTML
    caminho_html = os.path.join(os.getcwd(), 'Paginas/produtos')
    return send_from_directory(caminho_html, 'cadastro_produto.html')

# Rota para registrar o produto
@app.route('/registrar', methods=['POST'])
def registrar_produto():
    dados = request.json
    resultado = colecao.insert_one(dados)
    return jsonify({"mensagem": "Produto registrado com sucesso!", "id": str(resultado.inserted_id)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
