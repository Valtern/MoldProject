import sys
import subprocess
import os

def check_env():
    print("=== Environment Validation ===")
    
    # 1. Python Version
    print(f"[1/4] Python Version: {sys.version.split()[0]}")
    is_venv = sys.prefix != sys.base_prefix
    print(f"      Virtual Env: {'Active' if is_venv else 'Inactive (Using Global Python)'}")

    # Check for core project files
    req_exists = os.path.exists("requirements.txt")
    print(f"      requirements.txt: {'Found' if req_exists else 'MISSING'}")
    
    train_exists = os.path.exists(os.path.join("training", "train.py"))
    print(f"      Training script: {'Found' if train_exists else 'MISSING'}")

    # 2. PyTorch & CUDA
    try:
        import torch
        print(f"[2/4] PyTorch Version: {torch.__version__}")
        if torch.cuda.is_available():
            print(f"      CUDA Status: Available (GPU: {torch.cuda.get_device_name(0)})")
        else:
            print("      CUDA Status: Not Available (Using CPU)")
    except ImportError:
        print("[2/4] PyTorch: NOT FOUND. Run 'pip install torch torchvision'")

    # 3. Jupyter
    try:
        import jupyterlab
        print("[3/4] Jupyter Lab: Installed")
    except ImportError:
        try:
            import notebook
            print("[3/4] Jupyter Notebook: Installed")
        except ImportError:
            print("[3/4] Jupyter: NOT FOUND. Run 'pip install jupyterlab'")

    # 4. Docker
    print("[4/4] Docker Status:")
    try:
        # Run 'docker version' to see if daemon is active (faster on Windows)
        result = subprocess.run(
            ["docker", "version"], 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL, 
            text=True
        )
        if result.returncode == 0:
            print("      Daemon: RUNNING")
        else:
            print("      Daemon: NOT RUNNING. Please start Docker Desktop.")
    except FileNotFoundError:
        print("      Docker: NOT INSTALLED.")
    print("==============================")

if __name__ == "__main__":
    check_env()