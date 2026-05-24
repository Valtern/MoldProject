from fastapi import FastAPI, UploadFile, File
import torch
from training.model import MNISTConvNet
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the model on startup
    print("Loading AI model...")
    app.state.model = MNISTConvNet()
    # In the future, load your trained weights here:
    # app.state.model.load_state_dict(torch.load("../outputs/checkpoints/mnist_model.pt"))
    app.state.model.eval()
    yield
    # Clean up on shutdown
    print("Shutting down AI API...")

app = FastAPI(
    title="MoldGuard AI Inference API",
    lifespan=lifespan
)

@app.get("/")
def read_root():
    return {"status": "AI Inference API is Online"}

@app.post("/predict")
async def predict(file: UploadFile):
    return {"prediction": "model logic here", "class": 0}