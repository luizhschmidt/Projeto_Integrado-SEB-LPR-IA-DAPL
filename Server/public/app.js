function formatarHorario(horarioStr) {
    if (!horarioStr) return "--:--:--";
    return horarioStr.split('.')[0];
}

// Gerenciador do Alerta Crítico
function gerenciarAlertaCritico(classificacao) {
    const alertBanner = document.getElementById('critical-alert');
    const cardPrincipal = document.getElementById('card-principal');

    const ehCritico = classificacao === 'Emergência' || classificacao === 'Emergencia' || classificacao === 'Excesso';

    if (ehCritico) {
        alertBanner.style.display = 'block';
        alertBanner.innerText = (classificacao === 'Emergência' || classificacao === 'Emergencia')
            ? '🚨 ALERTA CRÍTICO: Umidade em Nível de Emergência!' 
            : '⚠️ ALERTA CRÍTICO: Umidade em Nível de Excesso!';
        
        cardPrincipal.classList.add('card-critico');
    } else {
        alertBanner.style.display = 'none';
        cardPrincipal.classList.remove('card-critico');
    }
}

async function atualizarDashboard() {
    try {
        const response = await fetch('/api/data');
        const data = await response.json();

        if (data.atual) {
            const umidadeAtual = data.atual.humidity || `${((data.atual.value / 4095) * 100).toFixed(1)}%`;
            
            // Atualiza os Cards
            document.getElementById('humidity-val').innerText = umidadeAtual;
            
            const badgeEl = document.getElementById('classification');
            badgeEl.innerText = data.atual.classification;
            badgeEl.className = `badge ${data.atual.classification}`;

            document.getElementById('timestamp').innerText = formatarHorario(data.atual.timestamp);

            // Dispara o alerta visual se necessário
            gerenciarAlertaCritico(data.atual.classification);
        }

        // Atualiza a Tabela de Histórico
        const tbody = document.getElementById('history-table');
        if (data.historico && data.historico.length > 0) {
            tbody.innerHTML = '';
            
            data.historico.forEach(item => {
                const umidade = item.humidity || `${((item.value / 4095) * 100).toFixed(1)}%`;
                const horarioFormatado = formatarHorario(item.timestamp);
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${horarioFormatado}</td>
                    <td><strong>${item.value}</strong></td>
                    <td style="color: #0d6efd; font-weight: bold;">${umidade}</td>
                    <td><span class="badge ${item.classification}" style="font-size:0.85rem; padding:4px 10px;">${item.classification}</span></td>
                `;
                tbody.appendChild(tr);
            });
        }
    } catch (err) {
        console.error("Erro ao atualizar o dashboard:", err);
    }
}

setInterval(atualizarDashboard, 100);
atualizarDashboard();