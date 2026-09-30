function mascaraTelefone(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 11);

    if (n.length > 10) {
        // Celular: (11) 99999-9999
        return n.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2-$3');
    }
    if (n.length > 6) {
        // Fixo: (11) 9999-9999
        return n.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    }
    if (n.length > 2) {
        return n.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    if (n.length > 0) {
        return n.replace(/^(\d{0,2})/, '($1');
    }
    return '';
}

function mascaraCPF(valor) {
    const n = valor.replace(/\D/g, '').slice(0, 11);

    if (n.length > 9) {
        return n.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, '$1.$2.$3-$4');
    }
    if (n.length > 6) {
        return n.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    }
    if (n.length > 3) {
        return n.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
    }
    return n;
}

document.addEventListener('DOMContentLoaded', function () {
    const telefone = document.getElementById('telefone');
    const cpf = document.getElementById('cpf');

    if (telefone) {
        telefone.addEventListener('input', function () {
            this.value = mascaraTelefone(this.value);
        });
    }

    if (cpf) {
        cpf.addEventListener('input', function () {
            this.value = mascaraCPF(this.value);
        });
    }
});