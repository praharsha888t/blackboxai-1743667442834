import numpy as np
from scipy.integrate import odeint
from flask import Flask, jsonify

app = Flask(__name__)

class VLSISimulator:
    """Core simulation engine for transistor behavior and thermal analysis"""
    
    def __init__(self):
        self.thermal_params = {
            'k': 1.38e-23,  # Boltzmann constant
            'q': 1.6e-19    # Electron charge
        }
    
    def simulate_transistor(self, vgs, vds, temp=300):
        """Simulate MOSFET behavior using simplified EKV model"""
        # Basic EKV model parameters
        n = 1.5  # Subthreshold slope factor
        vt = 0.7  # Threshold voltage
        ispec = 1e-6  # Specific current
        
        # Calculate drain current
        ids = ispec * (np.log(1 + np.exp((vgs - vt)/(2*n*self.thermal_params['k']*temp/self.thermal_params['q']))))**2
        
        return {
            'current': float(ids),
            'power': float(ids * vds),
            'temperature': temp
        }

    def thermal_analysis(self, power, time_points):
        """Solve thermal diffusion equation"""
        def heat_eqn(T, t, power):
            # Simplified 1D heat equation
            alpha = 1.5e-4  # Thermal diffusivity (cm²/s)
            return alpha * power - 0.1 * (T - 300)  # Cooling term
            
        temps = odeint(heat_eqn, 300, time_points, args=(power,))
        return temps.flatten().tolist()

# API Endpoints
@app.route('/simulate/transistor', methods=['GET'])
def transistor_simulation():
    vgs = float(request.args.get('vgs', 1.2))
    vds = float(request.args.get('vds', 1.8))
    temp = float(request.args.get('temp', 300))
    simulator = VLSISimulator()
    return jsonify(simulator.simulate_transistor(vgs, vds, temp))

@app.route('/simulate/thermal', methods=['GET'])
def thermal_simulation():
    power = float(request.args.get('power', 0.1))
    time_points = np.linspace(0, 10, 100)
    simulator = VLSISimulator()
    return jsonify(simulator.thermal_analysis(power, time_points))

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)