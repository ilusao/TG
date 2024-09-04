function validarFormulario() {
    const nome = document.getElementById('nome').value;
    const codigo = document.getElementById('codigo').value;
    const preco = document.getElementById('preco').value;

    if (!nome) {
        alert('O campo Nome é obrigatório.');
        return false;
    }

    if (!codigo) {
        alert('O campo Código do Produto é obrigatório.');
        return false;
    }

    if (!preco || isNaN(preco)) {
        alert('O campo Preço deve ser numérico.');
        return false;
    }

    alert('Formulário validado com sucesso!');
}

// Array com os itens da dropdown list
const materiais = [
"Alumínio",
"Liga 6061",
"Liga 7075",
"Liga 7158",
"AISI 1020",
"AISI 1045",
"AISI 304",
"AISI 316",
"AISI 320",
"AISI 350"
];

// Função para criar os itens da dropdown list
function criarItensDropdown(materiais) {
const dropdownMenu = document.querySelector(".dropdown-menu");

materiais.forEach(material => {
const li = document.createElement("li");
li.classList.add("dropdown-item");
li.textContent = material;
dropdownMenu.appendChild(li);
});
}

// Chamar a função para criar os itens da dropdown list
criarItensDropdown(materiais);