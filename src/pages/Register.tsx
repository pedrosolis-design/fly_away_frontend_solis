import { useState } from "react";
import api from "../api";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (form.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }
    if (!/[a-zA-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      setError("La contraseña debe contener letras y números");
      return;
    }
    if (!/^[A-Z]/.test(form.firstName)) {
      setError("El nombre debe empezar con mayúscula");
      return;
    }
    if (!/^[A-Z]/.test(form.lastName)) {
      setError("El apellido debe empezar con mayúscula");
      return;
    }

    try {
      setLoading(true);
      await api.post("/users/register", {
        username: form.email,
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        password: form.password,
      });

      setSuccess("Registro exitoso, redirigiendo al login...");
      setTimeout(() => (window.location.href = "/login"), 1500);
    } catch (err: any) {
      const data = err.response?.data;
      const msg =
        data?.detail || data?.message || data || err.message || "Error en el registro";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Registro</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          disabled={loading}
          className="border px-3 py-2 rounded"
        />
        <input
          name="firstName"
          placeholder="Nombre (ej: Juan)"
          value={form.firstName}
          onChange={handleChange}
          disabled={loading}
          className="border px-3 py-2 rounded"
        />
        <input
          name="lastName"
          placeholder="Apellido (ej: Pérez)"
          value={form.lastName}
          onChange={handleChange}
          disabled={loading}
          className="border px-3 py-2 rounded"
        />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mín. 8 caracteres, letras y números)"
          value={form.password}
          onChange={handleChange}
          disabled={loading}
          className="border px-3 py-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}
      </form>
      <p className="mt-4 text-sm text-center">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Inicia sesión
        </a>
      </p>
    </div>
  );
}