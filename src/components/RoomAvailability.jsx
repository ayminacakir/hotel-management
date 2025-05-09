import React from "react";

function RoomAvailability({ oda, availability }) {
    return (
        <div>
            <h3>Oda No: {oda.no} için uygunluk durumu</h3>
            <ul>
                {availability.map((item, index) => (
                    <li key={index}>
                        {item.tarih}: {item.durum}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default RoomAvailability;
