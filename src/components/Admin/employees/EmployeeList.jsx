import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./admin.css";

// ==================== УМНЫЙ ПОИСК ====================
const keyboardToCyr = (str) => {
  if (!str) return "";
  const map = {
    'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ',
    'p': 'з', '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р',
    'j': 'о', 'k': 'л', 'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м',
    'b': 'и', 'n': 'т', 'm': 'ь', ',': 'б', '.': 'ю', '`': 'ё',
    'Q': 'Й', 'W': 'Ц', 'E': 'У', 'R': 'К', 'T': 'Е', 'Y': 'Н', 'U': 'Г', 'I': 'Ш', 'O': 'Щ',
    'P': 'З', '{': 'Х', '}': 'Ъ', 'A': 'Ф', 'S': 'Ы', 'D': 'В', 'F': 'А', 'G': 'П', 'H': 'Р',
    'J': 'О', 'K': 'Л', 'L': 'Д', ':': 'Ж', '"': 'Э', 'Z': 'Я', 'X': 'Ч', 'C': 'С', 'V': 'М',
    'B': 'И', 'N': 'Т', 'M': 'Ь', '<': 'Б', '>': 'Ю', '~': 'Ё',
  };
  return str.split('').map(char => map[char] || char).join('');
};

const latinToCyr = (str) => {
  if (!str) return "";
  const map = {
    'a': 'а', 'b': 'б', 'c': 'ц', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'х', 'i': 'и',
    'j': 'й', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'й', 'r': 'р',
    's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'w': 'ш', 'x': 'х', 'y': 'ы', 'z': 'з',
    'sh': 'ш', 'ch': 'ч', 'zh': 'ж', 'kh': 'х',
  };
  let result = '';
  let i = 0;
  while (i < str.length) {
    const two = str.slice(i, i + 2).toLowerCase();
    if (map[two]) { result += map[two]; i += 2; continue; }
    const one = str[i].toLowerCase();
    result += map[one] || str[i];
    i++;
  }
  return result;
};

const hasCyrillic = (str) => /[а-яёәғқңөұүіА-ЯЁӘҒҚҢӨҰҮІ]/.test(str || "");
// =================================================================================

export default function EmployeeList({
  departmentId,
  title = "Все сотрудники",
  basePath = "/admin/employees"
}) {
  const [employees, setEmployees] = useState([]);
  const [allDepartments, setAllDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [depFilter, setDepFilter] = useState("");

  // Модальные окна
  const [restoreEmployeeId, setRestoreEmployeeId] = useState(null);
  const [selectedRestoreDept, setSelectedRestoreDept] = useState("");

  const [confirmFireId, setConfirmFireId] = useState(null);
  const [confirmFireName, setConfirmFireName] = useState("");

  // Новое окно — Перевод в другой департамент
  const [transferEmployeeId, setTransferEmployeeId] = useState(null);
  const [transferEmployeeName, setTransferEmployeeName] = useState("");
  const [transferCurrentDeptId, setTransferCurrentDeptId] = useState(null);
  const [selectedTransferDept, setSelectedTransferDept] = useState("");

  const apiBase = "http://localhost:8080/api/admin";
  const archiveName = "Ранее работавшие сотрудники";

  async function load() {
    const query = departmentId ? `?departmentId=${departmentId}` : "";
    const res = await fetch(`${apiBase}/employees${query}`);
    const data = await res.json();
    setEmployees(data);
  }

  async function loadDepartments() {
    const res = await fetch(`${apiBase}/departments`);
    const data = await res.json();
    setAllDepartments(data);
  }

  // Открыть подтверждение увольнения
  function openFireConfirm(id, name) {
    setConfirmFireId(id);
    setConfirmFireName(name);
  }

  // Подтвердить увольнение
  async function confirmFire() {
    if (!confirmFireId) return;
    const archive = allDepartments.find(d => d.name === archiveName);
    if (!archive) return alert("Архивный департамент не найден!");

    await fetch(`${apiBase}/employees/${confirmFireId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_id: archive.id })
    });

    setConfirmFireId(null);
    setConfirmFireName("");
    load();
  }

  // Открыть окно перевода
  function openTransferModal(id, name, currentDeptId) {
    setTransferEmployeeId(id);
    setTransferEmployeeName(name);
    setTransferCurrentDeptId(currentDeptId);
    setSelectedTransferDept("");
  }

  // Подтвердить перевод
  async function confirmTransfer() {
    if (!transferEmployeeId || !selectedTransferDept) return;

    await fetch(`${apiBase}/employees/${transferEmployeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_id: Number(selectedTransferDept) })
    });

    setTransferEmployeeId(null);
    setTransferEmployeeName("");
    setTransferCurrentDeptId(null);
    setSelectedTransferDept("");
    load();
  }

  // Возврат из архива
  async function restoreEmployee() {
    if (!restoreEmployeeId || !selectedRestoreDept) return;

    await fetch(`${apiBase}/employees/${restoreEmployeeId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ department_id: Number(selectedRestoreDept) })
    });

    setRestoreEmployeeId(null);
    setSelectedRestoreDept("");
    load();
  }

  useEffect(() => {
    load();
    loadDepartments();
  }, [departmentId]);

  const departments = useMemo(() => 
    Array.from(new Set(employees.map(e => e.department_name || "Без отдела"))), 
    [employees]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return employees.filter((e) => !depFilter || (e.department_name || "Без отдела") === depFilter);
    }

    const isCyr = hasCyrillic(q);
    const variants = [q];
    if (!isCyr) {
      variants.push(keyboardToCyr(q));
      variants.push(latinToCyr(q));
    }

    return employees.filter((e) => {
      const nameMatch = variants.some(v => e.name.toLowerCase().includes(v));
      const positionMatch = e.position?.toLowerCase().includes(q) || false;
      const matchesSearch = nameMatch || positionMatch;
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
          placeholder="Поиск по ФИО… (можно писать латиницей или с англ. раскладкой)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="filter-input"
          style={{ flex: 1 }}
        />
        {showDepartmentFilter && (
          <select value={depFilter} onChange={e => setDepFilter(e.target.value)} className="filter-select">
            <option value="">Все департаменты</option>
            {departments.map(d => <option key={d} value={d}>{d}</option>)}
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
          {filtered.map(e => {
            const isArchived = e.department_name === archiveName;

            return (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.department_name || "Без отдела"}</td>
                <td className="action-buttons">
                  <Link to={`${basePath}/edit/${e.id}`} className="btn-small">Ред.</Link>

                  {isArchived ? (
                    <button
                      onClick={() => { setRestoreEmployeeId(e.id); setSelectedRestoreDept(""); }}
                      className="btn-small"
                      style={{ background: "#10b981" }}
                    >
                      Вернуть
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => openTransferModal(e.id, e.name, e.department_id)}
                        className="btn-small"
                        style={{ background: "#3b82f6" }}
                      >
                        Перевести
                      </button>
                      <button
                        onClick={() => openFireConfirm(e.id, e.name)}
                        className="btn-small red"
                      >
                        Уволить
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* ==================== МОДАЛЬНОЕ ОКНО УВОЛЬНЕНИЯ ==================== */}
      {confirmFireId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#0f1629", padding: "24px", borderRadius: "12px",
            width: "420px", color: "white", textAlign: "center"
          }}>
            <h3 style={{ color: "#ef4444" }}>Уволить сотрудника?</h3>
            <p style={{ margin: "16px 0", fontSize: "17px" }}>
              <strong>{confirmFireName}</strong>
            </p>
            <p style={{ opacity: 0.8, marginBottom: "24px" }}>
              Сотрудник будет перемещён в департамент<br />
              <strong>«Ранее работавшие сотрудники»</strong>
            </p>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button onClick={() => { setConfirmFireId(null); setConfirmFireName(""); }} className="btn-small" style={{ background: "#666" }}>
                Отмена
              </button>
              <button onClick={confirmFire} className="btn-small red">
                Да, уволить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== МОДАЛЬНОЕ ОКНО ПЕРЕВОДА ==================== */}
      {transferEmployeeId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div style={{
            background: "#0f1629", padding: "24px", borderRadius: "12px",
            width: "440px", color: "white"
          }}>
            <h3>Перевести сотрудника</h3>
            <p style={{ margin: "12px 0 20px", fontSize: "17px" }}>
              <strong>{transferEmployeeName}</strong>
            </p>
            <p style={{ opacity: 0.8, marginBottom: "12px" }}>
              Выберите новый департамент:
            </p>

            <select
              value={selectedTransferDept}
              onChange={e => setSelectedTransferDept(e.target.value)}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px",
                background: "#1a2338", color: "white", border: "1px solid #333",
                marginBottom: "24px"
              }}
            >
              <option value="">— Выберите департамент —</option>
              {allDepartments
                .filter(d => 
                  d.name !== archiveName && 
                  d.id !== transferCurrentDeptId
                )
                .map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => {
                  setTransferEmployeeId(null);
                  setTransferEmployeeName("");
                  setTransferCurrentDeptId(null);
                  setSelectedTransferDept("");
                }}
                className="btn-small"
                style={{ background: "#666" }}
              >
                Отмена
              </button>
              <button
                onClick={confirmTransfer}
                className="btn-small"
                style={{ background: "#3b82f6" }}
                disabled={!selectedTransferDept}
              >
                Перевести
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно возврата (без изменений) */}
      {restoreEmployeeId && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.85)", display: "flex",
          alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          {/* ... (код окна возврата остаётся прежним) ... */}
        </div>
      )}
    </div>
  );
}