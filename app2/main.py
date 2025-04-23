import uvicorn
from fastapi import FastAPI
from api.routes import router as api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="HAB Prediction API",
    description="API for accessing Harmful Algae Bloom predictions",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
