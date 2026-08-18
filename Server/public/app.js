function formatarHorario(horarioStr) {
    if (!horarioStr) return "--:--:--";
    return horarioStr.split('.')[0];
}

// Gerenciador de Alertas Visuais para Emergência, Alerta e Excesso
function gerenciarAlertaCritico(classificacao) {
    const alertBanner = document.getElementById('critical-alert');
    const cardPrincipal = document.getElementById('card-principal');

    if (!alertBanner || !cardPrincipal) return;

    // Remove acentos e converte para minúsculas (ex: "Emergência" -> "emergencia")
    const textoLimpo = (classificacao || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toLowerCase();

    // Limpa classes anteriores
    alertBanner.className = 'alert-banner';
    cardPrincipal.classList.remove('card-emergencia', 'card-alerta', 'card-excesso');

    if (textoLimpo.includes('emergencia')) {
        alertBanner.style.display = 'block';
        alertBanner.classList.add('alert-emergencia');
        alertBanner.innerText = 'ALERTA CRÍTICO: Nível de EMERGÊNCIA (Solo Extremamente Seco)!';
        cardPrincipal.classList.add('card-emergencia');
    } 
    else if (textoLimpo.includes('alerta')) {
        alertBanner.style.display = 'block';
        alertBanner.classList.add('alert-alerta');
        alertBanner.innerText = 'AVISO: Nível de ALERTA (Umidade Baixa, Necessária Irrigação)!';
        cardPrincipal.classList.add('card-alerta');
    } 
    else if (textoLimpo.includes('excesso')) {
        alertBanner.style.display = 'block';
        alertBanner.classList.add('alert-excesso');
        alertBanner.innerText = 'AVISO CRÍTICO: Nível de EXCESSO (Risco de Encharcamento)!';
        cardPrincipal.classList.add('card-excesso');
    } 
    else {
        alertBanner.style.display = 'none';
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

            // Dispara a lógica de alertas
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
