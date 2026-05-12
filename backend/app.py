"""
AI Video Generation Platform - Application Factory
Создание и настройка FastAPI приложения
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.logger import setup_logger
from api.routes import health, jobs, pipeline
from websocket.manager import WebSocketManager

logger = setup_logger(__name__)

def create_app() -> FastAPI:
    """Factory для создания FastAPI приложения"""
    
    app = FastAPI(
        title="AI Video Generation Platform",
        description="Modular backend for AI video generation",
        version="1.0.0"
    )
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Подключение роутов
    app.include_router(health.router, prefix="/api/health", tags=["Health"])
    app.include_router(jobs.router, prefix="/api/jobs", tags=["Jobs"])
    app.include_router(pipeline.router, prefix="/api/pipeline", tags=["Pipeline"])
    
    # WebSocket endpoint
    app.add_websocket_route("/ws", WebSocketManager().connect)
    
    # Lifecycle events
    @app.on_event("startup")
    async def startup_event():
        logger.info("Starting up AI Video Generation Platform...")
        # Инициализация менеджеров при старте
        
    @app.on_event("shutdown")
    async def shutdown_event():
        logger.info("Shutting down AI Video Generation Platform...")
        # Очистка ресурсов при остановке
    
    return app
