# Projeto Integrado: Sistema de Monitoramento de Umidade

Disciplinas:
- Sistemas Embarcados (SEB)
- Linguagens de Programação (LPR)
- Inteligência Artificial (IA)
- Desenvolvimento de Aplicações (DAPL)

Integrantes:
- Luiz Henrique Schmidt Silva
- Pedro Brasil Carli Azevedo

Demonstração em vídeo: https://youtu.be/G90bX4INW8k

# Descrição Geral do Projeto

O projeto consiste em um sistema distribuído de Monitoramento Inteligente de Umidade do Solo, simulando uma aplicação completa de Internet das Coisas (IoT). A solução integra quatro camadas principais de tecnologia: aquisição embarcada de sinais analógicos, gateway de comunicação desktop, backend com inferência contínua por Inteligência Artificial e supervisão em tempo real via interface web.

Como Funciona a Comunicação Entre os Sistemas:

1. Aquisição e Envio Serial (STM32 e C#): O microcontrolador STM32 lê a tensão contínua de um trimpot no pino analógico PA2, atenua oscilações de alta frequência através de um filtro passa-baixas. O valor final de 12 bits é serializado em uma mensagem de 5 bytes no protocolo proprietário hexadecimal (%03X\r\n) e enviado periodicamente a cada 100 ms via porta USB CDC (Virtual COM Port).

2. Gateway Desktop e Requisição HTTP (C# e Node.js): A aplicação em C# monitora a porta serial, descarta dados acumulados para evitar atrasos na fila (lag de leitura) e converte o texto hexadecimal para número decimal inteiro. Em seguida, serializa o dado em JSON ({"value": valorSensor}) e dispara uma requisição HTTP POST para o endpoint /api/readings da API REST.

3. Processamento e Inferência por IA (Node.js e Python): O servidor Node.js/Express recebe o JSON e encaminha a leitura do ADC diretamente para um subprocesso persistente em Python (predict.py). O modelo KNN treinado realiza a predição da classe (entre 6 categorias operacionais) em menos de 1 ms, devolvendo o resultado ao Node.js, que calcula a porcentagem de umidade e armazena o registro no histórico

4. Supervisão e Alertas em Tempo Real (Node.js e Dashboard): O frontend web consome periodicamente o endpoint HTTP GET /api/data via requisições. A interface exibe a umidade em porcentagem, o status da IA por meio de badges coloridas, o horário exato da leitura em HH:MM:SS, o histórico completo em tabela e aciona banners/bordas com alertas visuais dinâmicos em situações de Emergência, Alerta ou Excesso

# Tecnologias utilizadas

O fluxo abaixo mostra como o dado percorre cada camada do sistema, da leitura analógica do trimpot até a interface web do operador.

(imgs/architecture_diagram.png)

# Vantagens do uso do protocolo proprietário

- Otimização de largura de banda: transmitir a leitura máxima em decimal (`4095\r\n`) demanda 6 bytes; em hexadecimal (`FFF\r\n`), o pacote gasta apenas 5 bytes.
- Comprimento de quadro fixo: a formatação com `%03X` assegura que os pacotes tenham sempre 3 caracteres de dado, simplificando o tratamento no receptor.
- Sincronismo direto de linha: o terminador padrão `\r\n` viabiliza o uso direto da função `ReadLine()` no C#, sem necessidade de máquinas de estado complexas para reconstrução de bytes soltos.
- Depuração direta: os valores podem ser inspecionados visualmente em qualquer monitor serial convencional.

# Diagrama de pastas do projeto
(imgs/folder_structure.png)

## Classificação por Inteligência Artificial (k-NN)
Tabela de referência usada para treinar e validar o modelo KNN que classifica a leitura do ADC em categorias de umidade.

(imgs/dataset_table.png)


# Como executar o sistema

1. Gravação do firmware (STM32)
1. Abra o código no STM32CubeIDE.
2. Compile e grave o firmware na placa STM32F103C8T6 via ST-Link.
3. Conecte a porta USB da placa ao computador (verifique a porta COM reconhecida, ex: `COM5`).

2. Inicialização do servidor e IA (Node.js + Python)
# 1. Entrar no diretório server
cd server
# 2. Criar e ativar o ambiente virtual
python -m venv .venv
.\.venv\Scripts\activate      # Windows
# 3. Instalar as dependências
pip install scikit-learn joblib
npm install
# 4. Treinar o modelo KNN
python train_model.py
# 5. Iniciar o servidor
npm start

# 3. Execução do C#
# 1. Entrar no diretório csharp
cd csharp
# 2. Executar a aplicação C#
dotnet run

