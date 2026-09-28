import pandas as pd
from sklearn.tree import DecisionTreeClassifier
import joblib

# Load crop dataset
data = pd.read_csv("crop_dataset.csv")

# Input features
X = data[["N", "P", "K", "Moisture"]]

# Target (crop name)
y = data["Crop"]

# Create model
model = DecisionTreeClassifier()

# Train model
model.fit(X, y)

# Save trained model
joblib.dump(model, "soil_model.pkl")

print("Crop prediction model trained successfully")