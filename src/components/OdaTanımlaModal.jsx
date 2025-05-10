import React, { useState } from 'react';
import { Modal, InputNumber, Select, Form, message } from 'antd';

const { Option } = Select;

function OdaTanımlaModal({ onKapat, onKaydet }) {
    const [form] = Form.useForm();
    const [selectedRoomType, setSelectedRoomType] = useState("");

    const handleRoomTypeChange = (value) => {
        setSelectedRoomType(value);
        // Reset kacKisi when room type changes
        form.setFieldsValue({ kacKisi: value === "Aile" ? 3 : value === "Çift Kişilik" ? 2 : 1 });
    };

    const handleKaydet = () => {
        form.validateFields()
            .then(values => {
                onKaydet({
                    tur: values.odaTuru,
                    durum: "Dolu",
                    kackisi: values.kacKisi.toString(),
                });
                onKapat();
            })
            .catch(() => {
                message.error("Lütfen gerekli alanları doldurun.");
            });
    };

    return (
        <Modal
            title="Oda Tanımla"
            open={true}
            onOk={handleKaydet}
            onCancel={onKapat}
            okText="Tanımla"
            cancelText="İptal"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    odaTuru: "",
                    kacKisi: 1,
                }}
            >
                <Form.Item
                    label="Oda Türü"
                    name="odaTuru"
                    rules={[{ required: true, message: "Lütfen oda türü seçin." }]}
                >
                    <Select
                        placeholder="Oda Türü Seçiniz"
                        onChange={handleRoomTypeChange}
                    >
                        <Option value="Tek Kişilik">Tek Kişilik</Option>
                        <Option value="Çift Kişilik">Çift Kişilik</Option>
                        <Option value="Aile">Aile</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    label="Kaç Kişi"
                    name="kacKisi"
                    rules={[{ required: true }]}
                >
                    <InputNumber
                        min={selectedRoomType === "Aile" ? 3 : selectedRoomType === "Çift Kişilik" ? 2 : 1}
                        max={selectedRoomType === "Aile" ? 4 : selectedRoomType === "Çift Kişilik" ? 2 : 1}
                        style={{ width: '100%' }}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default OdaTanımlaModal;
