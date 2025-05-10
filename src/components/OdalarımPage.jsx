import React, { useState } from "react";
import "./OdalarımPage.css";
import OdaTanımlaModal from "./OdaTanımlaModal";
import { useEffect } from "react";
import RoomReservationModal from "./RoomReservationModal";
import { message } from "antd";

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

        // Update the room type based on the selection
        if (yeniOda.tur === "Aile") {
            // Find the first empty family room (multiple of 5)
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
            // Update only odd-numbered rooms except 5
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 1 && index !== 5) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Tek Kişilik",
                        kackisi: "1", // Always 1 person for single rooms
                        durum: "Boş",
                        neZaman: null
                    };
                }
            });
        } else if (yeniOda.tur === "Çift Kişilik") {
            // Update only even-numbered rooms except multiples of 5
            guncellenmisOdalar.forEach((oda, index) => {
                if (index % 2 === 0 && index % 5 !== 0) {
                    guncellenmisOdalar[index] = {
                        ...oda,
                        tur: "Çift Kişilik",
                        kackisi: "2", // Always 2 people for double rooms
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
            if (!oda) return false;  // Skip null or undefined rooms

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

    return (
        <div className="container">
            <div className="header">
                <h1>ODALARIM</h1>
                <button className="define-button" onClick={() => setModalAcik(true)}>
                    Oda Tanımla
                </button>
            </div>

            <div className="filters">
                <div>
                    <label>Oda Türü</label>
                    <select value={odaTuru} onChange={(e) => setOdaTuru(e.target.value)}>
                        <option>Oda Türü Seçiniz</option>
                        <option>Tek Kişilik</option>
                        <option>Çift Kişilik</option>
                        <option>Aile</option>
                    </select>
                </div>
                <div>
                    <label>Kalacak Kişi Sayısı</label>
                    <select value={kisiSayisi} onChange={(e) => setKisiSayisi(e.target.value)}>
                        <option>Kaç Kişi Seçiniz</option>
                        <option>1</option>
                        <option>2</option>
                        <option>3</option>
                        <option>4</option>
                    </select>
                </div>

                <button className="search-button" onClick={filtrasyonuUygula}>ARA </button>
                <button className="clear-button" onClick={filtreleriTemizle}>TEMİZLE </button>
            </div>

            <table className="room-table">
                <thead>
                    <tr>
                        <th>Oda No</th>
                        <th>Oda Türü</th>
                        <th>Kişi Sayısı</th>
                        <th>İşlem</th>
                    </tr>
                </thead>

                <tbody>
                    {filtrelenmisOdalar.length === 0 && (
                        <tr>
                            <td colSpan="4" style={{ textAlign: "center", padding: "20px", color: "gray" }}>
                                Uygun oda bulunamadı.
                            </td>
                        </tr>
                    )}

                    {filtrelenmisOdalar.length > 0 &&
                        filtrelenmisOdalar.map((oda) => (
                            <tr key={oda?.no ?? 'unknown'}>
                                <td>{oda?.no ?? '-'}</td>
                                <td>{oda?.tur || '-'}</td>
                                <td>{oda?.kackisi ? `${oda.kackisi} Kişilik` : '-'}</td>
                                <td>
                                    <button
                                        onClick={() => handleRezervasyon(oda)}
                                        className="reserve-button"
                                        disabled={!rezerveEdilebilirMi(oda) || !oda.tur}
                                    >
                                        Rezerve Et
                                    </button>
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

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
