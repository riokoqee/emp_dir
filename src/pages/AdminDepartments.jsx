import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./AdminDashboard.css";
import "../components/Admin/employees/admin.css";

export default function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("http://localhost:8080/api/admin/departments");
    const data = await res.json();
    setDepartments(data);
    setLoading(false);
  }

  async function remove(id) {
    if (!window.confirm("Удалить департамент?")) return;
    await fetch(`http://localhost:8080/api/admin/departments/${id}`, {
      method: "DELETE"
    });
    load();
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="admin-root" style={{ color: "white" }}>
      <h1 className="admin-title">Департаменты</h1>
      <div className="admin-actions" style={{ marginBottom: "20px" }}>
        <Link to="/admin/departments/new" className="btn-primary">Добавить департамент</Link>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Название</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td>
                  <button onClick={() => remove(d.id)} className="btn-small red">Удалить</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
