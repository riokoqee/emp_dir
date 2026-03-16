import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getDepartments } from "../../api/departmentsApi";
import { searchEmployees } from "../../api/employeesApi";

const RightSidebar = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (e) {
        console.error(e);
        setError("Не удалось загрузить отделы");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      setSearchError("");
      return;
    }

    setSearching(true);
    setSearchError("");

    const timeout = setTimeout(async () => {
      try {
        const data = await searchEmployees(query.trim());
        setResults(data);
      } catch (err) {
        console.error(err);
        setSearchError("Ошибка поиска");
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  const handleSelectResult = useCallback(() => {
    setResults([]);
    setQuery("");
    setSearchError("");
    setSearching(false);
  }, []);

  return (
    <div className="rs-root">
      <div className="rs-search">
        <input
          type="text"
          placeholder="Поиск сотрудника..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query.trim().length >= 2 && (
          <div className="rs-search-results">
            {searching && <p className="rs-status">Поиск...</p>}
            {searchError && <p className="rs-status rs-error">{searchError}</p>}
            {!searching && !searchError && results.length === 0 && (
              <p className="rs-status">Не найдено</p>
            )}
            {results.map((emp) => (
              <NavLink
                key={emp.id}
                to={`/department/${emp.department_id}?emp=${emp.id}`}
                className="rs-search-item"
                onClick={handleSelectResult}
              >
                <span className="rs-search-name">{emp.name}</span>
                <span className="rs-search-meta">
                  {emp.department || "Без отдела"}
                  {emp.room ? ` · Каб. ${emp.room}` : ""}
                </span>
              </NavLink>
            ))}
          </div>
        )}
      </div>

      <div className="rs-header">
        <span className="rs-title">Отделы</span>
      </div>

      {loading && <p className="rs-status">Загрузка...</p>}
      {error && !loading && <p className="rs-status rs-error">{error}</p>}

      <div className="rs-list">
        {departments.map((d) => (
          <NavLink
            key={d.id}
            to={`/department/${d.id}`}
            className={({ isActive }) =>
              "rs-item" + (isActive ? " rs-item-active" : "")
            }
          >
            <span className="rs-dot" />
            <span className="rs-name">{d.name}</span>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default RightSidebar;
