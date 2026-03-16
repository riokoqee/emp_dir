import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../components/Admin/employees/admin.css";

export default function DepartmentForm() {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setError("");

    const res = await fetch("http://localhost:8080/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Ошибка сохранения");
      return;
    }

    navigate("/admin/departments");
  }

  return (
    <div style={{ color: "white" }}>
      <h2>Добавить департамент</h2>
      <form onSubmit={submit} className="admin-form">
        <label>Название департамента</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например, IT отдел"
          required
        />

        {error && <p style={{ color: "salmon" }}>{error}</p>}

        <button className="btn-primary">Сохранить</button>
      </form>
    </div>
  );
}
