"""
AI Video Generation Platform - Application Factory
Создание и настройка FastAPI приложения
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from core.logger import setup_logger
from api.routes import health, jobs, pipeline, projects
from websocket.manager import WebSocketManager, get_websocket_manager

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
    app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
    
    # WebSocket endpoint - use singleton manager instance
    ws_manager = get_websocket_manager()
    app.add_api_websocket_route("/ws", ws_manager.connect)
    
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
