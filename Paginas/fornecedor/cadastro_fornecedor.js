
         // Função para formatar a URL
         function formatarURL(url) {
            // Se o usuário começou a digitar sem protocolo, adicione automaticamente
            if (!/^https?:\/\//i.test(url)) {
                url = 'http://' + url;
            }
            return url;
        }

        // Evento de input para a URL
        document.getElementById('site').addEventListener('input', function(e) {
            this.value = formatarURL(this.value);
        });

         // Função de formatação de CNPJ enquanto o usuário digita
         function formatarCNPJ(cnpj) {
            cnpj = cnpj.replace(/\D/g, ""); // Remove tudo que não é dígito
            cnpj = cnpj.replace(/^(\d{2})(\d)/, "$1.$2"); // Coloca o ponto após os dois primeiros dígitos
            cnpj = cnpj.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3"); // Coloca o ponto após o segundo bloco de três dígitos
            cnpj = cnpj.replace(/\.(\d{3})(\d)/, ".$1/$2"); // Coloca a barra após o terceiro bloco de três dígitos
            cnpj = cnpj.replace(/(\d{4})(\d)/, "$1-$2"); // Coloca o hífen após o bloco de quatro dígitos
            return cnpj;
        }

        // Adicionando evento de input para formatar o CNPJ conforme o usuário digita
        document.getElementById('cnpj').addEventListener('input', function(e) {
            this.value = formatarCNPJ(this.value);
        });

        // Função de validação de CNPJ
        function validarCNPJ(cnpj) {
            cnpj = cnpj.replace(/[^\d]+/g,'');

            if(cnpj.length !== 14) return false;
           

            // Validação do primeiro dígito verificador
            var tamanho = cnpj.length - 2;
            var numeros = cnpj.substring(0,tamanho);
            var digitos = cnpj.substring(tamanho);
            var soma = 0;
            var pos = tamanho - 7;
            for (var i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            var resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(0)) return false;

            // Validação do segundo dígito verificador
            tamanho = tamanho + 1;
            numeros = cnpj.substring(0,tamanho);
            soma = 0;
            pos = tamanho - 7;
            for (var i = tamanho; i >= 1; i--) {
                soma += numeros.charAt(tamanho - i) * pos--;
                if (pos < 2) pos = 9;
            }
            resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
            if (resultado != digitos.charAt(1)) return false;

            return true;
        }

        // Validação do formulário
        (() => {
            'use strict';
            const form = document.querySelector('#supplierForm');
            form.addEventListener('submit', (event) => {
                const cnpjInput = document.querySelector('#cnpj');
                const emailInput = document.querySelector('#email');
                const siteInput = document.querySelector('#site');

                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                }

                // Validação do CNPJ
                if (!validarCNPJ(cnpjInput.value)) {
                    event.preventDefault();
                    event.stopPropagation();
                    cnpjInput.classList.add('is-invalid');
                    cnpjInput.nextElementSibling.textContent = 'Por favor, insira um CNPJ válido.';
                } else {
                    cnpjInput.classList.remove('is-invalid');
                }

                // Validação do E-mail
                const emailPattern = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
                if (!emailPattern.test(emailInput.value)) {
                    event.preventDefault();
                    event.stopPropagation();
                    emailInput.classList.add('is-invalid');
                    emailInput.nextElementSibling.textContent = 'Por favor, insira um e-mail válido.';
                } else {
                    emailInput.classList.remove('is-invalid');
                }

                // Validação da URL (opcional)
                if (siteInput.value && !siteInput.validity.valid) {
                    event.preventDefault();
                    event.stopPropagation();
                    siteInput.classList.add('is-invalid');
                    siteInput.nextElementSibling.textContent = 'Por favor, insira uma URL válida.';
                } else {
                    siteInput.classList.remove('is-invalid');
                }
                
                form.classList.add('was-validated');
            });
        })();