import React, { useState } from "react";

import OdaTanımlaModal from "./OdaTanımlaModal";
import { useEffect } from "react";
import RoomReservationModal from "./RoomReservationModal";
import { Button, Select, Table, Typography, Space, message } from "antd";

function OdalarimPage() {
    const [tarih, setTarih] = useState("");
    const [odaTuru, setOdaTuru] = useState("");
    const [durum, setDurum] = useState("");
    const [odaNo, setOdaNo] = useState("");
    const [modalAcik, setModalAcik] = useState(false);
    const [kisiSayisi, setKisiSayisi] = useState("");
    const [secilenOda, setSecilenOda] = useState(null);

    // Initialize with 10 empty rooms
    const [odalar, setOdalar] = useState([
        { no: 0, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 1, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 2, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 3, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 4, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 5, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 6, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 7, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 8, tur: "", durum: "Boş", kackisi: "", neZaman: null },
        { no: 9, tur: "", durum: "Boş", kackisi: "", neZaman: null },
    ]);

    const [filtrelenmisOdalar, setFiltrelenmisOdalar] = useState(odalar);

    useEffect(() => {
        setFiltrelenmisOdalar(odalar);
    }, [odalar]);

    const odaKaydet = (yeniOda) => {
        const guncellenmisOdalar = [...odalar];

        // Seçime göre odaları güncelleme
        if (yeniOda.tur === "Aile") {
            // İlk boş aile odasını bulma (5 in katı olanlar)
            const bosAileOdaIndex = guncellenmisOdalar.findIndex((oda, index) =>
                index % 5 === 0 && (!oda.tur || oda.tur === "")
            );

            if (bosAileOdaIndex !== -1) {
                guncellenmisOdalar[bosAileOdaIndex] = {
                    ...guncellenmisOdalar[bosAileOdaIndex],
                    tur: "Aile",
                    kackisi: yeniOda.kackisi,
                    durum: "Boş",
                    neZaman: null
                };
            } else {
                message.warning("Tüm aile odaları zaten tanımlanmış!");
                return;
            }
        } else if (yeniOda.tur === "Tek Kişilik") {
            // 5 harici sadece tek sayı olan odaları güncelleme
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 1 && index !== 5) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Tek Kişilik",
                        kackisi: "1", // Tek kişilik odalarda her zaman 1 kişi olmalı
                        durum: "Boş",
                        neZaman: null
                    };
                }
            });
        } else if (yeniOda.tur === "Çift Kişilik") {
            // 5 in katları harici sadece çift sayı olan odaları güncelleme
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 0 && index % 5 !== 0) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Çift Kişilik",
                        kackisi: "2", // Çift kişilik odalarda her zaman 2 kişi olmalı
                        durum: "Boş",
                        neZaman: null
                    };
                }
            });
        }

        setOdalar(guncellenmisOdalar);
        localStorage.setItem("odalar", JSON.stringify(guncellenmisOdalar));
    };

    const rezerveEdilebilirMi = (oda) => {
        if (!oda) return false;
        const bugun = new Date();
        if (oda.durum === "Boş") return true;
        if (!oda.neZaman) return false;
        const bosalacakTarih = new Date(oda.neZaman);
        return bosalacakTarih <= bugun;
    };

    const handleRezervasyon = (oda) => {
        console.log('Rezervasyon butonu tıklandı:', oda);
        if (!rezerveEdilebilirMi(oda)) {
            message.warning('Bu oda şu anda rezerve edilemez.');
            return;
        }
        console.log('Oda rezerve edilebilir, modal açılıyor...');
        setSecilenOda(oda);
    };

    const filtrasyonuUygula = () => {
        const secilenTarih = tarih ? new Date(tarih) : null;
        const secilenKisiSayisi = parseInt(kisiSayisi);

        const sonuc = odalar.filter((oda) => {
            if (!oda) return false;  // Boş veya tanımsız odaları atla

            if (oda.durum === "Dolu" && secilenTarih) {
                const bosalacakTarih = oda.neZaman ? new Date(oda.neZaman) : null;
                if (!bosalacakTarih || bosalacakTarih.getTime() > secilenTarih.getTime()) {
                    return false;
                }
            }

            if (odaTuru && odaTuru !== "Oda Türü Seçiniz" && oda.tur !== odaTuru) {
                return false;
            }

            if (durum && durum !== "Durum Seçiniz" && oda.durum !== durum) {
                return false;
            }

            if (secilenKisiSayisi) {
                const tur = oda.tur;
                if (
                    (secilenKisiSayisi === 1 && tur !== "Tek Kişilik") ||
                    (secilenKisiSayisi === 2 && tur !== "Çift Kişilik") ||
                    (secilenKisiSayisi >= 3 && tur !== "Aile")
                ) {
                    return false;
                }
            }

            return true;
        });

        setFiltrelenmisOdalar(sonuc);
    };

    const filtreleriTemizle = () => {
        setTarih("");
        setOdaTuru("");
        setDurum("");
        setKisiSayisi("");
        setFiltrelenmisOdalar(odalar);
    };

    function odaTuruBelirle(no) {
        if (no % 5 === 0) return "Aile";
        if (no % 2 === 0) return "Çift Kişilik";
        return "Tek Kişilik";
    }

    const rezerveDurumu = (oda) => {
        const bugun = new Date();
        if (oda.durum === "Boş") return "Uygun";

        if (!oda.neZaman) return "Belirsiz";

        const bosalacakTarih = new Date(oda.neZaman);
        if (bosalacakTarih <= bugun) return "Uygun";

        return `${oda.neZaman} sonrası uygun`;
    };
    const { Title } = Typography;
    const { Option } = Select;


    return (
        <div style={{ padding: "24px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Title level={2}>ODALARIM</Title>
                    <Button type="primary" onClick={() => setModalAcik(true)}>
                        Oda Tanımla
                    </Button>
                </div>

                {/* Filters */}
                <Space style={{ marginBottom: "16px" }} size="large">
                    <div>
                        <label>Oda Türü</label>
                        <Select
                            placeholder="Oda Türü Seçiniz"
                            value={odaTuru}
                            onChange={(value) => setOdaTuru(value)}
                            style={{ width: 200 }}
                        >
                            <Option value="Tek Kişilik">Tek Kişilik</Option>
                            <Option value="Çift Kişilik">Çift Kişilik</Option>
                            <Option value="Aile">Aile</Option>
                        </Select>
                    </div>
                    <div>
                        <label>Kalacak Kişi Sayısı</label>
                        <Select
                            placeholder="Kaç Kişi Seçiniz"
                            value={kisiSayisi}
                            onChange={(value) => setKisiSayisi(value)}
                            style={{ width: 200 }}
                        >
                            <Option value="1">1</Option>
                            <Option value="2">2</Option>
                            <Option value="3">3</Option>
                            <Option value="4">4</Option>
                        </Select>
                    </div>
                    <Button type="primary" onClick={filtrasyonuUygula}>
                        ARA
                    </Button>
                    <Button onClick={filtreleriTemizle}>TEMİZLE</Button>
                </Space>

                {/* Table */}
                <Table
                    dataSource={filtrelenmisOdalar}
                    columns={[
                        {
                            title: "Oda No",
                            dataIndex: "no",
                            key: "no",
                            render: (text) => text ?? "-",
                        },
                        {
                            title: "Oda Türü",
                            dataIndex: "tur",
                            key: "tur",
                            render: (text) => text || "-",
                        },
                        {
                            title: "Kişi Sayısı",
                            dataIndex: "kackisi",
                            key: "kackisi",
                            render: (text) => (text ? `${text} Kişilik` : "-"),
                        },
                        {
                            title: "İşlem",
                            key: "action",
                            render: (_, oda) => (
                                <Button
                                    type="primary"
                                    onClick={() => handleRezervasyon(oda)}
                                    disabled={!rezerveEdilebilirMi(oda) || !oda.tur}
                                >
                                    Rezerve Et
                                </Button>
                            ),
                        },
                    ]}
                    rowKey={(oda) => oda?.no ?? "unknown"}
                    locale={{
                        emptyText: "Uygun oda bulunamadı.",
                    }}
                    pagination={false}
                />
            </Space>

            {/* Modals */}
            {modalAcik && (
                <OdaTanımlaModal
                    onKapat={() => setModalAcik(false)}
                    onKaydet={odaKaydet}
                />
            )}

            {secilenOda && (
                <RoomReservationModal
                    oda={secilenOda}
                    onKapat={() => setSecilenOda(null)}
                />
            )}
        </div>
    );
}

export default OdalarimPage;
