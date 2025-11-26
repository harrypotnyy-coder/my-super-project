import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMapEvents } from 'react-leaflet';
import api from '../../services/api';
import 'leaflet/dist/leaflet.css';
import './GeoZoneManager.css';

interface GeoZone {
  id: number;
  name: string;
  clientId: number;
  polygonCoordinates: number[][];
  isActive: boolean;
}

interface Client {
  id: number;
  fio: string;
}

const MapClickHandler: React.FC<{ isDrawing: boolean; onAddPoint: (coordinates: [number, number]) => void }> = ({ isDrawing, onAddPoint }) => {
  useMapEvents({
    click(e) {
      if (isDrawing) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return null;
};

export const GeoZoneManager: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [geoZones, setGeoZones] = useState<GeoZone[]>([]);
  const [zoneName, setZoneName] = useState('');
  const [drawnCoordinates, setDrawnCoordinates] = useState<number[][] | null>(null);
  const [mapCenter] = useState<[number, number]>([42.8746, 74.5698]); // Бишкек
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    if (selectedClientId) {
      loadGeoZones(selectedClientId);
    } else {
      setGeoZones([]);
    }
  }, [selectedClientId]);

  const loadClients = async () => {
    try {
      const response = await api.get('/admin/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
    }
  };

  const loadGeoZones = async (clientId: number) => {
    try {
      const response = await api.get(`/geozones/client/${clientId}`);
      setGeoZones(response.data);
    } catch (error) {
      console.error('Error loading geozones:', error);
    }
  };

  const handlePolygonPoint = (coordinates: [number, number]) => {
    setDrawnCoordinates(prev => [...(prev ?? []), coordinates]);
  };

  const startDrawing = () => {
    setDrawnCoordinates([]);
    setIsDrawing(true);
  };

  const finishDrawing = () => setIsDrawing(false);

  const clearDrawing = () => {
    setDrawnCoordinates(null);
    setIsDrawing(false);
  };

  const saveGeoZone = async () => {
    if (!selectedClientId || !drawnCoordinates || !zoneName.trim()) {
      alert('Пожалуйста, выберите осужденного, нарисуйте зону и введите название');
      return;
    }

    try {
      await api.post('/geozones', {
        clientId: selectedClientId,
        name: zoneName,
        polygonCoordinates: drawnCoordinates,
        isActive: true
      });

      setZoneName('');
      setDrawnCoordinates(null);
      setIsDrawing(false);
      loadGeoZones(selectedClientId);
      alert('Геозона успешно создана!');
    } catch (error: any) {
      console.error('Error creating geozone:', error);
      alert(`Ошибка: ${error.response?.data?.message || error.message}`);
    }
  };

  const toggleActive = async (zone: GeoZone) => {
    try {
      await api.put(`/geozones/${zone.id}`, {
        ...zone,
        isActive: !zone.isActive
      });
      loadGeoZones(selectedClientId!);
    } catch (error) {
      console.error('Error toggling geozone:', error);
      alert('Ошибка при изменении статуса геозоны');
    }
  };

  const handleDelete = async (zoneId: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту геозону?')) return;

    try {
      await api.delete(`/geozones/${zoneId}`);
      loadGeoZones(selectedClientId!);
      alert('Геозона удалена');
    } catch (error) {
      console.error('Error deleting geozone:', error);
      alert('Ошибка при удалении геозоны');
    }
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);

  return (
    <div className="geozone-manager">
      <div className="geozone-header">
        <h1>Управление геозонами</h1>
        <p className="subtitle">Создавайте и управляйте зонами контроля для осужденных</p>
      </div>

      <div className="geozone-content">
        <div className="control-panel">
          <div className="panel-card">
            <h2>Выбор осужденного</h2>
            <div className="client-selector">
              <select
                value={selectedClientId || ''}
                onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}
                className="styled-select"
              >
                <option value="">Выберите осужденного</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.fio}
                  </option>
                ))}
              </select>
            </div>

            {selectedClient && (
              <div className="selected-client-info">
                <div className="info-badge">
                  <span className="badge-label">Выбран:</span>
                  <span className="badge-value">{selectedClient.fio}</span>
                </div>
              </div>
            )}
          </div>

          {selectedClientId && (
            <>
              <div className="panel-card">
                <h2>Создать геозону</h2>
                <div className="create-zone-form">
                  <div className="form-group">
                    <label>Название зоны</label>
                    <input
                      type="text"
                      value={zoneName}
                      onChange={(e) => setZoneName(e.target.value)}
                      placeholder="Например: Дом, Работа"
                      className="styled-input"
                    />
                  </div>

                  <div className="draw-controls">
                    <button onClick={startDrawing} className="btn-save" type="button">
                      Начать рисование
                    </button>
                    <button onClick={finishDrawing} className="btn-secondary" type="button" disabled={!isDrawing}>
                      Завершить рисование
                    </button>
                    <button onClick={clearDrawing} className="btn-secondary" type="button" disabled={!drawnCoordinates?.length}>
                      Очистить
                    </button>
                  </div>

                  <div className="instructions">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                      <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                    </svg>
                    <span>Нажмите на карту, чтобы добавить точки полигона, затем сохраните зону</span>
                  </div>

                  {drawnCoordinates && (
                    <div className="success-message">
                      ✓ Зона нарисована ({drawnCoordinates.length} точек)
                    </div>
                  )}

                  <button
                    onClick={saveGeoZone}
                    disabled={!drawnCoordinates || drawnCoordinates.length < 3 || !zoneName.trim()}
                    className="btn-save"
                  >
                    Сохранить геозону
                  </button>
                </div>
              </div>

              <div className="panel-card">
                <h2>Существующие зоны</h2>
                {geoZones.length === 0 ? (
                  <div className="empty-state">
                    <p>Нет созданных геозон</p>
                  </div>
                ) : (
                  <div className="zones-list">
                    {geoZones.map(zone => (
                      <div key={zone.id} className={`zone-item ${zone.isActive ? 'active' : 'inactive'}`}>
                        <div className="zone-info">
                          <h3>{zone.name}</h3>
                          <span className={`status-badge ${zone.isActive ? 'active' : 'inactive'}`}>
                            {zone.isActive ? 'Активна' : 'Неактивна'}
                          </span>
                        </div>
                        <div className="zone-actions">
                          <button
                            onClick={() => toggleActive(zone)}
                            className="btn-toggle"
                          >
                            {zone.isActive ? 'Деактивировать' : 'Активировать'}
                          </button>
                          <button
                            onClick={() => handleDelete(zone.id)}
                            className="btn-delete"
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="map-container-wrapper">
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler isDrawing={isDrawing} onAddPoint={handlePolygonPoint} />

            {drawnCoordinates && drawnCoordinates.length > 0 && (
              <Polygon
                positions={drawnCoordinates as [number, number][]}
                pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, dashArray: '4 4' }}
              />
            )}

            {geoZones.map(zone => (
              <Polygon
                key={zone.id}
                positions={zone.polygonCoordinates.map(coord => [coord[0], coord[1]])}
                pathOptions={{
                  color: zone.isActive ? '#3b82f6' : '#9ca3af',
                  fillColor: zone.isActive ? '#3b82f6' : '#9ca3af',
                  fillOpacity: 0.2
                }}
              >
                <Popup>
                  <div className="popup-content">
                    <strong>{zone.name}</strong>
                    <p>Статус: {zone.isActive ? 'Активна' : 'Неактивна'}</p>
                  </div>
                </Popup>
              </Polygon>
            ))}
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default GeoZoneManager;
