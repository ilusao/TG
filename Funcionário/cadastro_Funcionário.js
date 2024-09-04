  // Validação do formulário
  (() => {
    'use strict';
    const form = document.querySelector('#employeeForm');

    form.addEventListener('submit', (event) => {
        if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
        }

        form.classList.add('was-validated');
    });
})();