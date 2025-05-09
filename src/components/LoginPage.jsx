import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Form,
    Input,
    Button,
    Checkbox,
    Typography,
    Card,
    Space,
    message
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    LoginOutlined
} from "@ant-design/icons";
import "./LoginPage.css";

const { Title } = Typography;

function LoginPage() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const onFinish = (values) => {
        const { email, password } = values;

        if (email && password) {
            localStorage.setItem("token", "some-auth-token");
            setIsLoggedIn(true);
        } else {
            message.error("Lütfen email ve şifre giriniz.");
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/home");
        }
    }, [isLoggedIn, navigate]);

    return (
        <div className="login-page" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "#f0f2f5" }}>
            <Card style={{ width: 400, padding: 24 }}>
                <Space direction="vertical" style={{ width: "100%", textAlign: "center" }}>
                    <Title level={2}>GİRİŞ YAP</Title>
                    <LoginOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                </Space>

                <Form
                    name="login"
                    layout="vertical"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    style={{ marginTop: 24 }}
                >
                    <Form.Item
                        name="email"
                        rules={[
                            { required: true, message: "Lütfen email adresinizi giriniz!" },
                            { type: "email", message: "Geçerli bir email adresi giriniz!" }
                        ]}
                    >
                        <Input
                            prefix={<UserOutlined />}
                            placeholder="Email adresiniz"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "Lütfen şifrenizi giriniz!" }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined />}
                            placeholder="Şifre"
                        />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked">
                        <Checkbox>Beni Hatırla</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Giriş Yap
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default LoginPage;
