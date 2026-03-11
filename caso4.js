// Configurações Globais
let dadosAgente = {
    nome: localStorage.getItem('nomeAgente') || "Agente",
    acertos: 0,
    erros: 0,
    dicasSolicitadas: 0,
    detalhes: [],
    inicio: Date.now()
};

let cenarioAtual = {};

/* BANCO DE CENÁRIOS (Cada um com seus próprios dados e respostas) */
const bancoCenarios = [
    {
        id: 1,
        tema: "TEMPO DE TELA (Jovens)",
        unidade: "HORAS/DIA",
        // Dados: [2, 5, 5, 8, 20]
        // Amplitude: 20 - 2 = 18
        // Média: 40 / 5 = 8
        // Moda: 5
        // Mediana: 5
        dados: [
            { nome: "Ana", valor: 2 },
            { nome: "Beto", valor: 5 },
            { nome: "Carla", valor: 5 },
            { nome: "Dani", valor: 8 },
            { nome: "Edu", valor: 20 }
        ],
        respostas: { amplitude: 18, media: 8, moda: 5, mediana: 5 }
    },
    {
        id: 2,
        tema: "LANCHES FAST FOOD (Consumo Mensal)",
        unidade: "LANCHES/MÊS",
        // Dados: [1, 1, 4, 10, 14]
        // Amplitude: 14 - 1 = 13
        // Média: 30 / 5 = 6
        // Moda: 1
        // Mediana: 4
        dados: [
            { nome: "Leo", valor: 1 },
            { nome: "Mia", valor: 1 },
            { nome: "Noé", valor: 4 },
            { nome: "Pia", valor: 10 },
            { nome: "Rui", valor: 14 }
        ],
        respostas: { amplitude: 13, media: 6, moda: 1, mediana: 4 }
    },
    {
        id: 3,
        tema: "LIVROS LIDOS (Ano Passado)",
        unidade: "LIVROS/ANO",
        // Dados: [0, 2, 3, 3, 12]
        // Amplitude: 12 - 0 = 12
        // Média: 20 / 5 = 4
        // Moda: 3
        // Mediana: 3
        dados: [
            { nome: "Sol", valor: 0 },
            { nome: "Tom", valor: 2 },
            { nome: "Ula", valor: 3 },
            { nome: "Val", valor: 3 },
            { nome: "Zac", valor: 12 }
        ],
        respostas: { amplitude: 12, media: 4, moda: 3, mediana: 3 }
    },
    {
        id: 4,
        tema: "GASTOS COM JOGOS (Reais)",
        unidade: "REAIS (R$)",
        // Dados: [10, 20, 20, 50, 100]
        // Amplitude: 100 - 10 = 90
        // Média: 200 / 5 = 40
        // Moda: 20
        // Mediana: 20
        dados: [
            { nome: "Ian", valor: 10 },
            { nome: "Jil", valor: 20 },
            { nome: "Kim", valor: 20 },
            { nome: "Lis", valor: 50 },
            { nome: "Max", valor: 100 }
        ],
        respostas: { amplitude: 90, media: 40, moda: 20, mediana: 20 }
    },
    {
        id: 5,
        tema: "DISTÂNCIA PERCORRIDA (Km)",
        unidade: "QUILÔMETROS",
        // Dados: [3, 3, 5, 7, 12]
        // Amplitude: 12 - 3 = 9
        // Média: 30 / 5 = 6
        // Moda: 3
        // Mediana: 5
        dados: [
            { nome: "Fae", valor: 3 },
            { nome: "Gus", valor: 3 },
            { nome: "Hal", valor: 5 },
            { nome: "Ivy", valor: 7 },
            { nome: "Joe", valor: 12 }
        ],
        respostas: { amplitude: 9, media: 6, moda: 3, mediana: 5 }
    }
];

// INICIALIZAÇÃO
function iniciarCenario() {
    // Sorteia um cenário
    cenarioAtual = bancoCenarios[Math.floor(Math.random() * bancoCenarios.length)];
    
    // Preenche os textos na tela
    document.getElementById('tema-missao').innerText = cenarioAtual.tema;
    document.getElementById('titulo-tema').innerText = cenarioAtual.tema;
    document.getElementById('unidade-medida').innerText = cenarioAtual.unidade;
    
    // Preenche a Tabela HTML
    const tbody = document.getElementById('corpo-tabela');
    tbody.innerHTML = '';
    cenarioAtual.dados.forEach((d, i) => {
        tbody.innerHTML += `<tr><td>0${i+1}</td><td>${d.nome}</td><td>${d.valor}</td></tr>`;
    });

    // Preenche os "Dados Visíveis" das fases 3 e 4 (formata array como string)
    const arrayValores = cenarioAtual.dados.map(d => d.valor).join(", ");
    document.getElementById('dados-visiveis-f3').innerText = `DADOS: ${arrayValores}`;
    document.getElementById('dados-visiveis-f4').innerText = `DADOS: ${arrayValores}`;
}

function mostrarDica(id) {
    const box = document.getElementById(`dica-${id}`);
    if (box.style.display !== 'block') {
        box.style.display = 'block';
        dadosAgente.dicasSolicitadas++;
    }
}

function avancarFase(num) {
    document.querySelectorAll('.fase-jogo').forEach(el => el.style.display = 'none');
    document.getElementById(`fase-${num}`).style.display = 'block';
}

// FASE 1: AMOSTRA (Conceitual - igual para todos)
function verificarAmostra(opcao) {
    let status = "ERRO";
    let feedback = "";
    
    if (opcao === 'B') {
        dadosAgente.acertos++;
        status = "ACERTO";
        feedback = "Amostra aleatória evita viés.";
        alert("CORRETO! " + feedback);
        avancarFase(2);
    } else {
        dadosAgente.erros++;
        feedback = "Amostra viciada não representa a população.";
        alert("INADEQUADO. " + feedback);
    }

    dadosAgente.detalhes.push({
        questao: "Fase 1: Escolha da Amostra",
        tipo: "CONCEITO",
        suaResposta: `Opção ${opcao}`,
        respostaCerta: "Opção B (Aleatória)",
        status: status,
        feedback: feedback
    });
}

// FASE 2: AMPLITUDE E MÉDIA
function verificarFase2() {
    const amp = parseInt(document.getElementById('input-amplitude').value);
    const media = parseInt(document.getElementById('input-media').value);
    
    const gabarito = cenarioAtual.respostas;
    let acertosLocais = 0;
    let feedback = [];

    if (amp === gabarito.amplitude) acertosLocais++; 
    else feedback.push(`Erro na Amplitude (Sua: ${amp}, Certa: ${gabarito.amplitude}).`);
    
    if (media === gabarito.media) acertosLocais++; 
    else feedback.push(`Erro na Média (Sua: ${media}, Certa: ${gabarito.media}).`);

    if (acertosLocais === 2) {
        dadosAgente.acertos += 2;
        alert("CÁLCULOS EXATOS!");
        avancarFase(3);
        dadosAgente.detalhes.push({
            questao: "Fase 2: Amplitude e Média",
            tipo: "CÁLCULO",
            suaResposta: `Amp:${amp}, Média:${media}`,
            respostaCerta: `Amp:${gabarito.amplitude}, Média:${gabarito.media}`,
            status: "ACERTO",
            feedback: "Cálculos corretos."
        });
    } else {
        dadosAgente.erros++;
        alert("ERROS ENCONTRADOS: " + feedback.join(" "));
        dadosAgente.detalhes.push({
            questao: "Fase 2: Amplitude e Média",
            tipo: "CÁLCULO",
            suaResposta: `Amp:${amp}, Média:${media}`,
            respostaCerta: `Amp:${gabarito.amplitude}, Média:${gabarito.media}`,
            status: "ERRO",
            feedback: feedback.join(" ")
        });
    }
}

// FASE 3: MODA
function verificarModa() {
    const moda = parseInt(document.getElementById('input-moda').value);
    const gabarito = cenarioAtual.respostas.moda;

    if (moda === gabarito) {
        dadosAgente.acertos++;
        alert("CORRETO!");
        avancarFase(4);
        dadosAgente.detalhes.push({ questao: "Fase 3: Moda", tipo: "CÁLCULO", suaResposta: moda, respostaCerta: gabarito, status: "ACERTO", feedback: "Valor mais frequente identificado." });
    } else {
        dadosAgente.erros++;
        alert("INCORRETO.");
        dadosAgente.detalhes.push({ questao: "Fase 3: Moda", tipo: "CÁLCULO", suaResposta: moda, respostaCerta: gabarito, status: "ERRO", feedback: "Moda é o valor que mais se repete." });
    }
}

// FASE 4: MEDIANA
function verificarMediana() {
    const mediana = parseInt(document.getElementById('input-mediana').value);
    const gabarito = cenarioAtual.respostas.mediana;

    if (mediana === gabarito) {
        dadosAgente.acertos++;
        // Registro antes de finalizar
        dadosAgente.detalhes.push({ questao: "Fase 4: Mediana", tipo: "CÁLCULO", suaResposta: mediana, respostaCerta: gabarito, status: "ACERTO", feedback: "Valor central identificado." });
        finalizarCaso();
    } else {
        dadosAgente.erros++;
        alert("ERRO.");
        dadosAgente.detalhes.push({ questao: "Fase 4: Mediana", tipo: "CÁLCULO", suaResposta: mediana, respostaCerta: gabarito, status: "ERRO", feedback: "Organize em ordem crescente e pegue o meio." });
    }
}

function finalizarCaso() {
    const tempo = Math.floor((Date.now() - dadosAgente.inicio) / 1000);
    
    const hist = JSON.parse(localStorage.getItem('relatorioGeral') || "[]");
    hist.push({
        agente: dadosAgente.nome,
        caso: "04 - Pesquisa de Campo",
        acertos: dadosAgente.acertos,
        erros: dadosAgente.erros,
        dicas: dadosAgente.dicasSolicitadas,
        tempo: tempo,
        detalhes: dadosAgente.detalhes
    });
    localStorage.setItem('relatorioGeral', JSON.stringify(hist));

    document.getElementById('game-container').style.display = 'none';
    document.getElementById('resultado-final').style.display = 'block';
    
    document.getElementById('stats-caso4').innerHTML = `
        <p>ACERTOS TÉCNICOS: <span style="color:#00ff41">${dadosAgente.acertos} / 5</span></p>
        <p>ERROS COMETIDOS: <span style="color:#ff4d4d">${dadosAgente.erros}</span></p>
        <p>DICAS USADAS: <span style="color:#ffff00">${dadosAgente.dicasSolicitadas}</span></p>
    `;
}

// Inicializa e sorteia o cenário ao carregar
window.onload = function() {
    if(typeof carregarComponentes === "function") carregarComponentes();
    iniciarCenario();
};