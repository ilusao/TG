from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)  # Habilitar CORS

# Configuração do MongoDB
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
colecao_fornecedores = db['fornecedores']

# Rota para servir o HTML
@app.route('/cadastro-fornecedor')
def cadastro_fornecedor():
    caminho_html = os.path.join(os.getcwd(), 'Paginas/fornecedores')
    return send_from_directory(caminho_html, 'cadastro_fornecedor.html')

# Rota para registrar o fornecedor
@app.route('/registrar-fornecedor', methods=['POST'])
def registrar_fornecedor():
    dados = request.json
    resultado = colecao_fornecedores.insert_one(dados)
    return jsonify({"mensagem": "Fornecedor registrado com sucesso!", "id": str(resultado.inserted_id)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
