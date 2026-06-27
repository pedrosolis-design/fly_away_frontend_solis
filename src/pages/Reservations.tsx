import { useEffect, useState } from "react";
import api from "../api";

interface ReservationDetail {
  id: string;
  bookingDate: string;
  flightId: number;
  flightNumber: string;
  estDepartureTime: string;
  estArrivalTime: string;
  customerId: number;
  customerFirstName: string;
  customerLastName: string;
}

export default function Reservations() {
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [selected, setSelected] = useState<ReservationDetail | null>(null);
  const [message, setMessage] = useState("");
  const meta = JSON.parse(localStorage.getItem("reservationsMeta") || "{}");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const ids: string[] = JSON.parse(localStorage.getItem("reservations") || "[]");

    if (!token) {
      setMessage("Debes iniciar sesión para ver tus reservas.");
      return;
    }
    if (ids.length === 0) return;

    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          ids.map((id) =>
            api
              .get(`/flights/book/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
              })
              .then((r) => r.data)
              .catch(() => null)
          )
        );
        setReservations(results.filter(Boolean));
      } catch {
        setMessage("Error al cargar reservas.");
      }
    };

    fetchAll();
  }, []);

  const formatDate = (dt: string) =>
    dt ? new Date(dt).toLocaleString("es-PE") : "-";

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-blue-700">🎫 Mis Reservas</h1>
          <p className="text-gray-500 text-sm mt-1">Historial de tus vuelos reservados</p>
        </div>

        {message && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">
            {message}
          </div>
        )}

        {reservations.length === 0 && !message ? (
          <div className="text-center text-gray-400 py-16">
            <div className="text-5xl mb-3">🛬</div>
            <p className="text-lg">No tienes reservas aún.</p>
            <a href="/search" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
              Buscar vuelos disponibles
            </a>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Número de Vuelo</th>
                  <th className="px-4 py-3 text-left">Aerolínea</th>
                  <th className="px-4 py-3 text-left">Salida</th>
                  <th className="px-4 py-3 text-left">Fecha Reserva</th>
                  <th className="px-4 py-3 text-center">Detalle</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-medium text-blue-700">{r.flightNumber}</td>
                    <td className="px-4 py-3">{meta[r.id]?.airlineName || "-"}</td>
                    <td className="px-4 py-3">{formatDate(r.estDepartureTime)}</td>
                    <td className="px-4 py-3">{formatDate(r.bookingDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelected(r)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal detalle */}
        {selected && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
              <h2 className="text-xl font-bold text-blue-700 mb-4">
                🎫 Detalle de Reserva #{selected.id}
              </h2>
              <div className="flex flex-col gap-2 text-sm text-gray-700">
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Número de Vuelo</span>
                  <span>{selected.flightNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Aerolínea</span>
                  <span>{meta[selected.id]?.airlineName || "-"}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Salida</span>
                  <span>{formatDate(selected.estDepartureTime)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Llegada</span>
                  <span>{formatDate(selected.estArrivalTime)}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="font-medium">Pasajero</span>
                  <span>{selected.customerFirstName} {selected.customerLastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Fecha de Reserva</span>
                  <span>{formatDate(selected.bookingDate)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}