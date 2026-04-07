import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { getDepartments } from "../../api/departmentsApi";
import { getAllEmployees } from "../../api/employeesApi";

const RightSidebar = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [allEmployees, setAllEmployees] = useState([]);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // ==================== ТРАНСЛИТ ====================
  const keyboardToCyr = (str) => {
    if (!str) return "";
    const map = {
      q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ",
      p: "з", "[": "х", "]": "ъ", a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р",
      j: "о", k: "л", l: "д", ";": "ж", "'": "э", z: "я", x: "ч", c: "с", v: "м",
      b: "и", n: "т", m: "ь", ",": "б", ".": "ю", "`": "ё",
      Q: "Й", W: "Ц", E: "У", R: "К", T: "Е", Y: "Н", U: "Г", I: "Ш", O: "Щ",
      P: "З", "{": "Х", "}": "Ъ", A: "Ф", S: "Ы", D: "В", F: "А", G: "П", H: "Р",
      J: "О", K: "Л", L: "Д", ":": "Ж", '"': "Э", Z: "Я", X: "Ч", C: "С", V: "М",
      B: "И", N: "Т", M: "Ь", "<": "Б", ">": "Ю", "~": "Ё",
    };
    return str.split("").map((char) => map[char] || char).join("");
  };

  const latinToCyr = (str) => {
    if (!str) return "";
    const map = {
      a: "а", b: "б", c: "ц", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и",
      j: "й", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "к", r: "р",
      s: "с", t: "т", u: "у", v: "в", w: "ш", x: "х", y: "ы", z: "з",
      sh: "ш", ch: "ч", zh: "ж", kh: "х",
    };

    let result = "";
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

  // ==================== ЗАГРУЗКА ====================
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
    (async () => {
      try {
        const data = await getAllEmployees();
        setAllEmployees(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // ==================== ПОИСК ====================
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);

    const timeout = setTimeout(() => {
      const q = query.trim();
      const isCyr = hasCyrillic(q);

      const variants = [q.toLowerCase()];

      if (!isCyr) {
        variants.push(keyboardToCyr(q).toLowerCase());
        variants.push(latinToCyr(q).toLowerCase());
      }

      const filtered = allEmployees.filter((emp) => {
        const nameLower = emp.name.toLowerCase();
        return variants.some((v) => nameLower.includes(v));
      });

      setResults(filtered);
      setSearching(false);
    }, 200);

    return () => clearTimeout(timeout);
  }, [query, allEmployees]);

  const handleSelectResult = useCallback(() => {
    setResults([]);
    setQuery("");
    setSearching(false);
  }, []);

  return (
    <div className="rs-root">
      <div className="rs-search">
        <input
          type="text"
          placeholder="Поиск сотрудника... (можно с англ. раскладкой)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {/* Подсказка */}
        {query.length > 2 && !hasCyrillic(query) && (
          <div className="rs-translit-hint">
            Распознано как: <strong>{keyboardToCyr(query)}</strong>
          </div>
        )}

        {query.trim().length >= 2 && (
          <div className="rs-search-results">
            {searching && <p className="rs-status">Поиск...</p>}
            {!searching && results.length === 0 && (
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