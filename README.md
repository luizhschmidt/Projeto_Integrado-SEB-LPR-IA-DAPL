 Projeto Integrado: Sistema de Monitoramento de Umidade  
 Disciplinas:
 Integradas: Sistemas Embarcados (SEB)
 Linguagens de Programação (LPR)
 Inteligência Artificial (IA)
 Desenvolvimento de Aplicações (DAPL)

 Nome dos Integrantes:
 Luiz Henrique Schmidt Silva
 Pedro Brasil Carli Azevedo 

 Demonstração em Vídeo:
 https://youtu.be/G90bX4INW8k

 Tecnologias Utilizadas:
 ┌────────────────────────┐
 │   Trimpot Analógico    │ ◄── Simulação de Umidade (0.00 V a 3.30 V)
 └───────────┬────────────┘
             │ Tensão Contínua no pino PA2
             ▼
 ┌───────────────────────────────────────────────────────────┐
 │            SISTEMAS EMBARCADOS - SEB (STM32)              │         │
 │ 1. Leitura ADC (12 bits: 0 a 4095)                        │
 │ 3. Filtro Passa-Baixas                                    │
 │ 4. Formatação Hexadecimal no formato fixo "%03X\r\n"      │
 └───────────────────────────┬───────────────────────────────┘
                             │ Protocolo Proprietário USB CDC (Virtual COM @ 115200 bps)
                             │ Pacote: [ H2 ][ H1 ][ H0 ][ \r ][ \n ] (Ex: "71A\r\n")
                             ▼
 ┌───────────────────────────────────────────────────────────┐
 │          LINGUAGENS DE PROGRAMAÇÃO - LPR (C#)             │
 │ 1. Monitoramento da Porta COM      │
 │ 2. Decodificação Hexadecimal (Base 16) -> Inteiro Base 10 │
 │ 3. Serialização dos dados em formato JSON                 │
 │ 4. Envio assíncrono via HttpClient (POST)                 │
 └───────────────────────────┬───────────────────────────────┘
                             │ Protocolo HTTP/1.1 POST /api/readings
                             │ { "value": 1818 }
                             ▼
 ┌───────────────────────────────────────────────────────────┐
 │        DESENVOLVIMENTO DE APLICAÇÕES - DAPL (Node.js)     │
 │ 1. Servidor Express escutando na porta 3000               │
 │ 2. Recebimento do JSON e cálculo da porcentagem (%)       │
 │ 3. Ponte IPC contínua com processo Python                 │
 └─────────────┬─────────────────────────────────▲───────────┘
               │ entrada: "1818"                 │ saida: "Aceitável"
               ▼                                 │
 ┌───────────────────────────────────────────────┴───────────┐
 │            INTELIGÊNCIA ARTIFICIAL - IA (Python)          │
 │ 1. Script persistente na memória (predict.py)             │
 │ 2. Modelo KNN (k=1) carregado via Joblib (.pkl)           │      
 └───────────────────────────────────────────────────────────┘
               │ 
               ▼
 ┌───────────────────────────────────────────────────────────┐
 │              INTERFACE WEB DO OPERADOR (DAPL)             │
 │ 1. HTTP GET /api/data a cada 100 ms                       │
 │ 2. Cards: Leitura em Porcentagem, Status e Horário        │
 │ 3. Tabela completa de histórico de leituras               │
 │ 4. Alertas visuais críticos dinâmicos                     │
 └───────────────────────────────────────────────────────────┘

Vantagens do Uso do Protocolo Proprietário:
Otimização de Largura de Banda: Transmitir a leitura máxima em decimal (4095\r\n) demanda 6 bytes. Em hexadecimal (FFF\r\n), o pacote gasta 5 bytes
Comprimento de Quadro Fixo: A formatação com %03X assegura que os pacotes tenham sempre 3 caracteres de dado, simplificando o tratamento de dados no receptor.
Sincronismo Direto de Linha: O terminador padrão \r\n viabiliza o uso direto da função ReadLine() no C#, sem a necessidade de máquinas de estado complexas para reconstrução de bytes soltos.  
Depuração Direta: Os valores podem ser inspecionados visualmente em qualquer monitor serial convencional

Diagrama de Pastas do Projeto: 
Projeto_Integrado_IoT/
│
├── csharp_serial/                      # Módulo LPR (Linguagens de Programação)
│   ├── Program.cs                      # Gateway Serial COM -> HTTP POST JSON
│   └── csharp_serial.csproj            # Configuração do projeto .NET 8.0
│
├── server/                             # Módulos DAPL e IA
│   ├── public/                         # Frontend Web do Operador
│   │   ├── index.html                  # Estrutura HTML do Dashboard e Alertas
│   │   ├── style.css                   # Estilização limpa, Badges e Animações
│   │   └── app.js                      # Consumo da API, normalização e renderização
│   ├── predict.py                      # Inferência contínua por IA via stdin/stdou
│   ├── train_model.py                  # Treinamento e exportação do modelo KN
│   ├── modelo_knn_umidade.pkl          # Modelo serializado de Machine Learning
│   ├── server.js                       # Servidor Express com ponte IPC para IA
│   ├── package.json                    # Dependências Node.js (express)
│   └── requirements.txt                # Dependências Python (scikit-learn, joblib)
│
├── stm32_firmware/                     # Módulo SEB (Sistemas Embarcados)
│   └── Core/Src/main.c                 # Leitura ADC, Filtro EMA e USB CDC
│
└── README.md                           # Documentação técnica do projeto

 Classificação por Inteligência Artificial(k-NN):
Faixa ADC(12 bits)	          Tensão equivalente	              Faixa de umidade(%)	           Categoria
000 a 1EB(0 – 491)	           0.00 V – 0.39 V                  0.0% – 12.0%	                 Emergência
1EC a 4CC(492 – 1228) 	       0.40 V – 0.99 V	                12.1% – 30.0%                  Alerta
4CD a 666(1229 – 1638)	       1.00 V – 1.32 V                	30.1% – 40.0%	                 Atenção
667 a 7FF(1639 – 2047)	       1.33 V – 1.65 V	                40.1% – 50.0%	                 Aceitável
800 a 999(2048 – 2457)	       1.66 V – 1.98 V                	50.1% – 60.0%	                 Nível ideal
99A a FFF(2458 – 4095)	       1.99 V – 3.30 V	                60.1% – 100.0%	               Excesso


Como Executar o Sistema
1. Gravação do Firmware (STM32)
Abra o código no STM32CubeIDE.
Compile e grave o firmware na placa STM32F103C8T6 via ST-Link.
Conecte a porta USB da placa ao computador (verifique a porta COM reconhecida, ex: COM5)

2. Inicialização do Servidor e IA (Node.js + Python)
# 1.Entrar no diretorio server
cd server
# 2. Crie e ative o ambiente virtual
python -m venv .venv
.\.venv\Scripts\activate      # Windows
# 3. Instale as dependências
pip install scikit-learn joblib
npm install
# 4. Treine o modelo KNN
python train_model.py
# 5. Inicie o servidor
npm start

3. Execução do C#
# 1.Entrar no diretorio csharp
cd csharp
# 2.Execute a aplicação C#
dotnet run
