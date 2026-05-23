import torch
import torch.nn as nn


class MNISTConvNet(nn.Module):
    """
    Convolutional Neural Network for MNIST classification.
    
    Architecture:
    - Conv2d(1, 32, 3) + ReLU + MaxPool2d(2,2)
    - Conv2d(32, 64, 3) + ReLU + MaxPool2d(2,2)
    - Flatten
    - Linear(64*12*12, 128) + ReLU
    - Linear(128, 10) [output layer]
    """
    
    def __init__(self):
        super(MNISTConvNet, self).__init__()
        # Convolutional layers
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=0)
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=0)
        
        # Pooling and activation
        self.relu = nn.ReLU()
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        
        # Fully connected layers
        # After conv1(28→26) + pool(→13): 32x13x13
        # After conv2(13→11) + pool(→5): 64x5x5
        # Flattened: 64 * 5 * 5 = 1600
        self.fc1 = nn.Linear(64 * 5 * 5, 128)  # Fixed: 1600, not 9216
        self.fc2 = nn.Linear(128, 10)  # 10 classes for digits 0-9
        
    def forward(self, x):
        # First convolutional block
        x = self.conv1(x)
        x = self.relu(x)
        x = self.pool(x)
        
        # Second convolutional block
        x = self.conv2(x)
        x = self.relu(x)
        x = self.pool(x)
        
        # Flatten for fully connected layers
        x = x.view(x.size(0), -1)
        
        # Fully connected layers
        x = self.fc1(x)
        x = self.relu(x)
        x = self.fc2(x)
        
        return x
