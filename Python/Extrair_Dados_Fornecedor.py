from bs4 import BeautifulSoup
from pathlib import Path

# Caminho do arquivo HTML
caminho_html = Path("C:/Users/joaob/OneDrive/Documentos/GitHub/TG-3/Paginas/produto/teste.html")

# Abre e lê o conteúdo do arquivo HTML
with open(caminho_html, "r", encoding="utf-8") as arquivo:
    html_content = arquivo.read()

# Usa BeautifulSoup para fazer o parsing do HTML
soup = BeautifulSoup(html_content, "html.parser")

# Encontra todos os elementos <form> na página
forms = soup.find_all("form")

# Lista para armazenar os dados dos forms
form_data = []

# Itera sobre cada form e extrai os dados
for form in forms:
    # Extrai o método e a ação (URL) do form
    method = form.get("method", "GET").upper()  # Padrão: GET
    action = form.get("action", "")

    # Extrai todos os inputs do form
    inputs = []
    for input_tag in form.find_all("input"):
        input_data = {
            "name": input_tag.get("name"),
            "type": input_tag.get("type", "text"),  # Padrão: text
            "value": input_tag.get("value", "")
        }
        inputs.append(input_data)

    # Extrai todos os labels do form
    labels = []
    for label_tag in form.find_all("label"):
        label_data = {
            "for": label_tag.get("for"),
            "text": label_tag.text.strip()  # Extrai o texto da label e remove espaços extras
        }
        labels.append(label_data)

    # Armazena os dados do formulário, incluindo labels
    form_data.append({
        "method": method,
        "action": action,
        "inputs": inputs,
        "labels": labels
    })

# Exibe os dados extraídos
for index, data in enumerate(form_data, 1):
    print(f"Formulário {index}:")
    print(f"  Método: {data['method']}")
    print(f"  URL de Ação: {data['action']}")
    print("  Campos de Entrada:")
    for input_data in data["inputs"]:
        print(f"    Nome: {input_data['name']}, Tipo: {input_data['type']}, Valor: {input_data['value']}")
    print("  Labels:")
    for label_data in data["labels"]:
        print(f"    For: {label_data['for']}, Texto: {label_data['text']}")
    print()
