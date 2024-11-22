from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from pymongo import MongoClient
import os

app = Flask(__name__)
CORS(app)

# Configuração do MongoDB
client = MongoClient('mongodb+srv://TG:ilusao.com@funcionarios.avocc.mongodb.net/')
db = client['test']
colecao_config = db['configuracoes']

# Rota para servir o HTML
@app.route('/configuracao')
def configuracao():
    caminho_html = os.path.join(os.getcwd(), 'Paginas/configuracao')
    return send_from_directory(caminho_html, 'configuracao.html')

# Rota para salvar a configuração
@app.route('/salvar-configuracao', methods=['POST'])
def salvar_configuracao():
    dados = request.json
    resultado = colecao_config.insert_one(dados)
    return jsonify({"mensagem": "Configuração salva com sucesso!", "id": str(resultado.inserted_id)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
