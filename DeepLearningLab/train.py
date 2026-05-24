import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms
from torch.utils.data import DataLoader
import sys
import os

# Internal imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from utils.viz import plot_metrics

# 1. Neural Network Architecture
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        # Conv2d(in_channels, out_channels, kernel_size)
        self.conv1 = nn.Conv2d(1, 32, 3) 
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc1 = nn.Linear(64 * 12 * 12, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(2, 2)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(-1, 64 * 12 * 12) # Flatten
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def train():
    # Hyperparameters
    batch_size = 64
    lr = 0.001
    epochs = 2 # Low epochs for quick validation
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 2. Datasets & Transforms
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.1307,), (0.3081,))
    ])

    train_dataset = datasets.MNIST(root='./datasets', train=True, download=True, transform=transform)
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)

    # 3. Model, Loss, Optimizer
    model = SimpleCNN().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=lr)

    train_losses = []
    train_accs = []

    print(f"Starting training on {device}...")
    
    # 4. Training Loop
    for epoch in range(epochs):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        for batch_idx, (data, target) in enumerate(train_loader):
            data, target = data.to(device), target.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            output = model(data)
            loss = criterion(output, target)
            
            # Backpropagation
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = output.max(1)
            total += target.size(0)
            correct += predicted.eq(target).sum().item()

            if batch_idx % 100 == 0:
                print(f"Epoch {epoch+1}/{epochs} | Batch {batch_idx}/{len(train_loader)} | Loss: {loss.item():.4f}")

        epoch_loss = running_loss / len(train_loader)
        epoch_acc = 100. * correct / total
        train_losses.append(epoch_loss)
        train_accs.append(epoch_acc)

    # 5. Save Model Checkpoint
    if not os.path.exists('outputs/checkpoints'):
        os.makedirs('outputs/checkpoints')
    torch.save(model.state_dict(), 'outputs/checkpoints/mnist_model.pt')
    print("Model saved to outputs/checkpoints/mnist_model.pt")

    # 6. Generate Graphs
    plot_metrics(train_losses, train_accs)
    print("Metrics graph saved to outputs/graphs/training_metrics.png")

if __name__ == "__main__":
    # Ensure directories exist
    os.makedirs('datasets', exist_ok=True)
    os.makedirs('outputs/graphs', exist_ok=True)
    os.makedirs('outputs/checkpoints', exist_ok=True)
    
    train()