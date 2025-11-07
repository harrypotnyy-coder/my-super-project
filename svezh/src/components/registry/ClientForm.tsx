import React, { useState } from 'react';
import { registryAPI } from '../../services/api';

interface ClientFormProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    inn: '',
    noInn: false,
    lastName: '',
    firstName: '',
    middleName: '',
    birthDate: '',
    sex: '',
    passport: '',
    regAddress: '',
    factAddress: '',
    contact1: '',
    contact2: '',
    erpNumber: '',
    obsStart: '',
    obsEnd: '',
    obsType: 'Электронный надзор',
    degree: '',
    udNumber: '',
    code: '',
    article: '',
    part: '',
    point: '',
    extraInfo: '',
    measures: '',
    appPassword: '',
    unit: ''
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Добавляем данные формы
      const requestData = {
        ...formData,
        noInn: formData.noInn || undefined
      };
      formDataToSend.append('request', new Blob([JSON.stringify(requestData)], {
        type: 'application/json'
      }));

      // Добавляем фото если есть
      if (photo) {
        formDataToSend.append('photo', photo);
      }

      await registryAPI.createClient(formDataToSend);
      onSuccess();
    } catch (error) {
      console.error('Ошибка создания клиента:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Добавить клиента</h2>
          <button onClick={onClose} className="close-button">×</button>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          <div className="form-row">
            <div className="form-group">
              <label>Фамилия *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Имя *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Отчество</label>
              <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>ИНН</label>
              <input
                type="text"
                name="inn"
                value={formData.inn}
                onChange={handleChange}
                disabled={formData.noInn}
              />
            </div>

            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  name="noInn"
                  checked={formData.noInn}
                  onChange={handleChange}
                />
                Без ИНН
              </label>
            </div>

            <div className="form-group">
              <label>Дата рождения</label>
              <input
                type="date"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Тип надзора *</label>
              <select
                name="obsType"
                value={formData.obsType}
                onChange={handleChange}
                required
              >
                <option value="Электронный надзор">Электронный надзор</option>
                <option value="Мобильное приложение">Мобильное приложение</option>
                <option value="Иное">Иное</option>
              </select>
            </div>

            <div className="form-group">
              <label>Пол</label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleChange}
              >
                <option value="">Выберите</option>
                <option value="М">Мужской</option>
                <option value="Ж">Женский</option>
              </select>
            </div>

            <div className="form-group">
              <label>Подразделение</label>
              <input
                type="text"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Пароль для приложения *</label>
            <input
              type="password"
              name="appPassword"
              value={formData.appPassword}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Эталонное фото</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-secondary">
              Отмена
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Создание...' : 'Создать клиента'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;