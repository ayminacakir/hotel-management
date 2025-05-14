import React, { useState, useEffect } from "react";
import OdaTanımlaModal from "./OdaTanımlaModal";
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

    // Odaları localStorage'dan yükle veya varsayılan değerleri kullan
    const [odalar, setOdalar] = useState(() => {
        const kayitliOdalar = localStorage.getItem("odalar");
        return kayitliOdalar
            ? JSON.parse(kayitliOdalar)
            : Array.from({ length: 10 }, (_, index) => ({
                no: index,
                tur: "",
                durum: "Boş",
                kackisi: "",
                neZaman: null,
            }));
    });

    const [filtrelenmisOdalar, setFiltrelenmisOdalar] = useState(odalar);

    useEffect(() => {
        setFiltrelenmisOdalar(odalar);
    }, [odalar]);

    const odaKaydet = (yeniOda) => {
        const guncellenmisOdalar = [...odalar];

        // Seçime göre odaları güncelleme
        if (yeniOda.tur === "Aile") {
            const bosAileOdaIndex = guncellenmisOdalar.findIndex((oda, index) =>
                index % 5 === 0 && (!oda.tur || oda.tur === "")
            );

            if (bosAileOdaIndex !== -1) {
                guncellenmisOdalar[bosAileOdaIndex] = {
                    ...guncellenmisOdalar[bosAileOdaIndex],
                    tur: "Aile",
                    kackisi: yeniOda.kackisi,
                    durum: "Boş",
                    neZaman: null,
                };
            } else {
                message.warning("Tüm aile odaları zaten tanımlanmış!");
                return;
            }
        } else if (yeniOda.tur === "Tek Kişilik") {
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 1 && index !== 5) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Tek Kişilik",
                        kackisi: "1",
                        durum: "Boş",
                        neZaman: null,
                    };
                }
            });
        } else if (yeniOda.tur === "Çift Kişilik") {
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 0 && index % 5 !== 0) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Çift Kişilik",
                        kackisi: "2",
                        durum: "Boş",
                        neZaman: null,
                    };
                }
            });
        }

        setOdalar(guncellenmisOdalar);
        localStorage.setItem("odalar", JSON.stringify(guncellenmisOdalar)); // Odaları localStorage'a kaydet
    };

    const tumOdalarıSil = () => {
        const bosOdalar = Array.from({ length: 10 }, (_, index) => ({
            no: index,
            tur: "",
            durum: "Boş",
            kackisi: "",
            neZaman: null,
        }));
        setOdalar(bosOdalar);
        localStorage.removeItem("odalar"); // localStorage'dan odaları sil
        message.success("Tüm odalar başarıyla silindi!");
    };

    const rezerveEdilebilirMi = (oda) => {

        return true;
    };

    const handleRezervasyon = (oda) => {
        if (!rezerveEdilebilirMi(oda)) {
            message.warning("Bu oda şu anda rezerve edilemez.");
            return;
        }
        setSecilenOda(oda);
    };

    const filtrasyonuUygula = () => {
        const secilenTarih = tarih ? new Date(tarih) : null;
        const secilenKisiSayisi = parseInt(kisiSayisi);

        const sonuc = odalar.filter((oda) => {
            if (!oda) return false;

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
                const odaKisiSayisi = parseInt(oda.kackisi);

                if (odaKisiSayisi !== secilenKisiSayisi) {
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

    return (
        <div style={{ padding: "24px" }}>
            <Space direction="vertical" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography.Title level={2}>ODALARIM</Typography.Title>
                    <Space>
                        <Button type="primary" onClick={() => setModalAcik(true)}>
                            Oda Tanımla
                        </Button>
                        <Button danger onClick={tumOdalarıSil}>
                            Tüm Odaları Sil
                        </Button>
                    </Space>
                </div>

                <Space style={{ marginBottom: "16px" }} size="large">
                    <div>
                        <label>Oda Türü</label>
                        <Select
                            placeholder="Oda Türü Seçiniz"
                            value={odaTuru}
                            onChange={(value) => setOdaTuru(value)}
                            style={{ width: 200 }}
                        >
                            <Select.Option value="Tek Kişilik">Tek Kişilik</Select.Option>
                            <Select.Option value="Çift Kişilik">Çift Kişilik</Select.Option>
                            <Select.Option value="Aile">Aile</Select.Option>
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
                            <Select.Option value="1">1</Select.Option>
                            <Select.Option value="2">2</Select.Option>
                            <Select.Option value="3">3</Select.Option>
                            <Select.Option value="4">4</Select.Option>
                        </Select>
                    </div>
                    <Button type="primary" onClick={filtrasyonuUygula}>
                        ARA
                    </Button>
                    <Button onClick={filtreleriTemizle}>TEMİZLE</Button>
                </Space>

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