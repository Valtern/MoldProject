export type RoomStatus = 'safe' | 'warning' | 'critical';

export type ApplianceState = 'auto' | 'manual-on' | 'manual-off';

export interface GaugeData {
  value: number;
  min: number;
  max: number;
  unit: string;
  label: string;
  caption?: string;
}

export interface HumidityDataPoint {
  time: string;
  humidity: number;
}

export interface ApplianceControl {
  id: string;
  name: string;
  icon: string;
  state: ApplianceState;
}

export interface RoomData {
  id: string;
  name: string;
  status: RoomStatus;
  lastUpdated: string;
  temperature: GaugeData;
  humidity: GaugeData;
  lightLevel: GaugeData;
  humidityHistory: HumidityDataPoint[];
  appliances: ApplianceControl[];
  deviceID: string;
  safeLimit: number;
  criticalLimit: number;
}
