import os

os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"

import tensorflow as tf
import numpy as np

from PIL import Image


# ============================================
# CLASS LABELS
# ============================================

class_names = [

    "Keratoconus",

    "Normal",

    "Suspect"
]


# ============================================
# PREDICT FUNCTION
# ============================================

def predict_image(image_path):

    # ========================================
    # LOAD MODEL ONLY WHEN NEEDED
    # ========================================

    model = tf.keras.models.load_model(

        "ml_model/keratoconus_model.h5"
    )

    # ========================================
    # LOAD IMAGE
    # ========================================

    image = Image.open(image_path)

    image = image.convert("RGB")

    # ========================================
    # RESIZE
    # ========================================

    image = image.resize((224, 224))

    # ========================================
    # CONVERT TO ARRAY
    # ========================================

    image_array = np.array(image)

    # ========================================
    # NORMALIZE
    # ========================================

    image_array = image_array / 255.0

    # ========================================
    # EXPAND DIMENSIONS
    # ========================================

    image_array = np.expand_dims(

        image_array,

        axis=0
    )

    # ========================================
    # PREDICT
    # ========================================

    predictions = model.predict(

        image_array,

        verbose=0
    )

    predicted_index = np.argmax(

        predictions
    )

    predicted_class = class_names[
        predicted_index
    ]

    confidence = float(

        predictions[0][predicted_index]
    )

    # ========================================
    # RETURN RESULT
    # ========================================

    return {

        "predicted_class":
            predicted_class,

        "confidence":
            round(confidence * 100, 2),

        "all_probabilities":
            predictions.tolist()
    }