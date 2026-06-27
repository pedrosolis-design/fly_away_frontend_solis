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
  const meta = JSON.parse(localStorage.getItem("reservationsMeta") || "{}");
  const [reservations, setReservations] = useState<ReservationDetail[]>([]);
  const [selected, setSelected] = useState<ReservationDetail | null>(null);
  const [message, setMessage] = useState("");

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
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Mis Reservas</h1>
      {message && <p className="text-red-500">{message}</p>}

      {reservations.length === 0 && !message ? (
        <p className="text-gray-500">No tienes reservas aún.</p>
      ) : (
        <table className="table-auto border-collapse border w-full text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2">Número de Vuelo</th>
              <th className="border px-4 py-2">Aerolínea</th>
              <th className="border px-4 py-2">Salida</th>
              <th className="border px-4 py-2">Fecha Reserva</th>
              <th className="border px-4 py-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{r.flightNumber}</td>
                <td className="border px-4 py-2">{meta[r.id]?.airlineName || "-"}</td>
                <td className="border px-4 py-2">{formatDate(r.estDepartureTime)}</td>
                <td className="border px-4 py-2">{formatDate(r.bookingDate)}</td>
                <td className="border px-4 py-2">
                  <button
                    onClick={() => setSelected(r)}
                    className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-700"
                  >
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selected && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Detalle de Reserva #{selected.id}</h2>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
          <p><strong>Número de Vuelo:</strong> {selected.flightNumber}</p>
          <p><strong>Aerolínea:</strong> {meta[selected.id]?.airlineName || "-"}</p>
          <p><strong>Salida:</strong> {formatDate(selected.estDepartureTime)}</p>
          <p><strong>Llegada:</strong> {formatDate(selected.estArrivalTime)}</p>
          <p><strong>Fecha de Reserva:</strong> {formatDate(selected.bookingDate)}</p>
        </div>
      )}
    </div>
  );
}
