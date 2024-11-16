from bs4 import BeautifulSoup
from pathlib import Path

# Caminho do arquivo HTML
caminho_html = Path("C:/Users/JoaoGabriel_UserTemp/Documents/GitHub/TG/Paginas/fornecedor/cadastro_fornecedor.html")

# Abre e lê o conteúdo do arquivo HTML
with open(caminho_html, "r", encoding="utf-8") as arquivo:
    html_content = arquivo.read()

# Usa BeautifulSoup para fazer o parsing do HTML
soup = BeautifulSoup(html_content, "html.parser")

# Encontra todos os elementos <label> na página
labels = soup.find_all("label")

# Exibe os dados extraídos de cada label
for index, label_tag in enumerate(labels, 1):
    label_for = label_tag.get("for", "Não especificado")  # Atributo "for", se existir
    label_text = label_tag.text.strip()  # Texto do label, removendo espaços extras
    print(f"Label {index}:")
    print(f"  For: {label_for}")
    print(f"  Texto: {label_text}")
    print()
