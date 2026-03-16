import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./admin.css";

export default function EmployeeList({
  departmentId,
  title = "Все сотрудники",
  basePath = "/admin/employees"
}) {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [depFilter, setDepFilter] = useState("");

  async function load() {
    const query = departmentId ? `?departmentId=${departmentId}` : "";
    const res = await fetch(`http://localhost:8080/api/admin/employees${query}`);
    const data = await res.json();
    setEmployees(data);
  }

  async function remove(id) {
    if (!window.confirm("Удалить сотрудника?")) return;

    const query = departmentId ? `?departmentId=${departmentId}` : "";
    await fetch(`http://localhost:8080/api/admin/employees/${id}${query}`, {
      method: "DELETE"
    });

    load();
  }

  useEffect(() => {
    load();
  }, [departmentId]);

  const departments = useMemo(
    () => Array.from(new Set(employees.map(e => e.department_name || "Без отдела"))),
    [employees]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return employees.filter((e) => {
      const matchesSearch = !q || e.name.toLowerCase().includes(q) || e.position?.toLowerCase().includes(q);
      const matchesDep = !depFilter || (e.department_name || "Без отдела") === depFilter;
      return matchesSearch && matchesDep;
    });
  }, [employees, search, depFilter]);

  const showDepartmentFilter = !departmentId;

  return (
    <div style={{ color: "white" }}>
      <h2>{title}</h2>
      <Link to={`${basePath}/new`} className="btn-primary">Добавить сотрудника</Link>

      <div className="filters" style={{ margin: "16px 0", display: "flex", gap: "12px" }}>
        <input
          type="text"
          placeholder="Поиск по ФИО или должности"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
          style={{ flex: 1 }}
        />
        {showDepartmentFilter && (
          <select
            value={depFilter}
            onChange={(e) => setDepFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Все департаменты</option>
            {departments.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ФИО</th>
            <th>Департамент</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(e => (
            <tr key={e.id}>
              <td>{e.name}</td>
              <td>{e.department_name || "Без отдела"}</td>
              <td className="action-buttons">
                <Link to={`${basePath}/edit/${e.id}`} className="btn-small">Ред.</Link>
                <button onClick={() => remove(e.id)} className="btn-small red">Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
