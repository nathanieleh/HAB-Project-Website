from fastapi import FastAPI
from app.api.routes import router as api_router

app = FastAPI(
    title="HAB Prediction API",
    description="API for accessing Harmful Algae Bloom predictions",
    version="1.0"
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
