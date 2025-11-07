import React, { useState, useEffect } from 'react';
import { devicesAPI } from '../../services/api';
import { Device } from '../../types';


const Devices: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setError(null);
      const response = await devicesAPI.getDevices();
      setDevices(response.data || []);
    } catch (error) {
      console.error('Ошибка загрузки устройств:', error);
      setError('Не удалось загрузить устройства');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#27ae60';
      case 'offline': return '#e74c3c';
      default: return '#f39c12';
    }
  };

  // Безопасное получение статуса FaceID
  const getFaceStatus = (device: Device) => {
    const attributes = device.attributes || {};
    
    if (attributes.faceOk === true) return '✅ Пройдена';
    if (attributes.faceOk === false) return '❌ Не пройдена';
    return '❓ Не проверялась';
  };

  // Безопасное получение даты последней проверки
  const getLastFaceDate = (device: Device) => {
    const lastFaceAt = device.attributes?.lastFaceAt;
    if (!lastFaceAt) return null;
    
    try {
      return new Date(lastFaceAt).toLocaleString();
    } catch {
      return 'Некорректная дата';
    }
  };

  if (loading) return (
    <div className="loading">Загрузка устройств...</div>
  );

  if (error) return (
    <div className="error">
      <p>{error}</p>
      <button onClick={loadDevices}>Повторить попытку</button>
    </div>
  );

  return (
    <div className="devices-page">
      <div className="page-header">
        <h1>Устройства Traccar</h1>
        <span className="device-count">Всего: {devices.length}</span>
        <button onClick={loadDevices} className="refresh-btn">
          Обновить
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="no-devices">
          Устройства не найдены
        </div>
      ) : (
        <div className="devices-grid">
          {devices.map(device => (
            <div key={device.id} className="device-card">
              <div className="device-header">
                <h3>{device.name || 'Без имени'}</h3>
                <span 
                  className="status-indicator"
                  style={{ backgroundColor: getStatusColor(device.status || 'unknown') }}
                >
                  {device.status || 'unknown'}
                </span>
              </div>
              
              <div className="device-info">
                <p><strong>ID:</strong> {device.uniqueId || 'Не указан'}</p>
                <p><strong>FaceID:</strong> {getFaceStatus(device)}</p>
                
                {device.attributes?.lastFaceAt && (
                  <p><strong>Последняя проверка:</strong> {getLastFaceDate(device)}</p>
                )}
                
                {device.attributes?.lastFaceMsg && (
                  <p><strong>Результат:</strong> {device.attributes.lastFaceMsg}</p>
                )}
              </div>

              <div className="device-actions">
                <button className="btn-small">Подробнее</button>
                <button className="btn-small">Изменить</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Devices;