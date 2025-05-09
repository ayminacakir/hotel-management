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

  // Mevsimler
  const mevsimler = [
    { value: 'Yüksek Sezon', label: 'Yüksek Sezon' },
    { value: 'Normal Sezon', label: 'Normal Sezon' },
    { value: 'Düşük Sezon', label: 'Düşük Sezon' }
  ];

  useEffect(() => {
    // LocalStorage'dan mevcut fiyatları yükle
    const kayitliFiyatlar = JSON.parse(localStorage.getItem('odaFiyatlari')) || [];
    setFiyatlar(kayitliFiyatlar);
  }, []);

  const handleFiyatEkle = (values) => {
    const yeniFiyat = {
      id: Date.now(),
      odaTuru: values.odaTuru,
      mevsim: values.mevsim,
      fiyat: values.fiyat,
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
      title: 'Mevsim',
      dataIndex: 'mevsim',
      key: 'mevsim',
    },
    {
      title: 'Tarih Aralığı',
      key: 'tarihAraligi',
      render: (_, record) => (
        `${record.tarihAraligi.baslangic} - ${record.tarihAraligi.bitis}`
      ),
    },
    {
      title: 'Fiyat (TL)',
      dataIndex: 'fiyat',
      key: 'fiyat',
      render: (fiyat) => `${fiyat} TL`,
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
            name="mevsim"
            label="Mevsim"
            rules={[{ required: true, message: 'Lütfen mevsim seçin' }]}
          >
            <Select options={mevsimler} placeholder="Mevsim seçin" />
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
            label="Fiyat (TL)"
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
