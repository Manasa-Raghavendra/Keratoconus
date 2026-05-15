import os
import uuid
import cv2
import numpy as np

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import (
    load_img,
    img_to_array
)

import tensorflow as tf

# =========================================================
# LOAD MODEL
# =========================================================

MODEL_PATH = "ml_model/keratoconus_model.h5"

model = load_model(MODEL_PATH)

# =========================================================
# LAST CONVOLUTION LAYER
# =========================================================

LAST_CONV_LAYER = "top_conv"

# =========================================================
# GENERATE REAL GRADCAM
# =========================================================

def generate_gradcam(image_path):

    # =====================================================
    # LOAD ORIGINAL IMAGE
    # =====================================================

    original = cv2.imread(image_path)

    original = cv2.cvtColor(
        original,
        cv2.COLOR_BGR2RGB
    )

    original_resized = cv2.resize(
        original,
        (224, 224)
    )

    # =====================================================
    # PREPROCESS IMAGE
    # =====================================================

    img = load_img(
        image_path,
        target_size=(224, 224)
    )

    img_array = img_to_array(img)

    img_array = img_array / 255.0

    img_array = np.expand_dims(
        img_array,
        axis=0
    )

    # =====================================================
    # CREATE GRADCAM MODEL
    # =====================================================

    grad_model = tf.keras.models.Model(

        model.inputs,

        [
            model.get_layer(
                LAST_CONV_LAYER
            ).output,

            model.output
        ]
    )

    # =====================================================
    # COMPUTE GRADIENTS
    # =====================================================

    with tf.GradientTape() as tape:

        conv_outputs, predictions = grad_model(
            img_array
        )

        predicted_class = tf.argmax(
            predictions[0]
        )

        loss = predictions[
            :,
            predicted_class
        ]

    grads = tape.gradient(
        loss,
        conv_outputs
    )

    # =====================================================
    # GLOBAL AVERAGE POOLING
    # =====================================================

    pooled_grads = tf.reduce_mean(
        grads,
        axis=(0, 1, 2)
    )

    conv_outputs = conv_outputs[0]

    # =====================================================
    # WEIGHT FEATURE MAPS
    # =====================================================

    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]

    heatmap = tf.squeeze(heatmap)

    heatmap = heatmap.numpy()

    # =====================================================
    # RELU ACTIVATION
    # =====================================================

    heatmap = np.maximum(
        heatmap,
        0
    )

    # =====================================================
    # NORMALIZE HEATMAP
    # =====================================================

    heatmap = heatmap / np.max(heatmap)

    # =====================================================
    # RESIZE HEATMAP
    # =====================================================

    heatmap = cv2.resize(
        heatmap,
        (224, 224)
    )

    # =====================================================
    # CONVERT TO UINT8
    # =====================================================

    heatmap = np.uint8(
        255 * heatmap
    )

    # =====================================================
    # APPLY COLORMAP
    # =====================================================

    colored_heatmap = cv2.applyColorMap(
        heatmap,
        cv2.COLORMAP_JET
    )

    colored_heatmap = cv2.cvtColor(
        colored_heatmap,
        cv2.COLOR_BGR2RGB
    )

    # =====================================================
    # CREATE OVERLAY
    # =====================================================

    overlay = cv2.addWeighted(

        original_resized,

        0.5,

        colored_heatmap,

        0.5,

        0
    )

    # =====================================================
    # CREATE FOLDER
    # =====================================================

    if not os.path.exists("gradcam"):

        os.makedirs("gradcam")

    # =====================================================
    # SAVE IMAGE
    # =====================================================

    filename = f"{uuid.uuid4()}.jpg"

    save_path = os.path.join(
        "gradcam",
        filename
    )

    cv2.imwrite(

        save_path,

        cv2.cvtColor(
            overlay,
            cv2.COLOR_RGB2BGR
        )
    )

    # =====================================================
    # RETURN PATH
    # =====================================================

    return save_path