# Projeto Integrado: Sistema de Monitoramento de Umidade

**Disciplinas integradas:**
- Sistemas Embarcados (SEB)
- Linguagens de Programação (LPR)
- Inteligência Artificial (IA)
- Desenvolvimento de Aplicações (DAPL)

**Integrantes:**
- Luiz Henrique Schmidt Silva
- Pedro Brasil Carli Azevedo

**Demonstração em vídeo:** https://youtu.be/G90bX4INW8k

---

## Tecnologias utilizadas

O fluxo abaixo mostra como o dado percorre cada camada do sistema, da leitura analógica do trimpot até a interface web do operador.

![Diagrama de arquitetura do sistema](imgs/architecture_diagram.png)

---

## Vantagens do uso do protocolo proprietário

- **Otimização de largura de banda:** transmitir a leitura máxima em decimal (`4095\r\n`) demanda 6 bytes; em hexadecimal (`FFF\r\n`), o pacote gasta apenas 5 bytes.
- **Comprimento de quadro fixo:** a formatação com `%03X` assegura que os pacotes tenham sempre 3 caracteres de dado, simplificando o tratamento no receptor.
- **Sincronismo direto de linha:** o terminador padrão `\r\n` viabiliza o uso direto da função `ReadLine()` no C#, sem necessidade de máquinas de estado complexas para reconstrução de bytes soltos.
- **Depuração direta:** os valores podem ser inspecionados visualmente em qualquer monitor serial convencional.

---

## Diagrama de pastas do projeto

![Árvore de diretórios do projeto](imgs/folder_structure.png)

---

## Classificação por Inteligência Artificial (k-NN)

Tabela de referência usada para treinar e validar o modelo KNN que classifica a leitura do ADC em categorias de umidade.

![Tabela de classificação por faixa ADC](imgs/dataset_table.png)

---

## Como executar o sistema

### 1. Gravação do firmware (STM32)
1. Abra o código no STM32CubeIDE.
2. Compile e grave o firmware na placa STM32F103C8T6 via ST-Link.
3. Conecte a porta USB da placa ao computador (verifique a porta COM reconhecida, ex: `COM5`).

### 2. Inicialização do servidor e IA (Node.js + Python)
```bash
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
```

### 3. Execução do C#
```bash
# 1. Entrar no diretório csharp
cd csharp

# 2. Executar a aplicação C#
dotnet run
```
