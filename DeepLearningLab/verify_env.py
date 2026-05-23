import torch
import sys
import os

def verify():
    print("--- Environment Verification ---")
    print(f"Python Version: {sys.version}")
    print(f"Is venv active: {'venv' in sys.prefix}")
    
    # PyTorch Check
    print(f"PyTorch Version: {torch.__version__}")
    
    # GPU Check
    cuda_available = torch.cuda.is_available()
    print(f"CUDA Available (GPU): {cuda_available}")
    if cuda_available:
        print(f"GPU Device: {torch.cuda.get_device_name(0)}")
    else:
        print("Running on CPU mode.")

    # Package Check
    packages = ['numpy', 'pandas', 'matplotlib', 'sklearn']
    for p in packages:
        try:
            __import__(p)
            print(f"Package '{p}': OK")
        except ImportError:
            print(f"Package '{p}': MISSING")

if __name__ == "__main__":
    verify()
    print("--- Verification Complete ---")