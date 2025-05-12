
import {
    BellOutlined,
    HomeTwoTone,
    BookTwoTone,
    DollarTwoTone,
    UserOutlined,
    LogoutOutlined
} from "@ant-design/icons";
import {
    Layout,
    Menu,
    Button,
    Dropdown,
    Typography,
    Space
} from "antd";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState } from "react";


import OdaFiyatları from "./OdaFiyatlarıPage";
import OdalarımPage from "./OdalarımPage";
import RoomStatusReport from "./RoomStatusReport";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

function HomePage() {
    const [name, setName] = useState("Aymina");
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const dropdownItems = [
        {
            key: "1",
            label: (
                <Button
                    type="text"
                    icon={<LogoutOutlined />}
                    onClick={logout}
                    block
                >
                    Çıkış
                </Button>
            ),
        },
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header style={{ backgroundColor: "#fff", padding: "0 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Title level={3} style={{ margin: 0 }}>
                        HOTEL YÖNETİM SİSTEMİ
                    </Title>
                    <Dropdown menu={{ items: dropdownItems }} placement="bottomRight">
                        <Button icon={<UserOutlined />}>{name}</Button>
                    </Dropdown>
                </div>
            </Header>

            <Layout>
                <Sider width={200} style={{ background: "#fff" }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={["/home"]}
                        style={{ height: "100%", borderRight: 0 }}
                    >
                        <Menu.Item key="/home" icon={<HomeTwoTone />}>
                            <Link to="/home">Ana Sayfa</Link>
                        </Menu.Item>
                        <Menu.Item key="/home/odalarım" icon={<BookTwoTone />}>
                            <Link to="/home/odalarım">Odalarım</Link>
                        </Menu.Item>
                        <Menu.Item key="/home/oda-fiyatları" icon={<DollarTwoTone />}>
                            <Link to="/home/oda-fiyatları">Oda Fiyatları</Link>
                        </Menu.Item>
                        <Menu.Item key="/home/room-status-raport" icon={<DollarTwoTone />}>
                            <Link to="/home/room-status-raport">Oda Durum Raporu</Link>
                        </Menu.Item>
                    </Menu>
                </Sider>

                <Layout style={{ padding: "24px" }}>
                    <Content
                        style={{
                            background: "#fff",
                            padding: 24,
                            margin: 0,
                            minHeight: 280,
                        }}
                    >
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <div style={{ textAlign: "center", marginTop: 100 }}>
                                        <Title level={2}>Hoş Geldiniz, {name}!</Title>

                                    </div>
                                }
                            />
                            <Route path="odalarım" element={<OdalarımPage />} />
                            <Route path="oda-fiyatları" element={<OdaFiyatları />} />
                            <Route path="room-status-raport" element={<RoomStatusReport />} />
                        </Routes>
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default HomePage;