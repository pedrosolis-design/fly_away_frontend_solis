import { useState } from "react";
import api from "../api";

interface Flight {
  id: string;
  flightNumber: string;
  airlineName: string;
  estDepartureTime: string;
  estArrivalTime: string;
  availableSeats: number;
}

export default function FlightSearch() {
  const [flightNumber, setFlightNumber] = useState("");
  const [airline, setAirline] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [results, setResults] = useState<Flight[]>([]);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [bookingMsg, setBookingMsg] = useState("");

  const handleSearch = async () => {
  setError("");
  setBookingMsg("");
  try {
    const params = new URLSearchParams();
    if (flightNumber) params.append("flightNumber", flightNumber);
    if (airline) params.append("airlineName", airline);
    if (from) params.append("estDepartureTimeFrom", `${from}T00:00:00Z`);
    if (to) params.append("estDepartureTimeTo", `${to}T23:59:59Z`);

    const res = await api.get(`/flights/search?${params.toString()}`);
    const data = res.data.items ?? res.data;
    setResults(Array.isArray(data) ? data : []);
    setSearched(true);
  } catch (err: any) {
    setError("Error al buscar vuelos. Intenta de nuevo.");
    setSearched(true);
  }
};

  const handleBook = async (flightId: string) => {
  const token = localStorage.getItem("token");
  if (!token) {
    setBookingMsg("Debes iniciar sesión para reservar un vuelo.");
    return;
  }
  setBookingMsg("");
  try {
    const res = await api.post(
      "/flights/book",
      { flightId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const bookingId = res.data.id;

    const stored = JSON.parse(localStorage.getItem("reservations") || "[]");
    if (!stored.includes(String(bookingId))) {
      stored.push(String(bookingId));
      localStorage.setItem("reservations", JSON.stringify(stored));
    }

    const meta = JSON.parse(localStorage.getItem("reservationsMeta") || "{}");
    const yaReservado = Object.entries(meta).some(
      ([, v]: any) => v.flightId === String(flightId)
    );
    if (yaReservado) {
      setBookingMsg("❌ Ya tienes una reserva para este vuelo.");
      return;
    }
    const flight = results.find((f) => String(f.id) === String(flightId));
    meta[String(bookingId)] = { airlineName: flight?.airlineName || "-",flightId: String(flightId)  
};    localStorage.setItem("reservationsMeta", JSON.stringify(meta));

    setBookingMsg(`✅ Reserva exitosa. ID: ${bookingId}`);
  } catch (err: any) {
    const data = err.response?.data;
    const msg = data?.detail || data?.message || "Error al realizar la reserva";
    setBookingMsg(`❌ ${typeof msg === "string" ? msg : JSON.stringify(msg)}`);
  }
};

  const formatDate = (dt: string) =>
    dt ? new Date(dt).toLocaleString("es-PE") : "-";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Buscar Vuelos</h1>

      <div className="flex flex-wrap gap-3 mb-4">
        <input
          placeholder="Número de vuelo"
          value={flightNumber}
          onChange={(e) => setFlightNumber(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          placeholder="Aerolínea"
          value={airline}
          onChange={(e) => setAirline(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Desde:</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Hasta:</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {error && <p className="text-red-500 mb-3">{error}</p>}
      {bookingMsg && (
        <p className={`mb-3 font-medium ${bookingMsg.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
          {bookingMsg}
        </p>
      )}
      {searched && results.length === 0 && !error && (
        <p className="text-gray-500">No se encontraron vuelos.</p>
      )}

      {results.length > 0 && (
        <table className="table-auto border-collapse border w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Número</th>
              <th className="border px-4 py-2">Aerolínea</th>
              <th className="border px-4 py-2">Salida</th>
              <th className="border px-4 py-2">Llegada</th>
              <th className="border px-4 py-2">Asientos</th>
              <th className="border px-4 py-2">Acción</th>
            </tr>
          </thead>
          <tbody>
            {results.map((f) => (
              <tr key={f.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{f.flightNumber}</td>
                <td className="border px-4 py-2">{f.airlineName}</td>
                <td className="border px-4 py-2">{formatDate(f.estDepartureTime)}</td>
                <td className="border px-4 py-2">{formatDate(f.estArrivalTime)}</td>
                <td className="border px-4 py-2">{f.availableSeats}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => handleBook(f.id)}
                    className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Reservar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}