import numpy as np
from sklearn.neighbors import KNeighborsClassifier
import joblib

X_train = np.array([
    [0], [150], [300], [491],
    [492], [600], [700], [819],
    [820], [950], [1100], [1228],
    [1229], [1350], [1500], [1638],
    [1639], [1900], [2200], [2457],
    [2458], [2800], [3200], [3600], [4095]
])

y_train = np.array([
    'Emergencia', 'Emergencia', 'Emergencia', 'Emergencia',
    'Alerta', 'Alerta', 'Alerta', 'Alerta',
    'Atencao', 'Atencao', 'Atencao', 'Atencao',
    'Aceitavel', 'Aceitavel', 'Aceitavel', 'Aceitavel',
    'Nivel Ideal', 'Nivel Ideal', 'Nivel Ideal', 'Nivel Ideal',
    'Excesso', 'Excesso', 'Excesso', 'Excesso', 'Excesso'
])

knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# Salva o arquivo pronto para ser usado no Servidor
joblib.dump(knn, 'modelo_knn_umidade.pkl')
print("Modelo treinado e salvo como 'modelo_knn_umidade.pkl' com sucesso!")
