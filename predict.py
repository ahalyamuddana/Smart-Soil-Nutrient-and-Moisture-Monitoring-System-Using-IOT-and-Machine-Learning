import sys
import joblib

try:

    # Load trained ML model
    model = joblib.load("soil_model.pkl")

    # Receive values from Node.js
    N = float(sys.argv[1])
    P = float(sys.argv[2])
    K = float(sys.argv[3])
    M = float(sys.argv[4])

    # Prepare input for prediction
    input_data = [[N, P, K, M]]

    # Predict crop
    prediction = model.predict(input_data)

    # Return predicted crop
    print(prediction[0])

except Exception as e:
    print("Prediction error")