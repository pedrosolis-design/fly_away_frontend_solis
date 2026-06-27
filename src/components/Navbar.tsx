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
    <nav className="bg-blue-700 text-white px-8 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <div className="flex items-center gap-2 font-bold text-lg tracking-wide">
        <span>✈️</span>
        <span>Fly Away</span>
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 text-sm font-medium">
        {!token && (
          <>
            <Link to="/register" className="hover:text-blue-200 transition">
              Registro
            </Link>
            <Link
              to="/login"
              className="bg-white text-blue-700 px-4 py-1.5 rounded-lg hover:bg-blue-100 transition font-semibold"
            >
              Login
            </Link>
          </>
        )}
        {token && (
          <>
            <Link to="/search" className="hover:text-blue-200 transition">
              Buscar Vuelos
            </Link>
            <Link to="/reservations" className="hover:text-blue-200 transition">
              Mis Reservas
            </Link>
          </>
        )}
      </div>

      {/* Usuario y logout */}
      {token && (
        <div className="flex items-center gap-4 text-sm">
          {username && (
            <span className="text-blue-200">
              Bienvenido, <span className="text-white font-semibold">{username}</span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 px-4 py-1.5 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}