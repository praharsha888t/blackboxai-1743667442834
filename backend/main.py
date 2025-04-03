from simulations.vlsi_engine import app as simulation_app
from ml_models.material_prediction import MaterialPredictor
from quantum.quantum_circuit import QuantumVLSOptimizer
import threading
import webbrowser

def start_simulation_service():
    """Start the VLSI simulation Flask service"""
    simulation_app.run(host='0.0.0.0', port=8000)

def initialize_ai_models():
    """Initialize and warm up AI models"""
    print("Initializing AI models...")
    material_predictor = MaterialPredictor()
    quantum_optimizer = QuantumVLSOptimizer()
    print("AI models ready")

def open_browser():
    """Open web browser to frontend"""
    webbrowser.open('http://localhost:8000')

if __name__ == '__main__':
    # Start services in separate threads
    sim_thread = threading.Thread(target=start_simulation_service)
    sim_thread.daemon = True
    sim_thread.start()

    # Initialize AI components
    ai_thread = threading.Thread(target=initialize_ai_models)
    ai_thread.daemon = True
    ai_thread.start()

    # Launch browser (commented out for web environment)
    # browser_thread = threading.Thread(target=open_browser)
    # browser_thread.start()

    print("""
    AI VLSI Design Platform running!
    -------------------------------
    Simulation API: http://localhost:8000
    Frontend: file:///project/sandbox/user-workspace/frontend/pages/index.html
    """)

    # Keep main thread alive
    try:
        while True:
            pass
    except KeyboardInterrupt:
        print("\nShutting down services...")