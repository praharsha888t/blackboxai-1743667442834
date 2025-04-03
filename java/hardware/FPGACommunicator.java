import java.io.*;
import java.net.*;
import java.util.*;

public class FPGACommunicator {
    private Socket socket;
    private PrintWriter out;
    private BufferedReader in;

    public FPGACommunicator(String host, int port) throws IOException {
        this.socket = new Socket(host, port);
        this.out = new PrintWriter(socket.getOutputStream(), true);
        this.in = new BufferedReader(new InputStreamReader(socket.getInputStream()));
    }

    public String sendCommand(String command) throws IOException {
        out.println(command);
        return in.readLine();
    }

    public void reconfigureFPGA(String bitstreamPath) throws IOException {
        // Send bitstream to FPGA for reconfiguration
        File file = new File(bitstreamPath);
        FileInputStream fis = new FileInputStream(file);
        byte[] buffer = new byte[4096];
        
        out.println("RECONFIGURE " + file.length());
        int bytesRead;
        while ((bytesRead = fis.read(buffer)) != -1) {
            socket.getOutputStream().write(buffer, 0, bytesRead);
        }
        fis.close();
    }

    public Map<String, String> readSensors() throws IOException {
        out.println("READ_SENSORS");
        Map<String, String> sensorData = new HashMap<>();
        String line;
        while (!(line = in.readLine()).equals("END_SENSORS")) {
            String[] parts = line.split(":");
            if (parts.length == 2) {
                sensorData.put(parts[0].trim(), parts[1].trim());
            }
        }
        return sensorData;
    }

    public void close() throws IOException {
        in.close();
        out.close();
        socket.close();
    }

    public static void main(String[] args) {
        try {
            FPGACommunicator comm = new FPGACommunicator("localhost", 5000);
            
            // Example usage
            comm.reconfigureFPGA("/path/to/bitstream.bit");
            Map<String, String> sensors = comm.readSensors();
            System.out.println("Sensor data: " + sensors);
            
            comm.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}