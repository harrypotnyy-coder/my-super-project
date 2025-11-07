import React, { useState, useEffect } from 'react';
import { eventsAPI } from '../../services/api';
import { FaceCheckEvent } from '../../types';

const Events: React.FC = () => {
  const [events, setEvents] = useState<FaceCheckEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    from: '',
    to: '',
    deviceId: ''
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (filtersToUse = filters) => {
    try {
      const params: any = {};
      if (filtersToUse.from) params.from = filtersToUse.from;
      if (filtersToUse.to) params.to = filtersToUse.to;
      if (filtersToUse.deviceId) params.deviceId = parseInt(filtersToUse.deviceId);

      const response = await eventsAPI.getEvents(params);
      setEvents(response.data);
    } catch (error) {
      console.error('Ошибка загрузки событий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setLoading(true);
    loadEvents();
  };

  const resetFilters = () => {
    setFilters({
      from: '',
      to: '',
      deviceId: ''
    });
  };

  const getEventIcon = (type: string) => {
    return type === 'faceOk' ? '✅' : '❌';
  };

  const getEventColor = (type: string) => {
    return type === 'faceOk' ? '#27ae60' : '#e74c3c';
  };

  if (loading) return <div>Загрузка событий...</div>;

  return (
    <div className="events-page">
      <div className="page-header">
        <h1>События FaceCheck</h1>
      </div>

      {/* Современные фильтры */}
      <div className="events-filters">
        <div className="filters-header">
          <h3>Фильтры</h3>
        </div>
        
        <div className="filters-grid">
          <div className="filter-group">
            <label>Дата начала</label>
            <input
              type="datetime-local"
              className="filter-input"
              value={filters.from}
              onChange={(e) => handleFilterChange('from', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Дата окончания</label>
            <input
              type="datetime-local"
              className="filter-input"
              value={filters.to}
              onChange={(e) => handleFilterChange('to', e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>ID устройства</label>
            <input
              type="number"
              className="filter-input"
              value={filters.deviceId}
              onChange={(e) => handleFilterChange('deviceId', e.target.value)}
              placeholder="Все устройства"
            />
          </div>
        </div>
        
        <div className="filter-actions">
          <button onClick={applyFilters} className="filter-apply-btn">
            Применить фильтры
          </button>
          <button onClick={resetFilters} className="filter-reset-btn">
            Сбросить
          </button>
        </div>
      </div>

      {/* Список событий */}
      <div className="events-list">
        {events.length === 0 ? (
          <div className="no-events">События не найдены</div>
        ) : (
          events.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-icon" style={{ color: getEventColor(event.type) }}>
                {getEventIcon(event.type)}
              </div>
              
              <div className="event-details">
                <div className="event-message">
                  {event.attributes.message}
                </div>
                <div className="event-meta">
                  <span>Время: {new Date(event.eventTime).toLocaleString()}</span>
                  <span>Устройство: {event.deviceId || 'Не указано'}</span>
                  {event.attributes.distance && (
                    <span>Расстояние: {event.attributes.distance.toFixed(4)}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;