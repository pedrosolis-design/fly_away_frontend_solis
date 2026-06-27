import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (!token) return;
    api
      .get("/users/current", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const email: string = res.data.username || "";
        setUsername(email.split("@")[0]);
      })
      .catch(() => {});
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-6">
        {!token && (
          <>
            <Link to="/register" className="hover:underline">Registro</Link>
            <Link to="/login" className="hover:underline">Login</Link>
          </>
        )}
        {token && (
          <>
            <Link to="/search" className="hover:underline">Buscar Vuelos</Link>
            <Link to="/reservations" className="hover:underline">Mis Reservas</Link>
          </>
        )}
      </div>
      <div className="flex items-center gap-6">
        {token && username && <span className="text-sm">Bienvenido, {username}</span>}
        {token && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-700 text-sm"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}