// script.js

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se estamos na página inicial (index.html)
    // Se estivermos na home, limpamos o nome anterior para um novo começo
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        localStorage.removeItem('nomeAgente');
        console.log("Sistema A.I.D. reiniciado: Memória de agente limpa.");
    }

    const nomeSalvo = localStorage.getItem('nomeAgente');
    const inputNome = document.getElementById('nome-agente');
    
    if (nomeSalvo && inputNome) {
        inputNome.value = nomeSalvo;
    }
});

// script.js

function iniciarMissao(numero) {
    const nome = localStorage.getItem('nomeAgente');
    
    // Valida se o campo está vazio
    if (!nome || nome.trim() === "") {
        alert("Agente, identifique-se no campo 'Agente' antes de acessar os arquivos confidenciais!");
        const input = document.getElementById('nome-agente');
        if (input) input.focus();
        return;
    }

    // Se estiver tudo ok, segue para o caso
    window.location.href = `caso${numero}.html`;
}