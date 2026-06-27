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
    } catch {
      setError("Error al buscar vuelos. Intenta de nuevo.");
      setSearched(true);
    }
  };

  const handleBook = async (flightId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setBookingMsg("❌ Debes iniciar sesión para reservar un vuelo.");
      return;
    }

    const meta = JSON.parse(localStorage.getItem("reservationsMeta") || "{}");
    const yaReservado = Object.entries(meta).some(
      ([, v]: any) => v.flightId === String(flightId)
    );
    if (yaReservado) {
      setBookingMsg("❌ Ya tienes una reserva para este vuelo.");
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

      const flight = results.find((f) => String(f.id) === String(flightId));
      meta[String(bookingId)] = {
        airlineName: flight?.airlineName || "-",
        flightId: String(flightId),
      };
      localStorage.setItem("reservationsMeta", JSON.stringify(meta));

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
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700">🔍 Buscar Vuelos</h1>
          <p className="text-gray-500 text-sm mt-1">Encuentra tu próximo destino</p>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número de vuelo</label>
              <input
                placeholder="Ej: LA101"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Aerolínea</label>
              <input
                placeholder="Ej: LATAM"
                value={airline}
                onChange={(e) => setAirline(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition text-sm"
          >
            Buscar vuelos
          </button>
        </div>

        {/* Mensajes */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {error}
          </div>
        )}
        {bookingMsg && (
          <div className={`text-sm rounded-lg px-4 py-3 mb-4 border ${
            bookingMsg.startsWith("✅")
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-600"
          }`}>
            {bookingMsg}
          </div>
        )}
        {searched && results.length === 0 && !error && (
          <div className="text-center text-gray-400 py-12">
            <div className="text-4xl mb-2">🛫</div>
            <p>No se encontraron vuelos para tu búsqueda.</p>
          </div>
        )}

        {/* Tabla */}
        {results.length > 0 && (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Número</th>
                  <th className="px-4 py-3 text-left">Aerolínea</th>
                  <th className="px-4 py-3 text-left">Salida</th>
                  <th className="px-4 py-3 text-left">Llegada</th>
                  <th className="px-4 py-3 text-center">Asientos</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody>
                {results.map((f, i) => (
                  <tr key={f.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-blue-700">{f.flightNumber}</td>
                    <td className="px-4 py-3">{f.airlineName}</td>
                    <td className="px-4 py-3">{formatDate(f.estDepartureTime)}</td>
                    <td className="px-4 py-3">{formatDate(f.estArrivalTime)}</td>
                    <td className="px-4 py-3 text-center">{f.availableSeats}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleBook(f.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        Reservar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}