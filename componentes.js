// Função para carregar os componentes fixos da A.I.D.
function carregarComponentes() {
    // 1. Identifica a página atual
    const estaNaHome = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname === '/' || 
                       window.location.pathname.endsWith('/');

    // 2. Define os atributos do input baseado na página
    // Se não estiver na home, adicionamos 'readonly' e uma classe para estilo
    const atributoReadonly = estaNaHome ? "" : "readonly";
    const classeBloqueio = estaNaHome ? "" : "input-bloqueado";

    const headerHTML = `
    <header class="header-agencia">
        <div class="logo-area">
            <h1>A.I.D. - Agência de Investigação de Dados</h1>
        </div>
        <div class="status-area">
            <span class="status-blink">Status: Online</span>
            <div class="input-agente">
                <label for="nome-agente">Agente:</label>
                <input type="text" 
                       id="nome-agente" 
                       class="input-destaque ${classeBloqueio}" 
                       placeholder="Digite seu nome..." 
                       oninput="salvarNomeAgente(this.value)"
                       ${atributoReadonly}> 
            </div>
        </div>
    </header>`;

const footerHTML = `
<footer class="terminal-footer">
    <div class="footer-content">
        <p><strong>Projeto Integrador IV</strong></p>
        <p>UNIVESP - BNCC - Matemática - Licenciatura - Estatística - Probabilidade</p>
        
        <div class="github-area">
            <a href="https://github.com/profsergioericmatematica/Projeto_Integrador_IV_UNIVESP_Jogo_AID_Agencia_de_Investiga-o_de_Dados" 
               target="_blank" class="btn-github">
               <span class="icon">📁</span> Ver código Fonte no GitHub
            </a>
        </div>

        <p class="autores">
            @2026: Antonio Antunes Junior • Flávio Rabelo Barros • Giovani Machado de Lima • 
            Mariane Mendes Coutinho • Priscilla Santiago Zamorra • Rodrigo Aires de Medeiros Correa • 
            Sergio Eric Reis de Oliveira • Vitor Correa Uberti
        </p>
        
        <p class="licenca">
            Licenciatura em Matemática - UNIVESP 2026 • Produto Educacional (REA) sob MIT License
        </p>
      </div>
</footer>`;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    
    // Lógica de recuperação de nome
    if (estaNaHome) {
        localStorage.removeItem('nomeAgente');
        console.log("A.I.D. - Sessão reiniciada.");
    } else {
        const nomeSalvo = localStorage.getItem('nomeAgente');
        if (nomeSalvo && document.getElementById('nome-agente')) {
            document.getElementById('nome-agente').value = nomeSalvo;
        }
    }
}

function salvarNomeAgente(nome) {
    localStorage.setItem('nomeAgente', nome);
}

window.onload = carregarComponentes;

