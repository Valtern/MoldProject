import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
from model import MNISTConvNet
import os

def train_model():
    # 1. Setup Environment
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Training on: {device}")

    # 2. Data Preparation (Paths relative to /training folder)
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    # Use path relative to this script for dataset
    script_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_root = os.path.join(script_dir, '..', 'datasets')

    # Download dataset only if not present
    train_set = datasets.MNIST(root=dataset_root, train=True, download=True, transform=transform)
    # Using num_workers=0 is safer for Windows/Python 3.13 compatibility in some environments
    train_loader = DataLoader(train_set, batch_size=64, shuffle=True, num_workers=0)
    print(f"Dataset loaded. Total samples: {len(train_set)}")

    # 3. Model, Loss, Optimizer
    model = MNISTConvNet().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    # 4. Training Loop
    epochs = 5
    model.train()
    
    for epoch in range(epochs):
        running_loss = 0.0
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(device), target.to(device)
            
            # Zero gradients
            optimizer.zero_grad()
            
            # Forward pass
            output = model(data)
            loss = criterion(output, target)
            
            # Backward pass
            loss.backward()
            
            # Update weights
            optimizer.step()
            
            running_loss += loss.item()
            if batch_idx % 100 == 99:
                print(f'[Epoch {epoch+1}, Batch {batch_idx+1:5d}] loss: {running_loss/100:.3f}')
                running_loss = 0.0

    # 5. Save Model (Using absolute paths derived from script location)
    save_dir = os.path.join(script_dir, '..', 'outputs', 'checkpoints')
    os.makedirs(save_dir, exist_ok=True)
    
    model_path = os.path.join(save_dir, 'mnist_model.pt')
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to: {model_path}")

if __name__ == "__main__":
    train_model()