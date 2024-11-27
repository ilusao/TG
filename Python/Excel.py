from flask import Flask
from flask_cors import CORS

# Importando os Blueprints de cada módulo
from Cadastro_Fornecedor import fornecedor_bp
from Cadastro_Produto import produto_bp
from Consultar_Estoque import estoque_bp

app = Flask(__name__)
CORS(app)

# Registrando os Blueprints
app.register_blueprint(fornecedor_bp, url_prefix='/fornecedor')
app.register_blueprint(produto_bp, url_prefix='/produto')
app.register_blueprint(estoque_bp, url_prefix='/estoque')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
