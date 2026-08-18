import sys
import os
import joblib

model_path = os.path.join(os.path.dirname(__file__), 'modelo_knn_umidade.pkl')

try:
    knn = joblib.load(model_path)
except Exception as e:
    sys.exit(1)

# Loop contínuo: lê do Node.js via stdin, classifica e devolve via stdout
for linha in sys.stdin:
    dado = linha.strip()
    if not dado:
        continue
    try:
        valor_adc = float(dado)
        predicao = knn.predict([[valor_adc]])[0]
        print(predicao, flush=True)
    except Exception:
        print("Desconhecido", flush=True)