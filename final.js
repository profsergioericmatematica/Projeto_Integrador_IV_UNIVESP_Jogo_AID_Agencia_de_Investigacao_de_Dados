document.addEventListener("DOMContentLoaded", () => {
    carregarRelatorioCompleto();
});

let historicoFiltrado = []; // Variável global para o download

function carregarRelatorioCompleto() {
    const nomeAgente = localStorage.getItem('nomeAgente') || "Desconhecido";
    
    // Pega o histórico e filtra pelo agente atual para evitar dados de outros jogos
    const historicoBruto = JSON.parse(localStorage.getItem('relatorioGeral') || "[]");
    historicoFiltrado = historicoBruto.filter(item => item.agente === nomeAgente);

    if (historicoFiltrado.length === 0) {
        document.getElementById('loading').innerHTML = `
            <p style="color:#ff4d4d">Nenhum registro encontrado para o Agente: <strong>${nomeAgente}</strong>.</p>
            <p style="font-size:0.9rem; color:#aaa;">(Certifique-se de iniciar a missão pelo botão no início)</p>
            <button onclick="window.location.href='index.html'" style="margin-top:20px;">VOLTAR AO INÍCIO</button>
        `;
        return;
    }

    // Variáveis Globais
    let totalAcertos = 0;
    let totalQuestoes = 0;
    let totalDicas = 0;
    let tempoTotalSegundos = 0;

    const grid = document.getElementById('grid-cards');
    const logArea = document.getElementById('log-conteudo');
    grid.innerHTML = '';
    logArea.innerHTML = '';

    // Loop pelos casos
    historicoFiltrado.forEach((missao, index) => {
        // Normaliza dados
        const acertos = parseInt(missao.acertos) || 0;
        const erros = parseInt(missao.erros) || 0;
        const dicas = parseInt(missao.dicas) || 0;
        const tempo = parseInt(missao.tempo) || 0;
        const totalMissao = acertos + erros;

        // Acumula Totais
        totalAcertos += acertos;
        totalQuestoes += totalMissao;
        totalDicas += dicas;
        tempoTotalSegundos += tempo;

        // --- 1. CRIA O CARD DE RESUMO ---
        const card = document.createElement('div');
        card.className = 'card-caso';
        card.innerHTML = `
            <h3>${missao.caso || 'Missão Desconhecida'}</h3>
            <div class="dados-linha"><span>Precisão:</span><span class="dado-valor" style="color:${acertos >= erros ? '#00ff41' : '#ff4d4d'}">${acertos} / ${totalMissao}</span></div>
            <div class="dados-linha"><span>Tempo:</span><span class="dado-valor">${formatarTempo(tempo)}</span></div>
            <div class="dados-linha"><span>Dicas:</span><span class="uso-dicas">${dicas}</span></div>
        `;
        grid.appendChild(card);

        // --- 2. CRIA O LOG DETALHADO NA TELA ---
        let htmlDetalhes = `<div class="log-caso-box"><div class="log-caso-header">MISSÃO ${index + 1}: ${missao.caso}</div>`;
        
        if (missao.detalhes && missao.detalhes.length > 0) {
            missao.detalhes.forEach((d, i) => {
                const isAcerto = d.status === "ACERTO";
                const classeStatus = isAcerto ? "log-acerto" : "log-erro";
                const icone = isAcerto ? "✅" : "❌";
                
                htmlDetalhes += `
                    <div class="log-item ${classeStatus}">
                        <div class="log-pergunta">${i+1}. ${icone} ${d.questao}</div>
                        <div class="log-resposta">Sua Resposta: ${d.suaResposta}</div>
                        ${!isAcerto ? `<div class="log-correcao">Correto: ${d.respostaCerta}</div><div class="log-feedback">Nota: ${d.feedback}</div>` : ''}
                    </div>
                `;
            });
        } else {
            htmlDetalhes += `<div class="log-item" style="color:#666;">Nenhum detalhe tático registrado para esta etapa.</div>`;
        }
        htmlDetalhes += `</div>`;
        logArea.insertAdjacentHTML('beforeend', htmlDetalhes);
    });

    // --- CÁLCULOS FINAIS ---
    let eficiencia = totalQuestoes > 0 ? Math.round((totalAcertos / totalQuestoes) * 100) : 0;
    
    // Patentes
    let patente = "AGENTE EM TREINAMENTO";
    let corPatente = "#aaa";
    if (eficiencia >= 95) { patente = "LENDÁRIO (MESTRE DOS DADOS)"; corPatente = "#d4af37"; }
    else if (eficiencia >= 80) { patente = "AGENTE DE ELITE (SÊNIOR)"; corPatente = "#00ffff"; }
    else if (eficiencia >= 60) { patente = "AGENTE INVESTIGADOR"; corPatente = "#00ff41"; }
    else { patente = "AGENTE JÚNIOR"; corPatente = "#ff4d4d"; }

    // Preenche Cabeçalho
    document.getElementById('patente-texto').innerText = patente;
    document.getElementById('patente-texto').style.color = corPatente;
    document.getElementById('patente-texto').style.textShadow = `0 0 25px ${corPatente}`;
    
    document.getElementById('eficiencia-valor').innerText = `${eficiencia}%`;
    document.getElementById('eficiencia-valor').style.color = corPatente;
    
    document.getElementById('total-dicas-global').innerText = totalDicas;
    document.getElementById('tempo-total-global').innerText = formatarTempo(tempoTotalSegundos);

    // Mostra Painel
    document.getElementById('loading').style.display = 'none';
    document.getElementById('painel-conteudo').style.display = 'block';
}

function formatarTempo(segundos) {
    if (!segundos) return "0s";
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min}m ${sec < 10 ? '0' : ''}${sec}s`;
}

// --- GERAR TXT (COM OS MESMOS DADOS DA TELA) ---
function gerarRelatorioTXT() {
    const nome = localStorage.getItem('nomeAgente') || "Agente";
    const data = new Date().toLocaleString('pt-BR');
    
    // Recalcula tempo total para o cabeçalho do TXT
    let tempoTotalSegundos = historicoFiltrado.reduce((acc, m) => acc + (parseInt(m.tempo) || 0), 0);

    let conteudo = `=================================================\n`;
    conteudo += `   A.I.D. - RELATÓRIO OFICIAL DE MISSÃO DETALHADO   \n`;
    conteudo += `=================================================\n\n`;
    conteudo += `AGENTE: ${nome}\n`;
    conteudo += `DATA: ${data}\n`;
    conteudo += `PATENTE FINAL: ${document.getElementById('patente-texto').innerText}\n`;
    conteudo += `EFICIÊNCIA GLOBAL: ${document.getElementById('eficiencia-valor').innerText}\n`;
    conteudo += `TEMPO TOTAL: ${formatarTempo(tempoTotalSegundos)}\n`;
    conteudo += `DICAS TOTAIS: ${document.getElementById('total-dicas-global').innerText}\n\n`;
    
    conteudo += `=================================================\n`;
    conteudo += `   LOG TÁTICO - PASSO A PASSO   \n`;
    conteudo += `=================================================\n\n`;

    historicoFiltrado.forEach((m, i) => {
        conteudo += `-------------------------------------------------\n`;
        conteudo += `MISSÃO ${i+1}: ${m.caso.toUpperCase()}\n`;
        conteudo += `(Acertos: ${m.acertos} | Erros: ${m.erros} | Tempo: ${formatarTempo(m.tempo)} | Dicas: ${m.dicas})\n`;
        conteudo += `-------------------------------------------------\n`;

        if (m.detalhes && m.detalhes.length > 0) {
            m.detalhes.forEach((d, idx) => {
                const statusIcon = d.status === "ACERTO" ? "[OK]" : "[FALHA]";
                conteudo += `${idx+1}. ${statusIcon} ${d.questao}\n`;
                conteudo += `   > Sua Resposta: ${d.suaResposta}\n`;
                if (d.status === "ERRO") {
                    conteudo += `   > Correção: ${d.respostaCerta}\n`;
                    conteudo += `   > Feedback: ${d.feedback}\n`;
                }
                conteudo += `\n`;
            });
        } else {
            conteudo += `   (Nenhum detalhe tático registrado)\n\n`;
        }
        conteudo += `\n`;
    });

    conteudo += `=================================================\n`;
    conteudo += `FIM DO RELATÓRIO - DOCUMENTO CONFIDENCIAL\n`;
    conteudo += `=================================================`;

    const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Dossie_Completo_AID_${nome.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function encerrarJornada() {
    if (confirm("ATENÇÃO AGENTE:\n\nIsso apagará permanentemente seu histórico desta sessão.\nDeseja reiniciar o sistema?")) {
        localStorage.removeItem('relatorioGeral');
        localStorage.removeItem('nomeAgente');
        window.location.href = 'index.html';
    }
}