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
    message,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";
import "./LoginPage.css";

const { Title } = Typography;

function LoginPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);

    // Google Sheets'ten kullanıcı bilgilerini çek
    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        fetch(
            "https://v1.nocodeapi.com/ayminacakir/google_sheets/GkEyitVfnggEgHEm?tabId=Sayfa2",
            requestOptions
        )
            .then((response) => response.json())
            .then((result) => {
                if (!result.data) {
                    throw new Error("Google Sheets verisi alınamadı");
                }

                const parsedUsers = result.data.map((row) => ({
                    email: row["email"],
                    password: row["şifre"],
                }));

                setUsers(parsedUsers);
            })
            .catch((error) => {
                console.error("Veri çekme hatası:", error);
                message.error("Kullanıcı verileri alınamadı.");
            });
    }, []);

    const onFinish = (values) => {
        const { email, password } = values;

        const matchedUser = users.find(
            (user) => user.email === email && user.password === password
        );

        if (matchedUser) {
            localStorage.setItem("token", "mock-token");
            message.success("Giriş başarılı!");
            navigate("/home");
        } else {
            message.error("Geçersiz email veya şifre!");
        }
    };

    return (
        <div
            className="login-page"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                background: "#f0f2f5",
            }}
        >
            <Card style={{ width: 400, padding: 24 }}>
                <Space
                    direction="vertical"
                    style={{ width: "100%", textAlign: "center" }}
                >
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
                            { type: "email", message: "Geçerli bir email adresi giriniz!" },
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
                        <Input.Password prefix={<LockOutlined />} placeholder="Şifre" />
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
