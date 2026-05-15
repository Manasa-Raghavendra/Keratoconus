from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.models import audit_log

from app.models.database import engine, Base

from app.models import doctor
from app.models import prediction

from app.routes.auth import router as auth_router
from app.routes.admin import router as admin_router
from app.routes.prediction import router as prediction_router
from app.routes.reports import router as reports_router
from app.routes.settings import router as settings_router
from app.routes.chatbot import router as chatbot_router

# =========================================================
# Create Database Tables
# =========================================================
Base.metadata.create_all(bind=engine)

# =========================================================
# FastAPI App
# =========================================================
app = FastAPI(

    title="AI Assisted Keratoconus Detection API",

    version="1.0.0"
)

app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)
# =========================================================
# Static File Serving
# =========================================================

# Serve uploaded images
app.mount(

    "/uploads",

    StaticFiles(directory="uploads"),

    name="uploads"
)

# Serve GradCAM images
app.mount(

    "/gradcam",

    StaticFiles(directory="gradcam"),

    name="gradcam"
)

# Serve PDF reports
app.mount(

    "/pdf_reports",

    StaticFiles(directory="reports"),

    name="pdf_reports"
)

# =========================================================
# CORS Middleware
# =========================================================
app.add_middleware(

    CORSMiddleware,

    allow_origins=["*"],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)

# =========================================================
# API Routes
# =========================================================
app.include_router(auth_router)

app.include_router(admin_router)

app.include_router(prediction_router)

app.include_router(reports_router)

app.include_router(settings_router)

app.include_router(chatbot_router)

# =========================================================
# Root Route
# =========================================================
@app.get("/")

def root():

    return {

        "message": "AI Assisted Keratoconus Detection Backend Running Successfully"
    }