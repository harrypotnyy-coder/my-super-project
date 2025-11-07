export interface User {
  id: number;
  name: string;
  email: string;
  administrator: boolean;
  attributes: {
    role: string;
    mruId?: string;
    districtIds: number[];
  };
}

export interface Client {
  id: number;
  fio: string;
  inn: string | null;
  uniqueId: string;
  obsType: string;
  birthDate?: string;
  unit?: string;
  photoKey?: string;
}

export interface Device {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  attributes: {
    faceOk?: boolean;
    lastFaceAt?: string;
    lastFaceMsg?: string;
  };
}

export interface FaceCheckEvent {
  id: string;
  type: 'faceOk' | 'faceIdFail';
  eventTime: string;
  deviceId: number;
  userId: number;
  attributes: {
    message: string;
    distance?: number;
  };
}