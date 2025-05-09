// RoomStatusReport.jsx
import React, { useEffect, useState } from "react";
import { DatePicker, Select, Table, Typography, Space, message } from "antd";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import "dayjs/locale/tr";

dayjs.extend(isBetween);
dayjs.locale("tr");

const { RangePicker } = DatePicker;
const { Title } = Typography;

const columns = [
    { title: "Oda No", dataIndex: "room", key: "room" },
    { title: "Başlangıç Tarihi", dataIndex: "startDate", key: "startDate" },
    { title: "Bitiş Tarihi", dataIndex: "endDate", key: "endDate" },
    { title: "Müşteri Adı", dataIndex: "customerName", key: "customerName" },
    { title: "Müşteri Soyadı", dataIndex: "customerSurname", key: "customerSurname" },
    { title: "E-posta", dataIndex: "email", key: "email" },
];

function RoomStatusReport() {
    const [reportType, setReportType] = useState("daily");
    const [selectedRange, setSelectedRange] = useState([]);
    const [data, setData] = useState([]);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "get",
            headers: myHeaders,
            redirect: "follow",
        };

        console.log("Fetching data from API...");
        fetch(
            "https://v1.nocodeapi.com/ayminacakir/google_sheets/GkEyitVfnggEgHEm?tabId=Sayfa1",
            requestOptions
        )
            .then((res) => {
                console.log("API Response status:", res.status);
                return res.json();
            })
            .then((result) => {
                console.log("Raw API response:", JSON.stringify(result, null, 2));
                if (!result.data) {
                    throw new Error("No data received from API");
                }

                const cleaned = result.data.map((row) => ({
                    key: row.row_id,
                    room: row["Oda No"],
                    startDate: row["Başlangıç Tarihi"],
                    endDate: row["Bitiş Tarihi"],
                    customerName: row["Müşteri Adı"],
                    customerSurname: row["Müşteri Soyadı"],
                    email: row["E-posta"]
                }));

                console.log("Processed data:", cleaned);
                setData(cleaned);
            })
            .catch((err) => {
                console.error("Error details:", err);
                message.error("Veriler alınamadı: " + err.message);
            });
    }, []);

    const getFilteredData = () => {
        if (!selectedRange || selectedRange.length !== 2) return data;

        const [start, end] = selectedRange;
        return data.filter(
            (row) =>
                dayjs(row.startDate).isAfter(start.startOf("day").subtract(1, "minute")) &&
                dayjs(row.startDate).isBefore(end.endOf("day").add(1, "minute"))
        );
    };

    return (
        <div>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                <Title level={4}>Oda Durum Raporu</Title>

                <Space>
                    <Select
                        value={reportType}
                        onChange={setReportType}
                        style={{ width: 150 }}
                    >
                        <Select.Option value="daily">Günlük</Select.Option>
                        <Select.Option value="weekly">Haftalık</Select.Option>
                        <Select.Option value="monthly">Aylık</Select.Option>
                    </Select>

                    <RangePicker
                        value={selectedRange}
                        onChange={(val) => setSelectedRange(val)}
                        format="YYYY-MM-DD"
                    />
                </Space>

                <Table
                    dataSource={getFilteredData()}
                    columns={columns}
                    pagination={{ pageSize: 10 }}
                />
            </Space>
        </div>
    );
}

export default RoomStatusReport;
