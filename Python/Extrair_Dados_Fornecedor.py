from bs4 import BeautifulSoup

# Carrega o conteúdo do arquivo HTML
with open("seu_arquivo.html", "r", encoding="utf-8") as file:
    html_content = file.read()

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

    # Armazena os dados do formulário
    form_data.append({
        "method": method,
        "action": action,
        "inputs": inputs
    })

# Exibe os dados extraídos
for index, data in enumerate(form_data, 1):
    print(f"Formulário {index}:")
    print(f"  Método: {data['method']}")
    print(f"  URL de Ação: {data['action']}")
    print("  Campos de Entrada:")
    for input_data in data["inputs"]:
        print(f"    Nome: {input_data['name']}, Tipo: {input_data['type']}, Valor: {input_data['value']}")
    print()
