from bs4 import BeautifulSoup
from flask import Flask, render_template_string, request

@app.route('/')
def formulario():
    return render_template_string(formulario_html)

# Rota para processar o envio do formulário
@app.route('/enviar', methods=['POST'])
def enviar_formulario():
    # Captura os dados enviados no formulário
    dados = {
        "nome": request.form.get("nome"),
        "descricao": request.form.get("descricao"),
        "email": request.form.get("email"),
        "observacoes": request.form.get("observacoes"),
        "pais": request.form.get("pais"),
        "cidade": request.form.get("cidade"),
        "estado": request.form.get("estado"),
        "site": request.form.get("site"),
        "cnpj": request.form.get("cnpj"),
        "inativo": request.form.get("inativo"),
        "preco": request.form.get("preco"),
    }

    # Exibe os dados recebidos no terminal ou os processa conforme necessário
    print("Dados do formulário recebidos:", dados)


# Executa o aplicativo Flask
if __name__ == '__main__':
    app.run(debug=True)