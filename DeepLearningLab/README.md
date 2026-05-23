# DeepLearningLab — MNIST PyTorch Workspace

## Folder Structure
- `datasets/`: Local storage for training data (MNIST).
- `training/`: Logic for neural network architecture and training loops.
- `inference/`: Scripts to run predictions on new data.
- `utils/`: Reusable visualization and helper functions.
- `outputs/`: 
    - `graphs/`: Accuracy/Loss plots.
    - `checkpoints/`: Saved model weights (`.pt`).
    - `predictions/`: Inference visual results.
- `docker/`: Deployment configuration.

## How to Run

### 1. Verification
```bash
python verify_env.py
```

### 2. Training
This script handles the **Forward Pass**, **Backpropagation**, and **Model Saving**.
```bash
python training/train.py
```

### 3. Inference
Load the saved weights and predict on test images.
```bash
python inference/predict.py
```

## Deep Learning Concepts Implemented
- **Tensors**: The fundamental multi-dimensional array used in PyTorch.
- **DataLoaders**: Efficiently feeds batches of data to the model.
- **CNN Architecture**: Using Convolutional layers for image feature extraction.
- **Loss Function**: `CrossEntropyLoss` for multi-class classification.
- **Optimizer**: `Adam` for adaptive gradient descent.
- **Validation**: Automated graph generation for loss and accuracy trends.

*Project isolated from Hadoop/MoldProject clusters.*