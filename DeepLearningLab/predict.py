import torch
import torch.nn as nn
from torchvision import datasets, transforms
import matplotlib.pyplot as plt
import sys
import os

# Minimal Model definition for loading
class SimpleCNN(nn.Module):
    def __init__(self):
        super(SimpleCNN, self).__init__()
        self.conv1 = nn.Conv2d(1, 32, 3)
        self.conv2 = nn.Conv2d(32, 64, 3)
        self.fc1 = nn.Linear(64 * 12 * 12, 128)
        self.fc2 = nn.Linear(128, 10)
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(2, 2)

    def forward(self, x):
        x = self.relu(self.conv1(x))
        x = self.pool(self.relu(self.conv2(x)))
        x = x.view(-1, 64 * 12 * 12)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x

def predict():
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = SimpleCNN().to(device)
    
    checkpoint_path = 'outputs/checkpoints/mnist_model.pt'
    if not os.path.exists(checkpoint_path):
        print("Error: No model checkpoint found. Run training first.")
        return

    model.load_state_dict(torch.load(checkpoint_path, map_location=device))
    model.eval()

    # Get sample data
    transform = transforms.ToTensor()
    test_dataset = datasets.MNIST(root='./datasets', train=False, download=True, transform=transform)
    
    # Predict on first sample
    img, label = test_dataset[0]
    with torch.no_grad():
        output = model(img.unsqueeze(0).to(device))
        prediction = output.argmax(dim=1, keepdim=True).item()

    print(f"Actual Label: {label} | Predicted Label: {prediction}")
    
    plt.imshow(img.squeeze(), cmap='gray')
    plt.title(f"Prediction: {prediction}")
    plt.savefig('outputs/predictions/sample_inference.png')

if __name__ == "__main__":
    os.makedirs('outputs/predictions', exist_ok=True)
    predict()