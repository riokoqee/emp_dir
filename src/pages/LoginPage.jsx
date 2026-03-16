import "./LoginPage.css";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3.5" />
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12c2.5-4 6-6 10-6s7.5 2 10 6c-2.5 4-6 6-10 6s-7.5-2-10-6Z" />
    <path d="M12 9.5a2.5 2.5 0 1 0 0 5" />
    <line x1="4" y1="4" x2="20" y2="20" />
  </svg>
);

const deptCredentials = {
  "АПП": { password: "app123456", departmentName: "Аппарат председателя Правления" },
  "ДБФ1": { password: "dbf1123456", departmentName: "Департамент бюджетного финансирования 1" },
  "ДБФ2": { password: "dbf2123456", departmentName: "Департамент бюджетного финансирования 2" },
  "ДИТ": { password: "dit123456", departmentName: "Департамент информационных технологий" },
  "ДМВГО": { password: "dmvgo123456", departmentName: "Департамент методологии и взаимодействия с государственными органами" },
  "ДМ": { password: "dm123456", departmentName: "Департамент мониторинга" },
  "ДПВК": { password: "dpvk123456", departmentName: "Департамент продвижения и внешних коммуникаций" },
  "ЗПП": { password: "zpp123456", departmentName: "Заместитель председателя Правления" },
  "ПЗПП": { password: "pzpp123456", departmentName: "Первый заместитель председателя Правления" },
  "СВААК": { password: "svaak123456", departmentName: "Служба внутреннего аудита и антикоррупционного комплаенса" },
  "СПК": { password: "spk123456", departmentName: "Служба последовательного контроля" },
  "ФП": { password: "fp123456", departmentName: "Финансовый департамент" },
  "УХД": { password: "uhd123456", departmentName: "Управление хозяйственной деятельности" },
  "ПП": { password: "pp123456", departmentName: "Председатель Правления" }
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDepartments() {
      try {
        const res = await fetch("http://localhost:8080/api/departments");
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Не удалось загрузить департаменты", err);
      }
    }

    loadDepartments();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const normalizedUsername = useMemo(
    () => form.username.trim().toUpperCase(),
    [form.username]
  );

  const matchedDept = useMemo(() => {
    const creds = deptCredentials[normalizedUsername];
    if (!creds) return null;
    return departments.find(
      (d) => d.name.toLowerCase() === creds.departmentName.toLowerCase()
    ) || null;
  }, [normalizedUsername, departments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isSuperAdmin = normalizedUsername === "ADMIN";
    const isDeptAdmin = !!deptCredentials[normalizedUsername];

    if (!isSuperAdmin && !isDeptAdmin) {
      setError("Неверный логин или пароль");
      return;
    }

    if (isDeptAdmin && !matchedDept) {
      setError("Для этого логина не найден департамент");
      return;
    }

    const result = await login({
      username: form.username,
      password: form.password,
      departmentId: matchedDept?.id,
      displayName: matchedDept?.name
    });

    if (!result?.success) {
      setError(result.error || "Ошибка авторизации");
      return;
    }

    if (isSuperAdmin) {
      navigate("/admin");
    } else {
      navigate(`/admin/department/${matchedDept.id}`);
    }
  };

  return (
    <div className="login-root">
      <div className="login-card">
        <h1>Вход в систему</h1>
        <p>Суперадмин или админ отдела</p>

        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Логин
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Пароль
            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="toggle-eye"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
              </button>
            </div>
          </label>

          {matchedDept && (
            <p className="login-hint">
              Департамент: {matchedDept.name}
            </p>
          )}

          {error && <p style={{ color: "salmon" }}>{error}</p>}

          <button type="submit" className="submit-btn">
            Войти
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
