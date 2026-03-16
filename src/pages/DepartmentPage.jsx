import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getEmployeesByDepartment } from "../api/employeesApi";
import "./DepartmentPage.css";

const SORT_NONE = "none";
const SORT_ASC = "asc";
const SORT_DESC = "desc";

export default function DepartmentPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const deptId = Number(id);

  const [openId, setOpenId] = useState(null);
  const employeeId = searchParams.get("emp") ? Number(searchParams.get("emp")) : null;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_NONE);

  useEffect(() => {
    setLoading(true);
    getEmployeesByDepartment(deptId)
      .then(data => {
        console.log("Получили сотрудников:", data);
        setEmployees(data);
        setLoading(false);
      });
  }, [deptId]);

  useEffect(() => {
    if (!employees.length) return;
    if (!employeeId) return;
    const exists = employees.find((e) => e.id === employeeId);
    if (!exists) return;

    setOpenId(employeeId);
    const row = document.getElementById(`emp-${employeeId}`);
    if (row) {
      row.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [employees, employeeId]);

  const rooms = [...new Set(employees.map(e => e.room))];

  const sortedEmployees = useMemo(() => {
    let data = [...employees];

    if (search.trim()) {
      data = data.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filterRoom) {
      data = data.filter(e => e.room === filterRoom);
    }

    if (sortOrder !== SORT_NONE) {
      data.sort((a, b) => {
        const v1 = a[sortField]?.toString() || "";
        const v2 = b[sortField]?.toString() || "";

        if (sortOrder === SORT_ASC) return v1.localeCompare(v2);
        if (sortOrder === SORT_DESC) return v2.localeCompare(v1);
      });
    }

    return data;
  }, [employees, search, filterRoom, sortField, sortOrder]);

  function toggleSort(field) {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder(SORT_ASC);
    } else {
      if (sortOrder === SORT_ASC) setSortOrder(SORT_DESC);
      else if (sortOrder === SORT_DESC) setSortOrder(SORT_NONE);
      else setSortOrder(SORT_ASC);
    }
  }

  function toggleOpen(id) {
    setOpenId(openId === id ? null : id);
  }

  function formatBirthday(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("ru-RU");
  }

  return (
    <div className="dept-root">
      <h2 className="dept-title">Сотрудники отдела</h2>

      <div className="filters">
        <input
          type="text"
          placeholder="Поиск по ФИО…"
          className="filter-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={filterRoom}
          onChange={(e) => setFilterRoom(e.target.value)}
        >
          <option value="">Все кабинеты</option>
          {rooms.map(room => (
            <option key={room} value={room}>{room}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="dept-empty">Загрузка...</p>
      ) : sortedEmployees.length === 0 ? (
        <p className="dept-empty">Нет сотрудников по выбранным параметрам.</p>
      ) : (
        <table className="dept-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")}>
                ФИО
              </th>

              <th onClick={() => toggleSort("position")}>
                Должность
              </th>

              <th onClick={() => toggleSort("room")}>
                Кабинет
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.map(emp => (
            <>
              <tr
                key={emp.id}
                id={`emp-${emp.id}`}
                onClick={() => toggleOpen(emp.id)}
                className="emp-row"
              >
                <td>{emp.name}</td>
                <td>{emp.position}</td>
                <td>{emp.room}</td>
              </tr>

              {openId === emp.id && (
                <tr className="emp-details">
                  <td colSpan="3">
                    <div className="details-box">
                      <p><strong>Городской:</strong> {emp.phone_city || "—"}</p>
                      <p><strong>Сотовый:</strong> {emp.phone_mobile || "—"}</p>
                      <p><strong>Email:</strong> {emp.email || "—"}</p>
                      <p><strong>Кабинет:</strong> {emp.room || "—"}</p>
                      <p><strong>Дата рождения:</strong> {formatBirthday(emp.birthday)}</p>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
