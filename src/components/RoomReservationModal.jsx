import React, { useState, useEffect, use } from "react";
import { Modal, Button, Table, Tag, List, Typography, Input, DatePicker, message } from "antd";

import dayjs from "dayjs";


function RoomReservationModal({ oda, onKapat }) {
    const [availability, setAvailability] = useState([]); //Odanın günlük müsaitlik durumlarını tutar.
    const [originalAvailability, setOriginalAvailability] = useState([]); //Odanın orijinal müsaitlik durumlarını saklar (filtreleme sonrası sıfırlamak için)
    const [secim, setSecim] = useState({ baslangic: null, bitis: null });
    const [kayitlar, setKayitlar] = useState([]);
    const [musteri, setMusteri] = useState({ ad: "", soyad: "", email: "" });
    const [filtre, setFiltre] = useState({ baslangic: null, bitis: null });


    useEffect(() => { console.log(availability) }, [availability]);

    // Fiyat hesaplama fonksiyonu
    const hesaplaFiyat = (baslangic, bitis) => {
        const kayitliFiyatlar = JSON.parse(localStorage.getItem('odaFiyatlari')) || [];
        const startDate = new Date(baslangic);
        const endDate = new Date(bitis);

        // Oda türü ve tarih aralığına uygun fiyatı bul
        const matchingPrice = kayitliFiyatlar.find(fiyat =>
            fiyat.odaTuru === oda.tur &&
            new Date(fiyat.tarihAraligi.baslangic) <= startDate &&
            new Date(fiyat.tarihAraligi.bitis) >= endDate
        );

        if (matchingPrice) {
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            return matchingPrice.fiyat * days;
        }
        return 0;
    };

    // Tüm odaların availability verilerini sıfırla
    const resetAllAvailability = () => {
        for (let i = 0; i < 10; i++) {
            localStorage.removeItem(`oda_${i}_availability`);
        }
    };

    useEffect(() => {
        // Modal açıldığında availability verilerini yükle
        const odaDurumlari = JSON.parse(localStorage.getItem(`oda_${oda.no}_availability`));
        if (odaDurumlari && odaDurumlari.length > 0) {
            setAvailability(odaDurumlari);
            setOriginalAvailability(odaDurumlari);
        } else {
            const data = generateAvailability(oda);
            setAvailability(data);
            setOriginalAvailability(data);
        }

        const tumRezervasyonlar = JSON.parse(localStorage.getItem("rezervasyonlar")) || [];
        const buOdaninRezervasyonlari = tumRezervasyonlar.filter(r => r.odaNo === oda.no);
        setKayitlar(buOdaninRezervasyonlari);
    }, [oda]);
    const handleMusteriChange = (e) => {
        const { name, value } = e.target;
        setMusteri({ ...musteri, [name]: value });
    };

    const handleMouseDown = (index) => {
        if (availability[index].durum !== "Boş" && availability[index].durum !== "Uygun") return;

        if (secim.baslangic === null) {
            setSecim({
                baslangic: availability[index].tarih,
                bitis: null
            });
        } else {
            setSecim({
                baslangic: secim.baslangic,
                bitis: availability[index].tarih
            });
        }
    };

    const rezerveEt = () => {
        if (!secim.baslangic || !secim.bitis) {
            alert("Lütfen bir tarih aralığı seçiniz.");
            return;
        }

        const start = new Date(secim.baslangic);
        const end = new Date(secim.bitis);
        if (start > end) {
            alert("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
            return;
        }

        const yeniKayit = {
            odaNo: oda.no,
            baslangic: secim.baslangic,
            bitis: secim.bitis,
            musteri: musteri,
        };

        const mevcutRezervasyonlar = JSON.parse(localStorage.getItem("rezervasyonlar")) || [];
        localStorage.setItem("rezervasyonlar", JSON.stringify([...mevcutRezervasyonlar, yeniKayit]));

        const yeniAvailability = originalAvailability.map((gün) => {
            if (new Date(gün.tarih) >= start && new Date(gün.tarih) <= end) {
                return { ...gün, durum: "Dolu" };
            }
            return gün;
        });

        // availability'i güncelle
        setAvailability(yeniAvailability);
        setOriginalAvailability(yeniAvailability);

        // Rezervasyonları güncelle
        const yeniKayitlar = [...kayitlar, yeniKayit];
        setKayitlar(yeniKayitlar);

        // Formu temizle
        setSecim({ baslangic: null, bitis: null });
        setMusteri({ ad: "", soyad: "", email: "" });

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow",
            body: JSON.stringify([
                [
                    oda.no,
                    secim.baslangic,
                    secim.bitis,
                    musteri.ad,
                    musteri.soyad,
                    musteri.email,
                ]
            ])
        };

        fetch("https://v1.nocodeapi.com/aytunc_cakir/google_sheets/vMrkIikbSbQRWCNw?tabId=Sayfa1", requestOptions)
            .then(response => response.text())
            .then(result => console.log("Google Sheets'e gönderildi:", result))
            .catch(error => console.log("Google Sheets hatası:", error));

    };

    const rezervasyonuSil = (silinecekRezervasyon) => {
        try {
            // LocalStorage'dan silme
            const tumRezervasyonlar = JSON.parse(localStorage.getItem("rezervasyonlar")) || [];
            const filtrelenmisRezervasyonlar = tumRezervasyonlar.filter(r =>
                r.odaNo !== silinecekRezervasyon.odaNo ||
                r.baslangic !== silinecekRezervasyon.baslangic ||
                r.bitis !== silinecekRezervasyon.bitis
            );
            localStorage.setItem("rezervasyonlar", JSON.stringify(filtrelenmisRezervasyonlar));

            // Kaydedilen rezervasyonları güncelleme
            const yeniKayitlar = filtrelenmisRezervasyonlar.filter(r => r.odaNo === silinecekRezervasyon.odaNo);
            setKayitlar(yeniKayitlar);

            message.success('Rezervasyon başarıyla silindi');
        } catch (error) {
            console.error('Rezervasyon silinirken hata:', error);
            message.error('Rezervasyon silinirken bir hata oluştu');
        }
    };

    const applyFilter = () => {
        if (!filtre.baslangic || !filtre.bitis) {
            alert("Lütfen başlangıç ve bitiş tarihi girin.");
            return;
        }

        const start = filtre.baslangic.startOf("day");
        const end = filtre.bitis.endOf("day");

        const filtered = originalAvailability.filter((gün) => {
            const tarih = dayjs(gün.tarih);
            return tarih >= start && tarih <= end && gün.durum === "Boş";
        });

        setAvailability(filtered);
    };

    const clearFilter = () => {
        // availability'yi originalAvailability ile sıfırla
        setAvailability([...originalAvailability]);
        setFiltre({ baslangic: null, bitis: null });
    };


    const resetAvailability = () => {
        const updatedAvailability = originalAvailability.map(gün =>
            gün.durum === "Dolu" ? { ...gün, durum: "Boş" } : gün
        );

        // Güncellenmiş veriyi kaydet
        localStorage.setItem(`oda_${oda.no}_availability`, JSON.stringify(updatedAvailability));

        // Availability ve state'i güncelle
        setAvailability(updatedAvailability);
        setOriginalAvailability(updatedAvailability);
    };

    const columns = [
        {
            title: "Tarih",
            dataIndex: "tarih",
            key: "tarih",
        },
        {
            title: "Durum",
            dataIndex: "durum",
            key: "durum",
            render: (durum, record, index) => {
                let color = "default";
                let displayText = durum;

                if (durum === "Dolu") {
                    color = "red";
                    // Kayıtlardan bu tarih için boşalma tarihini bul
                    const buTarihIcinKayit = kayitlar.find(k =>
                        k.baslangic <= record.tarih && k.bitis >= record.tarih
                    );
                    if (buTarihIcinKayit) {
                        displayText = `Dolu (Boşalacak: ${buTarihIcinKayit.bitis})`;
                    } else {
                        displayText = "Dolu";
                    }
                } else if (durum === "Uygun") {
                    color = "blue";
                }

                if (secim.baslangic && secim.bitis) {
                    const startDate = new Date(secim.baslangic);
                    const endDate = new Date(secim.bitis);
                    if (availability[index]) {
                        const currentDate = new Date(availability[index].tarih);
                        if (currentDate >= startDate && currentDate <= endDate) {
                            color = "green";
                        }
                    }
                }

                return <Tag color={color}>{displayText}</Tag>;
            },
        },
    ];

    const dataSource = availability.map((gün, index) => ({
        key: index,
        tarih: gün.tarih,
        durum: gün.durum,
        onMouseDown: () => handleMouseDown(index),
    }));

    const handleModalClose = () => {
        // Modal kapatıldığında localStorage'ı güncelle
        localStorage.setItem(`oda_${oda.no}_availability`, JSON.stringify(availability));

        // Oda durumunu güncelle
        const tumOdalar = JSON.parse(localStorage.getItem("odalar")) || [];
        const guncellenmisOdalar = tumOdalar.map(odaItem => {
            if (odaItem.no === oda.no) {
                // Eğer odada dolu günler varsa, en son dolu günü bulma
                const doluGunler = availability.filter(gun => gun.durum === "Dolu");
                if (doluGunler.length > 0) {
                    const enSonDoluGun = doluGunler.reduce((latest, current) => {
                        return new Date(current.tarih) > new Date(latest.tarih) ? current : latest;
                    });
                    return {
                        ...odaItem,
                        durum: "Dolu",
                        neZaman: enSonDoluGun.tarih
                    };
                }
                return {
                    ...odaItem,
                    durum: "Boş",
                    neZaman: null
                };
            }
            return odaItem;
        });
        localStorage.setItem("odalar", JSON.stringify(guncellenmisOdalar));

        onKapat();
    };

    return (
        <Modal
            title={`Oda No ${oda.no} - ${oda.tur} ${oda.durum === "Dolu" ? `(Ne Zaman Boşalacak: ${oda.neZaman})` : ""}`}
            open={true}
            onCancel={handleModalClose}
            footer={[
                <Button key="cancel" onClick={handleModalClose}>
                    Kapat
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    onClick={rezerveEt}
                    disabled={!secim.baslangic || !secim.bitis}
                >
                    Rezerve Et
                </Button>,
                <Button key="reset" onClick={resetAvailability} type="dashed">
                    Tüm Dolu Oda Durumlarını Temizle
                </Button>
            ]}
            width={700}
        >
            <Typography.Text strong>
                Seçilen Aralık:{" "}
                {secim.baslangic && secim.bitis
                    ? `${secim.baslangic} - ${secim.bitis}`
                    : "Yok"}
            </Typography.Text>

            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", alignItems: "center" }}>
                <DatePicker
                    placeholder="Başlangıç"
                    value={filtre.baslangic}
                    onChange={(date) => setFiltre(prev => ({ ...prev, baslangic: date }))}
                />
                <DatePicker
                    placeholder="Bitiş"
                    value={filtre.bitis}
                    onChange={(date) => setFiltre(prev => ({ ...prev, bitis: date }))}
                />
                <Button type="primary" onClick={applyFilter}>Filtrele</Button>
                <Button onClick={clearFilter}>Temizle</Button>
            </div>

            <Table
                columns={columns}
                dataSource={dataSource}
                pagination={false}
                onRow={(record) => ({
                    onMouseDown: record.onMouseDown,
                })}
                style={{ marginTop: "1rem" }}
            />

            <div style={{ marginTop: "1.5rem" }}>
                <Typography.Title level={5}>Müşteri Bilgileri:</Typography.Title>
                <Input name="ad" value={musteri.ad} onChange={handleMusteriChange} placeholder="Ad" style={{ marginBottom: "1rem" }} />
                <Input name="soyad" value={musteri.soyad} onChange={handleMusteriChange} placeholder="Soyad" style={{ marginBottom: "1rem" }} />
                <Input name="email" value={musteri.email} onChange={handleMusteriChange} placeholder="Email" style={{ marginBottom: "1rem" }} />
            </div>

            <div style={{ marginTop: "1.5rem" }}>
                <Typography.Title level={5}>Yapılan Rezervasyonlar:</Typography.Title>
                <List
                    bordered
                    dataSource={kayitlar.filter(item => item.odaNo === oda.no)}
                    renderItem={(item) => {
                        const fiyat = hesaplaFiyat(item.baslangic, item.bitis);
                        return (
                            <List.Item
                                actions={[
                                    <Button
                                        type="link"
                                        danger
                                        onClick={() => rezervasyonuSil(item)}
                                        style={{
                                            marginTop: '0',
                                            padding: '0 8px',
                                            height: 'auto',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        Sil
                                    </Button>
                                ]}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '12px 24px'
                                }}
                            >
                                <div style={{ flex: 1 }}>
                                    Oda No: {item.odaNo} | {item.baslangic} - {item.bitis} |
                                    Müşteri: {item.musteri ? `${item.musteri.ad} ${item.musteri.soyad}` : 'Bilgi Yok'} |
                                    Email: {item.musteri ? item.musteri.email : 'Bilgi Yok'} |
                                    Fiyat: {fiyat > 0 ? `${fiyat} TL` : 'Fiyat Tanımlanmamış'}
                                </div>
                            </List.Item>
                        );
                    }}
                />
            </div>


        </Modal>
    );
}

function generateAvailability(oda) {
    const günSayisi = 30;
    const bugün = new Date();
    const result = [];

    // Yeni 30 günlük veri oluştur
    for (let i = 0; i < günSayisi; i++) {
        const date = new Date(bugün);
        date.setDate(bugün.getDate() + i);
        const formatted = date.toISOString().split("T")[0];

        let durum = "Boş";
        if (oda.durum === "Dolu" && oda.neZaman) {
            const bosalacakTarih = new Date(oda.neZaman);
            if (date <= bosalacakTarih) {
                durum = "Dolu";
            }
        }

        result.push({ tarih: formatted, durum });
    }

    // Yeni veriyi kaydet
    localStorage.setItem(`oda_${oda.no}_availability`, JSON.stringify(result));
    return result;
}

export default RoomReservationModal;
