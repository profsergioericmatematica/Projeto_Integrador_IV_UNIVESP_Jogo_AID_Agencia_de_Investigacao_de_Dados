// Configurações Globais
let questaoAtual = 0;
const totalQuestoesMeta = 4;
let questoesSorteadoras = [];
let tempoInicioQuestao;
let dicaConsultadaNestaQuestao = false;

// ESTADO FIXO: SEMPRE 10 DISCOS
const TOTAL_FIXO = 10;
let qtdAzuis = 0;
let qtdVermelhos = 0;

let dadosAgente = {
    nome: localStorage.getItem('nomeAgente') || "Agente",
    acertos: 0,
    erros: 0,
    cliquesDica: 0,
    detalhes: [],
    inicio: Date.now()
};

/* BANCO DE QUESTÕES - CASO 01 */
const bancoQuestoes = [
    // 🟢 EVENTOS INDEPENDENTES (COM REPOSIÇÃO)
    { texto: "Você retirou uma evidência AZUL, escaneou e a DEVOLVEU para a maleta. Qual a chance de pegar um AZUL novamente?", tipo: 'independente', removido: null, alvo: 'azul' },
    { texto: "O Agente Sigma pegou um disco VERMELHO, anotou o código e o COLOCOU DE VOLTA. Chance de sair outro VERMELHO?", tipo: 'independente', removido: null, alvo: 'vermelho' },
    { texto: "Retiramos um disco AZUL por engano. Ele foi REPOSTO imediatamente. Qual a probabilidade de sortearmos um VERMELHO agora?", tipo: 'independente', removido: null, alvo: 'vermelho' },
    { texto: "A perícia analisou um chip VERMELHO e o DEVOLVEU ao lote. Qual a chance de pegarmos um disco AZUL na próxima?", tipo: 'independente', removido: null, alvo: 'azul' },
    { texto: "O sistema reiniciou e o disco AZUL retirado voltou para a maleta. Qual a chance de o próximo ser AZUL?", tipo: 'independente', removido: null, alvo: 'azul' },
    { texto: "Sorteamos um arquivo VERMELHO, mas o arquivo estava corrompido e foi DEVOLVIDO. Chance de sair VERMELHO de novo?", tipo: 'independente', removido: null, alvo: 'vermelho' },
    { texto: "Após a análise, o disco AZUL foi reintegrado às provas. Qual a chance de tirarmos um disco VERMELHO?", tipo: 'independente', removido: null, alvo: 'vermelho' },
    { texto: "O suspeito tentou roubar um disco VERMELHO, mas o recuperamos e DEVOLVEMOS à maleta. Chance de pegar um AZUL?", tipo: 'independente', removido: null, alvo: 'azul' },
    { texto: "Uma evidência AZUL caiu no chão, mas foi posta DE VOLTA na maleta. Qual a probabilidade de pegarmos ela (AZUL) de novo?", tipo: 'independente', removido: null, alvo: 'azul' },
    { texto: "O protocolo diz para OLHAR e DEVOLVER. Fizemos isso com um disco VERMELHO. Qual a chance do próximo ser VERMELHO?", tipo: 'independente', removido: null, alvo: 'vermelho' },

    // 🔴 EVENTOS DEPENDENTES (SEM REPOSIÇÃO)
    { texto: "Retiramos uma evidência AZUL e ela foi enviada para o LABORATÓRIO. Qual a chance de tirar outra AZUL?", tipo: 'dependente', removido: 'azul', alvo: 'azul' },
    { texto: "Um disco AZUL estava contaminado e foi DESTRUÍDO. Qual a probabilidade de o próximo ser AZUL?", tipo: 'dependente', removido: 'azul', alvo: 'azul' },
    { texto: "O Agente guardou um disco AZUL no bolso como prova. Qual a chance de ele pegar outro AZUL?", tipo: 'dependente', removido: 'azul', alvo: 'azul' },
    { texto: "Uma peça AZUL foi confiscada e NÃO VOLTA MAIS. Chance de sair outra peça AZUL?", tipo: 'dependente', removido: 'azul', alvo: 'azul' },
    { texto: "Separamos um arquivo AZUL para backup externo. Qual a chance de acharmos outro AZUL na maleta?", tipo: 'dependente', removido: 'azul', alvo: 'azul' },
    { texto: "Um disco VERMELHO foi isolado para perícia e FICOU FORA. Chance de tirar outro VERMELHO?", tipo: 'dependente', removido: 'vermelho', alvo: 'vermelho' },
    { texto: "O suspeito roubou um disco VERMELHO da maleta! Qual a chance de pegarmos outro VERMELHO?", tipo: 'dependente', removido: 'vermelho', alvo: 'vermelho' },
    { texto: "Queimamos um arquivo VERMELHO perigoso. Ele não existe mais. Chance de sair outro VERMELHO?", tipo: 'dependente', removido: 'vermelho', alvo: 'vermelho' },
    { texto: "Retiramos um VERMELHO sem reposição. Qual a nova probabilidade para sair outro VERMELHO?", tipo: 'dependente', removido: 'vermelho', alvo: 'vermelho' },
    { texto: "A primeira prova foi um disco VERMELHO e ela foi arquivada. Chance de a segunda prova ser VERMELHA?", tipo: 'dependente', removido: 'vermelho', alvo: 'vermelho' }
];

function gerenciarBotaoTeoria(mostrar) {
    const btn = document.querySelector('button[onclick="mostrarDica()"]');
    if (btn) btn.style.display = mostrar ? 'inline-block' : 'none';
}

function iniciarJogo() {
    qtdAzuis = Math.floor(Math.random() * 5) + 3; 
    qtdVermelhos = TOTAL_FIXO - qtdAzuis;

    const indep = bancoQuestoes.filter(q => q.tipo === 'independente');
    const dep = bancoQuestoes.filter(q => q.tipo === 'dependente');

    const selecionadasIndep = indep.sort(() => 0.5 - Math.random()).slice(0, 2);
    const selecionadasDep = dep.sort(() => 0.5 - Math.random()).slice(0, 2);

    questoesSorteadoras = [...selecionadasIndep, ...selecionadasDep].sort(() => 0.5 - Math.random());
    
    gerenciarBotaoTeoria(true);
    proximaQuestao();
}

function renderizarMaleta(corRemovida) {
    const maleta = document.getElementById('maleta');
    maleta.style.flexDirection = "column";
    
    let html = `<div class="linha-container" style="display:flex; align-items:center; margin-bottom:15px;">
            <span style="min-width:140px; font-size:0.9rem; color:#00ff41; font-weight:bold;">CENÁRIO ATUAL (10):</span>
            <div id="linha-antes" style="display:flex; gap:8px;">`;
    for(let i=0; i<qtdAzuis; i++) html += criarDisco('azul');
    for(let i=0; i<qtdVermelhos; i++) html += criarDisco('vermelho');
    html += `</div></div>`;

    html += `<div class="linha-container" style="display:flex; align-items:center;">
            <span style="min-width:140px; font-size:0.9rem; color:#ffff00; font-weight:bold;">APÓS AÇÃO:</span>
            <div id="linha-depois" style="display:flex; gap:8px;">`;
    
    let dAzul = qtdAzuis;
    let dVermelho = qtdVermelhos;
    if (corRemovida === 'azul') dAzul--; 
    if (corRemovida === 'vermelho') dVermelho--; 

    for(let i=0; i<dAzul; i++) html += criarDisco('azul');
    for(let i=0; i<dVermelho; i++) html += criarDisco('vermelho');
    html += `</div></div>`;
    
    maleta.innerHTML = html;
}

function criarDisco(cor) {
    const corHex = cor === 'azul' ? '#007bff' : '#ff4d4d';
    return `<div class="disco" style="width:35px; height:35px; border-radius:50%; background:${corHex}; box-shadow:0 0 10px ${corHex};"></div>`;
}

function calcularResposta(q) {
    let numerador, denominador;
    if (q.tipo === 'independente') {
        denominador = 10;
        numerador = (q.alvo === 'azul') ? qtdAzuis : qtdVermelhos;
    } else {
        denominador = 9;
        if (q.alvo === 'azul') {
            numerador = (q.removido === 'azul') ? qtdAzuis - 1 : qtdAzuis;
        } else {
            numerador = (q.removido === 'vermelho') ? qtdVermelhos - 1 : qtdVermelhos;
        }
    }
    return `${numerador}/${denominador}`;
}

function proximaQuestao() {
    dicaConsultadaNestaQuestao = false;
    document.getElementById('box-dica').style.display = 'none';
    const containerOpcoes = document.getElementById('opcoes');
    containerOpcoes.innerHTML = '';
    document.getElementById('agente-sigma').innerHTML = `<strong>AGENTE SIGMA:</strong> Analisando novo cenário...`;

    if (questaoAtual >= totalQuestoesMeta) {
        finalizarCaso();
        return;
    }

    const q = questoesSorteadoras[questaoAtual];
    renderizarMaleta(q.removido);
    const correta = calcularResposta(q);
    document.getElementById('enunciado').innerText = q.texto;
    gerarBotoes(correta);
}

function gerarBotoes(correta) {
    const container = document.getElementById('opcoes');
    let [num, den] = correta.split('/').map(Number);
    let opcoes = new Set([correta]);
    
    opcoes.add(`${num}/${den === 10 ? 9 : 10}`);
    opcoes.add(`${num > 1 ? num - 1 : num + 1}/${den}`);
    while(opcoes.size < 3) opcoes.add(`${Math.floor(Math.random()*8)+1}/${den}`);

    Array.from(opcoes).sort(() => 0.5 - Math.random()).forEach(alt => {
        const btn = document.createElement('button');
        btn.innerHTML = formatarFracao(alt);
        btn.onclick = () => verificarResposta(alt, correta);
        container.appendChild(btn);
    });
}

function formatarFracao(txt) {
    let [n, d] = txt.split('/');
    return `<span class="fracao"><span class="numerador">${n}</span><span class="denominador">${d}</span></span>`;
}

function verificarResposta(escolha, correta) {
    const q = questoesSorteadoras[questaoAtual];
    const acertou = escolha === correta;
    
    document.getElementById('opcoes').innerHTML = `<p class="texto-alerta">Sua escolha: ${formatarFracao(escolha)}</p>`;

    let feedbackMsg = "";
    if (acertou) {
        dadosAgente.acertos++;
        feedbackMsg = "Cálculo correto.";
        document.getElementById('agente-sigma').innerHTML = `<strong>AGENTE SIGMA:</strong> Positivo! ${feedbackMsg}`;
    } else {
        dadosAgente.erros++;
        feedbackMsg = q.tipo === 'dependente' ? "Erro: O disco não voltou, total muda." : "Erro: Houve reposição, total mantém.";
        document.getElementById('agente-sigma').innerHTML = `<strong>AGENTE SIGMA:</strong> Negativo. ${feedbackMsg} Correto: ${formatarFracao(correta)}.`;
    }

    dadosAgente.detalhes.push({
        questao: q.texto,
        tipo: q.tipo.toUpperCase(),
        suaResposta: escolha,
        respostaCerta: correta,
        status: acertou ? "ACERTO" : "ERRO",
        feedback: feedbackMsg
    });

    questaoAtual++;
    const btn = document.createElement('button');
    btn.innerText = questaoAtual < totalQuestoesMeta ? "PRÓXIMO CENÁRIO >>" : "RELATÓRIO FINAL";
    btn.onclick = proximaQuestao;
    btn.style.marginTop = "15px";
    document.getElementById('opcoes').appendChild(btn);
}

function mostrarDica() {
    const box = document.getElementById('box-dica');
    box.style.display = box.style.display === 'none' ? 'block' : 'none';
    if (!dicaConsultadaNestaQuestao) {
        dadosAgente.cliquesDica++;
        dicaConsultadaNestaQuestao = true;
    }
}

function finalizarCaso() {
    const tempo = Math.floor((Date.now() - dadosAgente.inicio) / 1000);
    const hist = JSON.parse(localStorage.getItem('relatorioGeral') || "[]");
    hist.push({
        agente: dadosAgente.nome,
        caso: "01 - Cofre Digital",
        acertos: dadosAgente.acertos,
        erros: dadosAgente.erros,
        dicas: dadosAgente.cliquesDica,
        tempo: tempo,
        detalhes: dadosAgente.detalhes
    });
    localStorage.setItem('relatorioGeral', JSON.stringify(hist));
    
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('box-dica').style.display = 'none';
    document.getElementById('resultado-final').style.display = 'block';
    document.getElementById('stats').innerHTML = `
        <p>ACERTOS: ${dadosAgente.acertos}/4 | DICAS: ${dadosAgente.cliquesDica}</p>
        <p>Dados enviados para o Dossiê Final.</p>
    `;
}

window.onload = function() {
    if(typeof carregarComponentes === "function") carregarComponentes();
    iniciarJogo();
};