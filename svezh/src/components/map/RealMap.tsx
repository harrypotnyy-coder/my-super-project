// components/map/RealMap.tsx
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { devicesAPI } from '../../services/api';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Кастомные иконки вместо стандартных
const createCustomIcon = (status: string) => {
  return new L.DivIcon({
    html: `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${status === 'online' ? '#27ae60' : '#e74c3c'};
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 18px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        👤
      </div>
    `,
    className: 'custom-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
};

interface DeviceWithPosition {
  id: number;
  name: string;
  uniqueId: string;
  status: string;
  attributes: any;
  position?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
}

// Координаты Бишкека
const BISHKEK_CENTER = [42.8746, 74.5698] as [number, number];

const RealMap: React.FC = () => {
  const [devices, setDevices] = useState<DeviceWithPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      const devicesResponse = await devicesAPI.getDevices();
      const devicesData = devicesResponse.data || [];
      
      // Если нет реальных устройств, используем тестовые
      let devicesWithPositions;
      if (devicesData.length === 0) {
        devicesWithPositions = getMockDevices();
      } else {
        devicesWithPositions = devicesData.map((device: any, index: number) => {
          const bishkekLocations = [
            [42.8746, 74.5698], // Центр Бишкека
            [42.8784, 74.5865], // Проспект Чуй
            [42.8510, 74.5585], // Юг города
            [42.8900, 74.6100], // Северо-восток
            [42.8600, 74.5400], // Запад
            [42.8350, 74.5900], // Ошский рынок
          ];
          
          const location = bishkekLocations[index % bishkekLocations.length];
          
          return {
            ...device,
            position: {
              latitude: location[0],
              longitude: location[1],
              timestamp: new Date().toISOString()
            }
          };
        });
      }

      console.log('Устройства для карты:', devicesWithPositions);
      setDevices(devicesWithPositions);
    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
      // Используем тестовые данные при ошибке
      setDevices(getMockDevices());
    } finally {
      setLoading(false);
    }
  };

  // Тестовые устройства в Бишкеке с названиями "Клиент 1", "Клиент 2" и т.д.
  const getMockDevices = (): DeviceWithPosition[] => {
    return [
      {
        id: 1,
        name: 'Клиент 1',
        uniqueId: 'bishkek001',
        status: 'online',
        attributes: { faceOk: true, lastFaceAt: new Date().toISOString() },
        position: { latitude: 42.8746, longitude: 74.5698, timestamp: new Date().toISOString() }
      },
      {
        id: 2,
        name: 'Клиент 2',
        uniqueId: 'bishkek002',
        status: 'online',
        attributes: { faceOk: false, lastFaceAt: new Date().toISOString() },
        position: { latitude: 42.8784, longitude: 74.5865, timestamp: new Date().toISOString() }
      },
      {
        id: 3,
        name: 'Клиент 3',
        uniqueId: 'bishkek003',
        status: 'offline',
        attributes: { faceOk: null },
        position: { latitude: 42.8510, longitude: 74.5585, timestamp: new Date().toISOString() }
      },
      {
        id: 4,
        name: 'Клиент 4',
        uniqueId: 'bishkek004',
        status: 'online',
        attributes: { faceOk: true, lastFaceAt: new Date().toISOString() },
        position: { latitude: 42.8900, longitude: 74.6100, timestamp: new Date().toISOString() }
      },
      {
        id: 5,
        name: 'Клиент 5',
        uniqueId: 'bishkek005',
        status: 'offline',
        attributes: { faceOk: false, lastFaceAt: new Date().toISOString() },
        position: { latitude: 42.8600, longitude: 74.5400, timestamp: new Date().toISOString() }
      }
    ];
  };

  const getStatusColor = (status: string) => {
    return status === 'online' ? '#27ae60' : '#e74c3c';
  };

  const getStatusText = (status: string) => {
    return status === 'online' ? '🟢 Онлайн' : '🔴 Оффлайн';
  };

  if (!isClient) {
    return (
      <div className="map-loading">
        <div>Инициализация карты...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="map-loading">
        <div>Загрузка устройств...</div>
      </div>
    );
  }

  const devicesWithValidPositions = devices.filter(device => 
    device.position && 
    !isNaN(device.position.latitude) && 
    !isNaN(device.position.longitude)
  );

  return (
    <div className="real-map-page">
      <div className="map-content-wrapper">
        <div className="map-container-wrapper" style={{ position: 'relative' }}>
          <MapContainer 
            center={BISHKEK_CENTER} 
            zoom={12} 
            style={{ 
              height: '100%', 
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0
            }}
            className="real-map"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {devicesWithValidPositions.map(device => (
              <Marker 
                key={device.id}
                position={[device.position!.latitude, device.position!.longitude]}
                icon={createCustomIcon(device.status)}
              >
                <Popup>
                  <div className="device-popup">
                    <h3>{device.name}</h3>
                    <div className="popup-details">
                      <p><strong>ID:</strong> {device.uniqueId}</p>
                      <p><strong>Статус:</strong> 
                        <span style={{color: getStatusColor(device.status), marginLeft: '5px'}}>
                          {getStatusText(device.status)}
                        </span>
                      </p>
                      <p><strong>FaceID:</strong> 
                        {device.attributes?.faceOk === true ? ' ✅ Пройдена' : 
                         device.attributes?.faceOk === false ? ' ❌ Не пройдена' : ' ❓ Не проверялась'}
                      </p>
                      {device.attributes?.lastFaceAt && (
                        <p><strong>Последняя проверка:</strong> 
                          {new Date(device.attributes.lastFaceAt).toLocaleString()}
                        </p>
                      )}
                      <p><strong>Локация:</strong> Бишкек</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="devices-sidebar">
          <h3>Устройства в Бишкеке ({devices.length})</h3>
          <div className="devices-list">
            {devices.map(device => (
              <div key={device.id} className="device-item">
                <div className="device-header">
                  <span className="device-name">{device.name}</span>
                  <span className={`device-status ${device.status}`}>
                    {device.status === 'online' ? '🟢' : '🔴'}
                  </span>
                </div>
                <div className="device-id">{device.uniqueId}</div>
                {device.position ? (
                  <div className="device-position">
                    📍 {device.position.latitude.toFixed(4)}, {device.position.longitude.toFixed(4)}
                  </div>
                ) : (
                  <div className="no-position">📍 Нет данных о позиции</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealMap;