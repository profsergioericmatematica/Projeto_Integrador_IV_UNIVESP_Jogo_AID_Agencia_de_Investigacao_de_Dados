// Configurações e Estado
let dadosRodada = [];
let graficosRodada = [];
let conexoesFeitas = 0;
const totalConexoes = 3;

// Controle de Interação
let dragOrigem = null; 
let linhaAtual = null;
let isMobile = false; // Detectaremos o tipo de interação

let dadosAgente = {
    nome: localStorage.getItem('nomeAgente') || "Agente",
    acertos: 0,
    erros: 0,
    dicasSolicitadas: 0,
    historicoDicas: [],
    detalhes: [], 
    inicio: Date.now()
};

/* ==========================================================================
   BANCO DE QUESTÕES DIDÁTICO
   ========================================================================== */
const bancoDeDados = [
    // --- LINHAS ---
    { id: 'L1', tipo: 'linha', titulo: "Monitorar a mudança de temperatura hora a hora.", dica: "Para ver continuidade/evolução temporal.", erroMsg: "Use Linhas para ver o tempo passando." },
    { id: 'L2', tipo: 'linha', titulo: "Valorização das ações de uma empresa no ano.", dica: "Oscilação (sobe/desce) ao longo do tempo.", erroMsg: "Histórico financeiro pede Linhas." },
    { id: 'L3', tipo: 'linha', titulo: "Crescimento da altura de uma planta por semanas.", dica: "Processo contínuo de evolução.", erroMsg: "Crescimento é continuidade, use Linhas." },
    // --- COLUNAS ---
    { id: 'C1', tipo: 'coluna', titulo: "Total de medalhas: Brasil vs Argentina vs EUA.", dica: "Ranking comparativo de quantidades.", erroMsg: "Categorias distintas lado a lado pedem Colunas." },
    { id: 'C2', tipo: 'coluna', titulo: "Quantidade de alunos por série (6º ao 9º).", dica: "Comparar volume entre grupos.", erroMsg: "Para comparar quantidades absolutas, use Colunas." },
    { id: 'C3', tipo: 'coluna', titulo: "Vendas de 5 vendedores (Quem vendeu mais?).", dica: "Ver quem é o campeão (pódio).", erroMsg: "Vendedores são categorias independentes, use Colunas." },
    // --- SETORES ---
    { id: 'S1', tipo: 'setor', titulo: "Divisão do salário (Aluguel, Comida, Lazer).", dica: "Fatias de um todo (100%).", erroMsg: "Para ver a proporção do gasto, use Pizza." },
    { id: 'S2', tipo: 'setor', titulo: "% de votos de cada candidato (Eleição).", dica: "Soma 100%. Ver a maioria.", erroMsg: "Para divisão de eleitorado, use Pizza." },
    { id: 'S3', tipo: 'setor', titulo: "Composição do ar (Nitrogênio, Oxigênio).", dica: "Ingredientes que formam o todo.", erroMsg: "Partes de um inteiro pedem Pizza." }
];

function iniciarJogo() {
    // Detecta se é dispositivo móvel (ajuste simples)
    isMobile = /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 800;

    // Sorteio
    const itemLinha = bancoDeDados.filter(i => i.tipo === 'linha').sort(() => 0.5 - Math.random())[0];
    const itemColuna = bancoDeDados.filter(i => i.tipo === 'coluna').sort(() => 0.5 - Math.random())[0];
    const itemSetor = bancoDeDados.filter(i => i.tipo === 'setor').sort(() => 0.5 - Math.random())[0];

    dadosRodada = [itemLinha, itemColuna, itemSetor].sort(() => 0.5 - Math.random());
    
    graficosRodada = [
        { tipo: 'linha', label: 'LINHAS (Evolução)', svg: `<svg viewBox="0 0 60 60"><path d="M5,55 L55,55 M5,5 L5,55" stroke="#ffff00" stroke-width="2"/><path d="M5,45 L15,25 L30,35 L55,10" stroke="#00ff41" stroke-width="3" fill="none"/></svg>` },
        { tipo: 'coluna', label: 'COLUNAS (Comparação)', svg: `<svg viewBox="0 0 60 60"><path d="M5,55 L55,55" stroke="#ffff00" stroke-width="2"/><rect x="10" y="25" width="10" height="30" fill="#00ff41"/><rect x="25" y="10" width="10" height="45" fill="#00ff41"/><rect x="40" y="35" width="10" height="20" fill="#00ff41"/></svg>` },
        { tipo: 'setor', label: 'SETORES (Proporção)', svg: `<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="25" fill="#003300" stroke="#ffff00" stroke-width="2"/><path d="M30,30 L30,5 A25,25 0 0,1 51.65,17.5 Z" fill="#00ff41"/></svg>` }
    ].sort(() => 0.5 - Math.random());

    renderizarPaineis();
    
    // Feedback de modo
    if(isMobile) {
        document.getElementById('agente-sigma').innerHTML += "<br><br><small style='color:#ffff00'>MODO MOBILE: Toque no item da esquerda, depois toque no gráfico da direita.</small>";
    }
}

function renderizarPaineis() {
    const divDados = document.getElementById('lista-dados');
    const divGraficos = document.getElementById('lista-graficos');

    divDados.innerHTML = '';
    dadosRodada.forEach(item => {
        // Eventos diferentes para PC e Mobile
        const eventos = isMobile 
            ? `onclick="selecionarOrigem(this)"` 
            : `onmousedown="startDrag(event, this)"`;

        divDados.innerHTML += `
            <div class="card-item card-dado" id="${item.id}" data-tipo="${item.tipo}" ${eventos}>
                <span style="font-size:0.85rem;">${item.titulo}</span>
                <div class="ponto-conexao ponto-dir"></div>
            </div>
        `;
    });

    divGraficos.innerHTML = '';
    graficosRodada.forEach(g => {
        // No mobile, o destino também é clicável
        const eventos = isMobile 
            ? `onclick="selecionarDestino(this)"` 
            : `onmouseup="endDrag(event, this)"`;

        divGraficos.innerHTML += `
            <div class="card-item card-grafico" id="target-${g.tipo}" data-tipo="${g.tipo}" ${eventos}>
                <div class="ponto-conexao ponto-esq"></div>
                <div class="icone-container">${g.svg}</div>
                <span>${g.label}</span>
            </div>
        `;
    });
}

// =========================================================
// MODO MOBILE (TAP-TO-TAP)
// =========================================================
function selecionarOrigem(elem) {
    if (elem.classList.contains('bloqueado')) return;

    // Remove seleção anterior
    document.querySelectorAll('.card-dado').forEach(el => el.style.borderColor = '#00ff41');
    
    // Marca o novo
    dragOrigem = elem;
    elem.style.borderColor = '#ffff00'; // Amarelo indica seleção
}

function selecionarDestino(elemDestino) {
    if (!dragOrigem) {
        alert("Primeiro selecione um dado da coluna da esquerda!");
        return;
    }
    if (elemDestino.classList.contains('bloqueado')) return;

    // Tenta validar
    const tipoOrigem = dragOrigem.getAttribute('data-tipo');
    const tipoDestino = elemDestino.getAttribute('data-tipo');
    const dadoObj = bancoDeDados.find(d => d.id === dragOrigem.id);

    if (tipoOrigem === tipoDestino) {
        // ACERTO
        dadosAgente.acertos++;
        
        // Cria uma linha visual fixa (simulada)
        criarLinhaFixa(dragOrigem, elemDestino);
        
        document.getElementById('agente-sigma').innerHTML = `<strong style="color:#00ff41">CONEXÃO CORRETA!</strong>`;
        
        // Registra
        dadosAgente.detalhes.push({
            questao: `Dado: ${dadoObj.titulo.substring(0,20)}...`,
            tipo: "ASSOCIAÇÃO",
            suaResposta: tipoDestino.toUpperCase(),
            respostaCerta: tipoOrigem.toUpperCase(),
            status: "ACERTO",
            feedback: "Escolha adequada."
        });

        // Bloqueia e limpa
        dragOrigem.style.borderColor = '#00ff41'; // Volta ao verde
        dragOrigem.classList.add('bloqueado');
        // elemDestino.classList.add('bloqueado'); // Opcional
        dragOrigem = null;
        
        conexoesFeitas++;
        verificarFim();

    } else {
        // ERRO
        dadosAgente.erros++;
        
        // Efeito visual de erro
        elemDestino.style.borderColor = '#ff4d4d';
        setTimeout(() => elemDestino.style.borderColor = '#ffff00', 500);

        document.getElementById('agente-sigma').innerHTML = `<strong style="color:#ff4d4d">INCOMPATÍVEL:</strong> ${dadoObj.erroMsg}`;
        
        dadosAgente.detalhes.push({
            questao: `Dado: ${dadoObj.titulo.substring(0,20)}...`,
            tipo: "ASSOCIAÇÃO",
            suaResposta: tipoDestino.toUpperCase(),
            respostaCerta: tipoOrigem.toUpperCase(),
            status: "ERRO",
            feedback: dadoObj.erroMsg
        });
        
        // Reseta seleção
        dragOrigem.style.borderColor = '#00ff41';
        dragOrigem = null;
    }
}

// =========================================================
// MODO DESKTOP (DRAG AND DROP)
// =========================================================
function startDrag(e, elem) {
    if (elem.classList.contains('bloqueado')) return;
    dragOrigem = elem;
    
    // Cria linha SVG
    const svg = document.getElementById('svg-layer');
    linhaAtual = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linhaAtual.setAttribute('stroke', '#ffff00');
    linhaAtual.setAttribute('stroke-width', '3');
    linhaAtual.setAttribute('stroke-dasharray', '5,5');
    
    const rect = elem.getBoundingClientRect();
    const svgRect = svg.getBoundingClientRect();
    const x1 = rect.right - svgRect.left - 6;
    const y1 = rect.top + (rect.height / 2) - svgRect.top;
    
    linhaAtual.setAttribute('x1', x1);
    linhaAtual.setAttribute('y1', y1);
    linhaAtual.setAttribute('x2', x1);
    linhaAtual.setAttribute('y2', y1);
    
    svg.appendChild(linhaAtual);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
}

function onMove(e) {
    if (!linhaAtual) return;
    const svg = document.getElementById('svg-layer');
    const svgRect = svg.getBoundingClientRect();
    linhaAtual.setAttribute('x2', e.clientX - svgRect.left);
    linhaAtual.setAttribute('y2', e.clientY - svgRect.top);
}

function onEnd(e) {
    if (!dragOrigem || !linhaAtual) return;
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onEnd);

    const elemDestino = e.target.closest('.card-grafico');

    if (elemDestino) {
        // Validação PC (similar à mobile, mas com a linha física)
        const tipoOrigem = dragOrigem.getAttribute('data-tipo');
        const tipoDestino = elemDestino.getAttribute('data-tipo');
        const dadoObj = bancoDeDados.find(d => d.id === dragOrigem.id);

        if (tipoOrigem === tipoDestino) {
            // ACERTO
            dadosAgente.acertos++;
            travarConexao(dragOrigem, elemDestino, linhaAtual); // Fixa a linha
            document.getElementById('agente-sigma').innerHTML = `<strong style="color:#00ff41">CONEXÃO BEM SUCEDIDA!</strong>`;
            
            dadosAgente.detalhes.push({
                questao: `Dado: ${dadoObj.titulo.substring(0,20)}...`,
                tipo: "ASSOCIAÇÃO",
                suaResposta: tipoDestino.toUpperCase(),
                respostaCerta: tipoOrigem.toUpperCase(),
                status: "ACERTO",
                feedback: "Escolha adequada."
            });
            conexoesFeitas++;
            verificarFim();
        } else {
            // ERRO
            dadosAgente.erros++;
            linhaAtual.remove(); // Apaga a linha errada
            elemDestino.classList.add('erro-temp');
            setTimeout(() => elemDestino.classList.remove('erro-temp'), 500);
            
            document.getElementById('agente-sigma').innerHTML = `<strong style="color:#ff4d4d">INCOMPATÍVEL:</strong> ${dadoObj.erroMsg}`;
            dadosAgente.detalhes.push({
                questao: `Dado: ${dadoObj.titulo.substring(0,20)}...`,
                tipo: "ASSOCIAÇÃO",
                suaResposta: tipoDestino.toUpperCase(),
                respostaCerta: tipoOrigem.toUpperCase(),
                status: "ERRO",
                feedback: dadoObj.erroMsg
            });
        }
    } else {
        linhaAtual.remove();
    }
    
    dragOrigem = null;
    linhaAtual = null;
}

// Função auxiliar para desenhar linha fixa no modo Mobile (sem arrastar)
function criarLinhaFixa(origem, destino) {
    const svg = document.getElementById('svg-layer');
    const svgRect = svg.getBoundingClientRect();
    const r1 = origem.getBoundingClientRect();
    const r2 = destino.getBoundingClientRect();

    const linha = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    linha.setAttribute('stroke', '#00ff41');
    linha.setAttribute('stroke-width', '3');
    
    // Coordenadas relativas ao SVG
    linha.setAttribute('x1', r1.right - svgRect.left - 6);
    linha.setAttribute('y1', r1.top + (r1.height/2) - svgRect.top);
    linha.setAttribute('x2', r2.left - svgRect.left + 6);
    linha.setAttribute('y2', r2.top + (r2.height/2) - svgRect.top);
    
    svg.appendChild(linha);
}

function travarConexao(origem, destino, linha) {
    linha.setAttribute('stroke', '#00ff41');
    linha.setAttribute('stroke-dasharray', '0');
    
    // Recalcula posições exatas para fixar
    const svg = document.getElementById('svg-layer');
    const svgRect = svg.getBoundingClientRect();
    const rDest = destino.getBoundingClientRect();
    
    const x2 = rDest.left - svgRect.left + 6; 
    const y2 = rDest.top + (rDest.height / 2) - svgRect.top;
    
    linha.setAttribute('x2', x2);
    linha.setAttribute('y2', y2);

    origem.classList.add('bloqueado');
}

function mostrarDica() {
    const itemAtivo = document.querySelector('.card-dado:not(.bloqueado)');
    if (itemAtivo) {
        const obj = bancoDeDados.find(d => d.id === itemAtivo.id);
        const box = document.getElementById('box-dica');
        box.style.display = 'block';
        box.innerHTML = `<strong>DICA TÁTICA:</strong> ${obj.dica}`;
        
        dadosAgente.dicasSolicitadas++;
        dadosAgente.historicoDicas.push(obj.titulo);
    }
}

function verificarFim() {
    if (conexoesFeitas === totalConexoes) {
        document.getElementById('btn-proximo-container').style.display = 'block';
        document.getElementById('agente-sigma').innerHTML = "PAINEL RECONFIGURADO.";
    }
}

function finalizarCaso() {
    const tempo = Math.floor((Date.now() - dadosAgente.inicio) / 1000);
    const hist = JSON.parse(localStorage.getItem('relatorioGeral') || "[]");
    hist.push({
        agente: dadosAgente.nome,
        caso: "03 - Painel de Controle",
        acertos: dadosAgente.acertos,
        erros: dadosAgente.erros,
        dicas: dadosAgente.dicasSolicitadas,
        tempo: tempo,
        detalhes: dadosAgente.detalhes
    });
    localStorage.setItem('relatorioGeral', JSON.stringify(hist));
    
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('resultado-final').style.display = 'block';
    document.getElementById('tabela-erros-container').innerHTML = `<p>Acertos: ${dadosAgente.acertos} | Erros: ${dadosAgente.erros}</p>`;
}

window.onload = function() {
    if(typeof carregarComponentes === "function") carregarComponentes();
    iniciarJogo();
};