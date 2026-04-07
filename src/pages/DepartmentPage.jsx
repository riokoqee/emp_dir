import { useParams, useSearchParams } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { getEmployeesByDepartment } from "../api/employeesApi";
import "./DepartmentPage.css";

const SORT_NONE = "none";
const SORT_ASC = "asc";
const SORT_DESC = "desc";

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
    if (map[two]) {
      result += map[two];
      i += 2;
      continue;
    }
    const one = str[i].toLowerCase();
    result += map[one] || str[i];
    i++;
  }
  return result;
};

const hasCyrillic = (str) => {
  if (!str) return false;
  return /[а-яёәғқңөұүіА-ЯЁӘҒҚҢӨҰҮІ]/.test(str);
};

export default function DepartmentPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const deptId = Number(id);

  const [openId, setOpenId] = useState(null);
  const employeeId = searchParams.get("emp") ? Number(searchParams.get("emp")) : null;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Фильтры по департаменту
  const [filterPosition, setFilterPosition] = useState("");
  const [filterRoom, setFilterRoom] = useState("");

  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState(SORT_NONE);

  // ─────────────────────────────────────────────────────────────
  // СБРОС ФИЛЬТРОВ ПРИ СМЕНЕ ДЕПАРТАМЕНТА (исправление бага)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setFilterPosition("");
    setFilterRoom("");
    setShowFilters(false);
    setOpenId(null);           // тоже сбрасываем открытую карточку
  }, [deptId]);

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
    if (row) row.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [employees, employeeId]);

  // Уникальные должности в этом департаменте
  const positions = useMemo(() => {
    const unique = [...new Set(
      employees.map(e => e.position).filter(Boolean)
    )];
    return unique.sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employees]);

  // Уникальные кабинеты
  const rooms = useMemo(() => {
    const unique = [...new Set(
      employees.map(e => e.room).filter(Boolean)
    )];
    return unique.sort((a, b) => a.localeCompare(b, 'ru'));
  }, [employees]);

  const sortedEmployees = useMemo(() => {
    let data = [...employees];

    // Поиск по ФИО
    if (search.trim()) {
      const query = search.toLowerCase().trim();
      const isCyr = hasCyrillic(query);

      const variants = [query];
      if (!isCyr) {
        variants.push(keyboardToCyr(query));
        variants.push(latinToCyr(query));
      }

      data = data.filter(emp =>
        variants.some(v => emp.name.toLowerCase().includes(v))
      );
    }

    // Фильтр по должности
    if (filterPosition) {
      data = data.filter(e => e.position === filterPosition);
    }

    // Фильтр по кабинету
    if (filterRoom) {
      data = data.filter(e => e.room === filterRoom);
    }

    // Сортировка
    if (sortOrder !== SORT_NONE) {
      data.sort((a, b) => {
        const v1 = a[sortField]?.toString() || "";
        const v2 = b[sortField]?.toString() || "";
        if (sortOrder === SORT_ASC) return v1.localeCompare(v2, 'ru');
        if (sortOrder === SORT_DESC) return v2.localeCompare(v1, 'ru');
        return 0;
      });
    }

    return data;
  }, [employees, search, filterPosition, filterRoom, sortField, sortOrder]);

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

  const resetAllFilters = () => {
    setFilterPosition("");
    setFilterRoom("");
    setShowFilters(false);
  };

  function formatBirthday(value) {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("ru-RU");
  }

  const activeFiltersCount = (filterPosition ? 1 : 0) + (filterRoom ? 1 : 0);

  return (
    <div className="dept-root">
      <h2 className="dept-title">Сотрудники отдела</h2>

      <div className="filters">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Поиск по ФИО… (можно писать латиницей или с англ. раскладкой)"
            className="filter-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button
          className="filter-button"
          onClick={() => setShowFilters(!showFilters)}
        >
          Фильтры
          {activeFiltersCount > 0 && <span className="filter-count"> ({activeFiltersCount})</span>}
        </button>
      </div>

      {/* Панель фильтров */}
      {showFilters && (
        <div className="filter-panel">
          <div className="panel-header">
            <h3>Фильтры</h3>
            <button onClick={resetAllFilters} className="reset-all-btn">
              Сбросить всё
            </button>
          </div>

          {/* Должность */}
          <div className="filter-group">
            <label className="filter-group-title">Должность</label>
            <select
              className="filter-select"
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
            >
              <option value="">Все должности</option>
              {positions.map(pos => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>

          {/* Кабинет */}
          <div className="filter-group">
            <label className="filter-group-title">Кабинет</label>
            <select
              className="filter-select"
              value={filterRoom}
              onChange={(e) => setFilterRoom(e.target.value)}
            >
              <option value="">Все кабинеты</option>
              {rooms.map(room => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          <div className="panel-footer">
            <button onClick={() => setShowFilters(false)} className="close-panel-btn">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="dept-empty">Загрузка...</p>
      ) : sortedEmployees.length === 0 ? (
        <p className="dept-empty">Нет сотрудников по выбранным параметрам.</p>
      ) : (
        <table className="dept-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")}>ФИО</th>
              <th onClick={() => toggleSort("position")}>Должность</th>
              <th onClick={() => toggleSort("phone_city")}>Городской</th>
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
                  <td>{emp.phone_city || "—"}</td>
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