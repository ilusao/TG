from bs4 import BeautifulSoup

# Exemplo de HTML que representa a resposta do servidor (substitua com o conteúdo da resposta)
html_content = """
<!-- coloque aqui o conteúdo HTML do formulário, substituindo esse comentário -->
"""

# Carregando o HTML com BeautifulSoup
soup = BeautifulSoup(html_content, 'html.parser')

# Extraindo os campos do formulário
dados_formulario = {
    'nome': soup.find('input', {'id': 'nome'})['placeholder'],
    'descricao': soup.find('input', {'id': 'descricao'})['value'] if soup.find('input', {'id': 'descricao'}) else None,
    'email': soup.find('input', {'id': 'email'})['placeholder'],
    'observacoes': soup.find('input', {'id': 'observacoes'})['placeholder'],
    'pais': soup.find('input', {'id': 'pais'})['value'] if soup.find('input', {'id': 'pais'}) else None,
    'cidade': soup.find('input', {'id': 'cidade'})['value'] if soup.find('input', {'id': 'cidade'}) else None,
    'estado': soup.find('input', {'id': 'estado'})['value'] if soup.find('input', {'id': 'estado'}) else None,
    'site': soup.find('input', {'id': 'site'})['placeholder'],
    'cnpj': soup.find('input', {'id': 'cnpj'})['placeholder'],
    'inativo': soup.find('select', {'id': 'inativo'}).find('option', selected=True).text if soup.find('select', {'id': 'inativo'}) else None,
    'preco': soup.find('input', {'id': 'preco'})['placeholder']
}

# Exibindo os dados extraídos
for campo, valor in dados_formulario.items():
    print(f"{campo}: {valor}")
