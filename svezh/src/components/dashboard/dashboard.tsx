import React, { useState, useEffect } from 'react';
import { devicesAPI, eventsAPI, registryAPI } from '../../services/api';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalClients: 0,
    totalDevices: 0,
    onlineDevices: 0,
    todayEvents: 0
  });
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Загружаем данные параллельно
      const [clientsRes, devicesRes, eventsRes] = await Promise.all([
        registryAPI.getClients(),
        devicesAPI.getDevices(),
        eventsAPI.getEvents({
          from: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
          to: new Date().toISOString()
        })
      ]);

      const devices = devicesRes.data || [];
      const onlineDevices = devices.filter((d: any) => d.status === 'online').length;

      setStats({
        totalClients: clientsRes.data.length,
        totalDevices: devices.length,
        onlineDevices,
        todayEvents: eventsRes.data.length
      });

      // Последние 5 событий
      setRecentEvents(eventsRes.data.slice(0, 5));
    } catch (error) {
      console.error('Ошибка загрузки дашборда:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка дашборда...</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Панель управления</h1>
        <p>Добро пожаловать, {user?.name}!</p>
      </div>

      {/* Статистика */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalClients}</div>
          <div className="stat-label">Всего клиентов</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.totalDevices}</div>
          <div className="stat-label">Устройств</div>
        </div>

        <div className="stat-card">
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {stats.onlineDevices}
          </div>
          <div className="stat-label">Онлайн устройств</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.todayEvents}</div>
          <div className="stat-label">Событий сегодня</div>
        </div>
      </div>

      {/* Последние события */}
      <div className="dashboard-section">
        <h2>Последние события FaceCheck</h2>
        <div className="recent-events">
          {recentEvents.length === 0 ? (
            <div className="no-events">Сегодня событий нет</div>
          ) : (
            recentEvents.map(event => (
              <div key={event.id} className="recent-event">
                <span className={`event-type ${event.type}`}>
                  {event.type === 'faceOk' ? '✅' : '❌'}
                </span>
                <span className="event-message">{event.attributes.message}</span>
                <span className="event-time">
                  {new Date(event.eventTime).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Быстрые действия */}
      <div className="dashboard-section">
        <h2>Быстрые действия</h2>
        <div className="quick-actions">
          <button className="action-btn" onClick={() => window.location.href = '/registry'}>
            📋 Добавить клиента
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/devices'}>
            📱 Просмотр устройств
          </button>
          <button className="action-btn" onClick={() => window.location.href = '/events'}>
            📊 Все события
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;