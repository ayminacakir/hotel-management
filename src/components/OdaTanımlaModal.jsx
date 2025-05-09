import React from 'react';
import { Modal, InputNumber, Select, Form, message } from 'antd';

const { Option } = Select;

function OdaTanımlaModal({ onKapat, onKaydet }) {
    const [form] = Form.useForm();

    const handleKaydet = () => {
        form.validateFields()
            .then(values => {
                onKaydet({
                    tur: values.odaTuru,
                    durum: "Dolu",
                    kackisi: values.kacKisi,
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
                    <Select placeholder="Oda Türü Seçiniz">
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
                    <InputNumber min={1} max={4} style={{ width: '100%' }} />
                </Form.Item>
            </Form>
        </Modal>
    );
}

export default OdaTanımlaModal;
