// Configurações Globais
let questaoAtual = 0;
const totalQuestoes = 3;
let questoesSelecionadas = [];
let chartA = null;
let chartB = null;
let decisaoTomada = false;
let dicaUsadaNestaRodada = false;

let dadosAgente = {
    nome: localStorage.getItem('nomeAgente') || "Agente",
    acertos: 0,
    erros: 0,
    dicasSolicitadas: 0,
    detalhes: [],
    inicio: Date.now()
};

/* ==========================================================================
   BANCO DE QUESTÕES (REVISADO - REMOVIDAS AS QUESTÕES DE PIZZA/3D)
   ========================================================================== */
const bancoQuestoesCompleto = [
    // --- TIPO 1: ESCALA TRUNCADA (Eixo Y cortado) ---
    { 
        categoria: "TRUNCADA", 
        tipo_grafico: "bar", 
        manchete: "MANCHETE SUSPEITA: 'AUMENTO GIGANTE NA TARIFA DE ÔNIBUS'", 
        protocolo: "DICA TÁTICA: Olhe para a base da barra (Eixo Y). Ela começa no ZERO ou foi cortada para exagerar a diferença?", 
        explicacao: "FRAUDE: O gráfico manipulado cortou o eixo no valor 4,80. Isso faz uma diferença de centavos parecer visualmente enorme.", 
        grafico_honesto: { labels: ['2023', '2024'], data: [5.00, 5.20], yMin: 0, cor: '#00ff41' }, 
        grafico_fraude: { labels: ['2023', '2024'], data: [5.00, 5.20], yMin: 4.80, cor: '#ff4d4d' } 
    },
    { 
        categoria: "TRUNCADA", 
        tipo_grafico: "line", 
        manchete: "MANCHETE SUSPEITA: 'QUEDA CATASTRÓFICA NAS AÇÕES'", 
        protocolo: "DICA TÁTICA: Observe a escala lateral esquerda. O gráfico deu um 'zoom' exagerado em uma variação pequena?", 
        explicacao: "FRAUDE: A escala foi manipulada (de 97 a 100) para fazer uma queda normal de 1% parecer um colapso financeiro.", 
        grafico_honesto: { labels: ['Jan', 'Fev', 'Mar'], data: [100, 99, 98], yMin: 0, cor: '#00ff41' }, 
        grafico_fraude: { labels: ['Jan', 'Fev', 'Mar'], data: [100, 99, 98], yMin: 97, cor: '#ff4d4d' } 
    },
    {
        categoria: "TRUNCADA",
        tipo_grafico: "bar",
        manchete: "MANCHETE SUSPEITA: 'EXPLOSÃO DE IMPOSTOS ESTE ANO'",
        protocolo: "DICA TÁTICA: Compare o tamanho das barras com os números. A barra dobrou de tamanho, mas o número dobrou também?",
        explicacao: "FRAUDE: O eixo Y começou no valor 90. O imposto subiu de 100 para 110 (apenas 10%), mas o gráfico faz parecer que dobrou.",
        grafico_honesto: { labels: ['Ano Passado', 'Este Ano'], data: [100, 110], yMin: 0, cor: '#00ff41' },
        grafico_fraude: { labels: ['Ano Passado', 'Este Ano'], data: [100, 110], yMin: 90, cor: '#ff4d4d' }
    },

    // --- TIPO 2: OMISSÃO DE DADOS (Cherry Picking) ---
    { 
        categoria: "OMISSAO", 
        tipo_grafico: "line", 
        manchete: "MANCHETE SUSPEITA: 'CRIMINALIDADE FORA DE CONTROLE'", 
        protocolo: "DICA TÁTICA: Olhe o eixo do tempo. Ele mostra o ano todo ou 'recortou' apenas os meses ruins?", 
        explicacao: "FRAUDE: O gráfico omitiu os meses em que a criminalidade caiu e mostrou apenas os dois meses de alta.", 
        grafico_honesto: { labels: ['Jan', 'Mar', 'Mai', 'Jul', 'Set'], data: [10, 12, 80, 15, 10], yMin: 0, cor: '#00ff41' }, 
        grafico_fraude: { labels: ['Abr', 'Mai'], data: [75, 80], yMin: 0, cor: '#ff4d4d' } 
    },
    { 
        categoria: "OMISSAO", 
        tipo_grafico: "bar", 
        manchete: "MANCHETE SUSPEITA: 'NOSSA EMPRESA SÓ TEM LUCRO'", 
        protocolo: "DICA TÁTICA: O gráfico mostra o histórico completo ou escolheu apenas o melhor momento para exibir?", 
        explicacao: "FRAUDE: O gráfico escondeu os meses de prejuízo e exibiu isoladamente o único mês bom.", 
        grafico_honesto: { labels: ['Jan', 'Fev', 'Mar', 'Abr'], data: [5, 2, 80, 10], yMin: 0, cor: '#00ff41' }, 
        grafico_fraude: { labels: ['Mês Março'], data: [80], yMin: 0, cor: '#ff4d4d' } 
    },
    {
        categoria: "OMISSAO",
        tipo_grafico: "line",
        manchete: "MANCHETE SUSPEITA: 'AQUECIMENTO GLOBAL ACABOU?'",
        protocolo: "DICA TÁTICA: Fenômenos climáticos exigem longos períodos. O gráfico mostra décadas ou apenas 3 anos?",
        explicacao: "FRAUDE: Selecionaram apenas 3 anos atípicos de frio, ignorando a tendência de alta temperatura dos últimos 30 anos.",
        grafico_honesto: { labels: ['1990', '2000', '2010', '2020'], data: [14.0, 14.4, 14.8, 15.2], yMin: 13, cor: '#00ff41' },
        grafico_fraude: { labels: ['2016', '2017', '2018'], data: [14.9, 14.8, 14.7], yMin: 14, cor: '#ff4d4d' }
    }
];

function iniciarJogo() {
    // Nova Lógica de Sorteio: Embaralha tudo e pega os 3 primeiros
    // Isso evita problemas se uma categoria foi removida
    questoesSelecionadas = bancoQuestoesCompleto
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
        
    carregarCenario(0);
}

function carregarCenario(indice) {
    if (indice >= totalQuestoes) {
        finalizarCaso();
        return;
    }
    questaoAtual = indice;
    decisaoTomada = false;
    dicaUsadaNestaRodada = false;
    const q = questoesSelecionadas[indice];
    
    document.getElementById('manchete-texto').innerText = q.manchete;
    document.getElementById('texto-protocolo').innerText = q.protocolo;
    document.getElementById('painel-protocolo').style.display = 'none';
    document.getElementById('btn-dica').style.display = 'inline-block';
    document.getElementById('btn-proximo-container').style.display = 'none';
    document.getElementById('feedback-texto').innerHTML = "";
    document.getElementById('painel-botoes').style.display = 'block';
    
    document.querySelectorAll('.selo-resultado').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.monitor-grafico').forEach(el => el.className = 'monitor-grafico');
    document.querySelectorAll('.btn-fraude').forEach(btn => btn.disabled = false);

    const A_is_Honest = Math.random() < 0.5;
    q.lado_honesto = A_is_Honest ? 'A' : 'B';
    q.lado_fraude = A_is_Honest ? 'B' : 'A';

    renderizarGrafico('chartA', A_is_Honest ? q.grafico_honesto : q.grafico_fraude, q.tipo_grafico);
    renderizarGrafico('chartB', A_is_Honest ? q.grafico_fraude : q.grafico_honesto, q.tipo_grafico);
}

function renderizarGrafico(canvasId, dados, tipo) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if (canvasId === 'chartA' && chartA) chartA.destroy();
    if (canvasId === 'chartB' && chartB) chartB.destroy();

    let config = {
        type: tipo,
        data: {
            labels: dados.labels,
            datasets: [{
                label: 'Dados',
                data: dados.data,
                backgroundColor: dados.cor,
                borderColor: '#000',
                borderWidth: 1,
                fill: tipo === 'line'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: tipo === 'pie' } },
            animation: { duration: 0 },
            scales: tipo !== 'pie' ? { y: { beginAtZero: false, min: dados.yMin, max: dados.yMax } } : {}
        }
    };

    if (canvasId === 'chartA') chartA = new Chart(ctx, config);
    if (canvasId === 'chartB') chartB = new Chart(ctx, config);
}

function verificarFraude(escolhaAluno) {
    if (decisaoTomada) return;
    decisaoTomada = true;

    document.querySelectorAll('.btn-fraude').forEach(btn => btn.disabled = true);
    document.getElementById('btn-dica').style.display = 'none';

    const q = questoesSelecionadas[questaoAtual];
    const acertou = (escolhaAluno === q.lado_fraude);

    const monHonesto = document.getElementById(`monitor-${q.lado_honesto}`);
    const monFraude = document.getElementById(`monitor-${q.lado_fraude}`);
    monHonesto.classList.add('confirmado-honesto');
    monFraude.classList.add('confirmado-fraude');
    
    document.getElementById(`selo-${q.lado_honesto}`).innerText = "✅ HONESTO";
    document.getElementById(`selo-${q.lado_honesto}`).style.display = "block";
    document.getElementById(`selo-${q.lado_honesto}`).style.color = "#00ff41";
    document.getElementById(`selo-${q.lado_honesto}`).style.borderColor = "#00ff41";

    document.getElementById(`selo-${q.lado_fraude}`).innerText = "🚫 FRAUDE";
    document.getElementById(`selo-${q.lado_fraude}`).style.display = "block";
    document.getElementById(`selo-${q.lado_fraude}`).style.color = "#ff4d4d";
    document.getElementById(`selo-${q.lado_fraude}`).style.borderColor = "#ff4d4d";

    const feedbackDiv = document.getElementById('feedback-texto');
    if (acertou) {
        dadosAgente.acertos++;
        feedbackDiv.innerHTML = `<strong style="color:#00ff41">SUCESSO!</strong> <br>${q.explicacao}`;
    } else {
        dadosAgente.erros++;
        feedbackDiv.innerHTML = `<strong style="color:#ff4d4d">ERROU!</strong> Você validou a manipulação. <br>${q.explicacao}`;
    }

    dadosAgente.detalhes.push({
        questao: q.manchete,
        tipo: q.categoria,
        suaResposta: `Escolheu Gráfico ${escolhaAluno}`,
        respostaCerta: `Fraude era Gráfico ${q.lado_fraude}`,
        status: acertou ? "ACERTO" : "ERRO",
        feedback: q.explicacao
    });

    document.getElementById('painel-botoes').style.display = 'none';
    document.getElementById('btn-proximo-container').style.display = 'block';
}

function mostrarDica() {
    document.getElementById('painel-protocolo').style.display = 'block';
    if (!dicaUsadaNestaRodada) {
        dadosAgente.dicasSolicitadas++;
        dicaUsadaNestaRodada = true;
    }
}

function proximaQuestao() { carregarCenario(questaoAtual + 1); }

function finalizarCaso() {
    const tempo = Math.floor((Date.now() - dadosAgente.inicio) / 1000);
    const hist = JSON.parse(localStorage.getItem('relatorioGeral') || "[]");
    hist.push({
        agente: dadosAgente.nome,
        caso: "02 - Fraude Midiática",
        acertos: dadosAgente.acertos,
        erros: dadosAgente.erros,
        dicas: dadosAgente.dicasSolicitadas,
        tempo: tempo,
        detalhes: dadosAgente.detalhes
    });
    localStorage.setItem('relatorioGeral', JSON.stringify(hist));

    document.getElementById('game-container').style.display = 'none';
    document.getElementById('resultado-final').style.display = 'block';
    document.getElementById('score-final').innerText = `${dadosAgente.acertos}/${totalQuestoes}`;
    document.getElementById('dicas-final').innerText = dadosAgente.dicasSolicitadas;
}

window.onload = function() {
    if(typeof carregarComponentes === "function") carregarComponentes();
    iniciarJogo();
};