import os
import google.generativeai as genai

from dotenv import load_dotenv

# =========================================
# LOAD ENV
# =========================================

load_dotenv()

API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

# =========================================
# CONFIGURE GEMINI
# =========================================

genai.configure(
    api_key=API_KEY
)

# =========================================
# ASK EYEBOT
# =========================================

def ask_eyebot(question):

    prompt = f"""

    You are EyeBot AI,
    an advanced AI assistant specialized in:

    - Keratoconus
    - Pentacam corneal topography
    - Corneal tomography
    - Ophthalmology
    - Eye diseases
    - AI-based medical imaging
    - Deep learning in ophthalmology
    - Explainable AI
    - Grad-CAM visualization
    - CNN image classification
    - Corneal diagnostics

    Your role is to help:

    - doctors
    - ophthalmologists
    - researchers
    - medical students
    - patients

    understand Keratoconus and AI predictions.

    IMPORTANT:
    Final diagnosis must always be confirmed
    by an ophthalmologist.

    User Question:
    {question}

    """

    try:

        model = genai.GenerativeModel(
            "gemini-1.5-flash"
        )

        response = model.generate_content(
            prompt
        )

        return response.text

    except Exception as e:

        return f"Gemini Error: {str(e)}"