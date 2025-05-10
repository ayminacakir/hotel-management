import React, { useState, useEffect } from 'react';
import { Form, InputNumber, DatePicker, Select, Table, Button, Typography, message } from 'antd';
import dayjs from 'dayjs';
import './OdaFiyatlarıPage.css';

const { RangePicker } = DatePicker;
const { Title } = Typography;

function OdaFiyatlarıPage() {
  const [form] = Form.useForm();
  const [fiyatlar, setFiyatlar] = useState([]);

  // Oda türleri
  const odaTurleri = [
    { value: 'Tek Kişilik', label: 'Tek Kişilik' },
    { value: 'Çift Kişilik', label: 'Çift Kişilik' },
    { value: 'Aile', label: 'Aile' }
  ];

  // Calculate number of days between two dates
  const calculateDays = (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  useEffect(() => {
    // LocalStorage'dan mevcut fiyatları yükle
    const kayitliFiyatlar = JSON.parse(localStorage.getItem('odaFiyatlari')) || [];
    setFiyatlar(kayitliFiyatlar);
  }, []);

  const handleFiyatEkle = (values) => {
    const days = calculateDays(values.tarihAraligi[0], values.tarihAraligi[1]);
    const toplamFiyat = values.fiyat * days;

    const yeniFiyat = {
      id: Date.now(),
      odaTuru: values.odaTuru,
      fiyat: values.fiyat,
      toplamFiyat: toplamFiyat,
      tarihAraligi: {
        baslangic: values.tarihAraligi[0].format('YYYY-MM-DD'),
        bitis: values.tarihAraligi[1].format('YYYY-MM-DD')
      }
    };

    const guncelFiyatlar = [...fiyatlar, yeniFiyat];
    setFiyatlar(guncelFiyatlar);
    localStorage.setItem('odaFiyatlari', JSON.stringify(guncelFiyatlar));

    form.resetFields();
    message.success('Fiyat başarıyla eklendi');
  };

  const handleFiyatSil = (id) => {
    const guncelFiyatlar = fiyatlar.filter(fiyat => fiyat.id !== id);
    setFiyatlar(guncelFiyatlar);
    localStorage.setItem('odaFiyatlari', JSON.stringify(guncelFiyatlar));
    message.success('Fiyat başarıyla silindi');
  };

  const columns = [
    {
      title: 'Oda Türü',
      dataIndex: 'odaTuru',
      key: 'odaTuru',
    },
    {
      title: 'Tarih Aralığı',
      key: 'tarihAraligi',
      render: (_, record) => (
        `${record.tarihAraligi.baslangic} - ${record.tarihAraligi.bitis}`
      ),
    },
    {
      title: 'Toplam Fiyat (TL)',
      key: 'toplamFiyat',
      render: (_, record) => `${record.toplamFiyat} TL`,
    },
    {
      title: 'İşlemler',
      key: 'islemler',
      render: (_, record) => (
        <Button
          type="link"
          danger
          onClick={() => handleFiyatSil(record.id)}
        >
          Sil
        </Button>
      ),
    },
  ];

  return (
    <div className="oda-fiyatlari-container">
      <Title level={2}>Oda Fiyatları Yönetimi</Title>

      <div className="fiyat-form-container">
        <Form
          form={form}
          onFinish={handleFiyatEkle}
          layout="vertical"
        >
          <Form.Item
            name="odaTuru"
            label="Oda Türü"
            rules={[{ required: true, message: 'Lütfen oda türü seçin' }]}
          >
            <Select options={odaTurleri} placeholder="Oda türü seçin" />
          </Form.Item>

          <Form.Item
            name="tarihAraligi"
            label="Tarih Aralığı"
            rules={[{ required: true, message: 'Lütfen tarih aralığı seçin' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="fiyat"
            label="Günlük Fiyat (TL)"
            rules={[{ required: true, message: 'Lütfen fiyat girin' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `${value} TL`}
              parser={value => value.replace(' TL', '')}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Fiyat Ekle
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="fiyat-tablo-container">
        <Table
          columns={columns}
          dataSource={fiyatlar}
          rowKey="id"
          pagination={false}
        />
      </div>
    </div>
  );
}

export default OdaFiyatlarıPage;
