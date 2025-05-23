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
    Alert,
} from "antd";
import { UserOutlined, LockOutlined, LoginOutlined } from "@ant-design/icons";

const { Title } = Typography;

function LoginPage() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [errorMessage, setErrorMessage] = useState(""); // Hata mesajı için state

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow",
        };

        fetch(
            "https://v1.nocodeapi.com/aytunc_cakir/google_sheets/vMrkIikbSbQRWCNw?tabId=Sayfa2",
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
            setErrorMessage("Email veya şifre yanlış!"); // Hata mesajını ayarla
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(to bottom right, #f3efaf, #e0f7fa)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
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

                {/* Hata mesajı */}
                {errorMessage && (
                    <Alert
                        message={errorMessage}
                        type="error"
                        showIcon
                        style={{ marginBottom: 16 }}
                    />
                )}

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