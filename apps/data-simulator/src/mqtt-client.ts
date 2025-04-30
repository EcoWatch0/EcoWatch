import mqtt, { MqttClient } from 'mqtt';
import { config } from './config';
import { EnvironmentalData } from './types';

export class MqttPublisher {
  private client: MqttClient | null = null;
  private connected: boolean = false;
  
  constructor() {
    this.setupClient();
  }
  
  private setupClient(): void {
    console.log(`Connecting to MQTT broker at ${config.mqtt.brokerUrl}...`);
    
    const options: mqtt.IClientOptions = {
      clientId: config.mqtt.clientId,
      clean: true,
      reconnectPeriod: 5000,
    };
    
    // Ajouter les identifiants si fournis
    if (config.mqtt.username && config.mqtt.password) {
      options.username = config.mqtt.username;
      options.password = config.mqtt.password;
    }
    
    this.client = mqtt.connect(config.mqtt.brokerUrl, options);
    
    this.client.on('connect', () => {
      this.connected = true;
      console.log('Connected to MQTT broker successfully');
    });
    
    this.client.on('error', (error) => {
      this.connected = false;
      console.error('MQTT connection error:', error);
    });
    
    this.client.on('close', () => {
      this.connected = false;
      console.log('MQTT connection closed');
    });
    
    this.client.on('reconnect', () => {
      console.log('Attempting to reconnect to MQTT broker...');
    });
  }
  
  public publishSensorData(data: EnvironmentalData): void {
    if (!this.client || !this.connected) {
      console.warn('Cannot publish: MQTT client not connected');
      return;
    }
    
    const topic = `ecowatch/sensors/${data.sensorId}/data`;
    const message = JSON.stringify(data);
    
    this.client.publish(topic, message, { qos: 1, retain: false }, (error) => {
      if (error) {
        console.error(`Failed to publish to ${topic}:`, error);
      } else {
        console.log(`Published to ${topic}: ${data.sensorId} with ${data.readings.length} readings`);
      }
    });
  }
  
  public publishAllSensorsData(dataArray: EnvironmentalData[]): void {
    dataArray.forEach(data => this.publishSensorData(data));
  }
  
  public close(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client) {
        resolve();
        return;
      }
      
      this.client.end(false, {}, () => {
        console.log('MQTT client closed');
        this.client = null;
        this.connected = false;
        resolve();
      });
    });
  }
} 