const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const readline = require('readline');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let historicoLeituras = [];

// Inicia o processo da IA
const scriptPath = path.join(__dirname, 'predict.py');
const pythonProcess = spawn('python', [scriptPath]);

const rl = readline.createInterface({
    input: pythonProcess.stdout,
    terminal: false
});

let callbacksFila = [];

rl.on('line', (classificacao) => {
    if (callbacksFila.length > 0) {
        const resolver = callbacksFila.shift();
        resolver(classificacao.trim());
    }
});

pythonProcess.stderr.on('data', (data) => {
    console.error(`[Erro Python]: ${data}`);
});

// Função que envia o dado para a IA e aguarda a resposta 
function classificarComIA(valor) {
    return new Promise((resolve) => {
        callbacksFila.push(resolve);
        pythonProcess.stdin.write(`${valor}\n`);
    });
}

// Endpoint que recebe as medições do C#
app.post('/api/readings', async (req, res) => {
    const valor = req.body.value;

    // Predição direta pelo modelo KNN
    const classificacao = await classificarComIA(valor);
    const umidadePorcentagem = ((valor / 4095) * 100).toFixed(1);

    const agora = new Date();
    const horarioFormatado = agora.toTimeString().split(' ')[0];

    const registro = {
        value: valor,
        humidity: `${umidadePorcentagem}%`,
        classification: classificacao,
        timestamp: horarioFormatado
    };

    // Insere no início do array e mantém todas as leituras salvas 
    historicoLeituras.unshift(registro);

    res.status(200).json({ status: "ok", dados: registro });
});

app.get('/api/data', (req, res) => {
    res.json({
        atual: historicoLeituras[0] || null,
        historico: historicoLeituras
    });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando com IA na porta ${PORT}`));