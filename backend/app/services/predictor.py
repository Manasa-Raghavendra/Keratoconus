import tensorflow as tf
import numpy as np

from PIL import Image

# Load trained model
model = tf.keras.models.load_model(
    "ml_model/keratoconus_model.h5"
)

# Class labels
class_names = [
    "Keratoconus",
    "Normal",
    "Suspect"
]


# Predict Function
def predict_image(image_path):

    # Load image
    image = Image.open(image_path)

    image = image.convert("RGB")

    # Resize
    image = image.resize((224, 224))

    # Convert to array
    image_array = np.array(image)

    # Normalize
    image_array = image_array / 255.0

    # Expand dimensions
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # Predict
    predictions = model.predict(image_array)

    predicted_index = np.argmax(predictions)

    predicted_class = class_names[
        predicted_index
    ]

    confidence = float(
        predictions[0][predicted_index]
    )

    return {

        "predicted_class": predicted_class,

        "confidence": round(confidence * 100, 2),

        "all_probabilities": predictions.tolist()
    }