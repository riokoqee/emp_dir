import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("http://localhost:8080/api/departments");
      const data = await res.json();
      setDepartments(data);
    }

    load();
  }, []);

  return (
    <div className="admin-root">
      <h1 className="admin-title">Админ-панель</h1>

      <div className="admin-grid">

        <div className="admin-card">
          <h2>Сотрудники</h2>
          <p>Управление всеми сотрудниками, редактирование и удаление.</p>
          <div className="admin-actions">
            <Link to="/admin/employees" className="btn-primary">Все сотрудники</Link>
            <Link to="/admin/employees/new" className="btn-secondary">Добавить сотрудника</Link>
          </div>
        </div>

        <div className="admin-card">
          <h2>Департаменты</h2>
          <p>Редактирование подразделений, добавление и удаление.</p>
          <div className="admin-actions">
            <Link to="/admin/departments" className="btn-primary">Все департаменты</Link>
            <Link to="/admin/departments/new" className="btn-secondary">Добавить департамент</Link>
          </div>
        </div>

        <div className="admin-card admin-card-wide">
          <h2>Админки отделов</h2>
          <p>Перейдите в админку конкретного отдела, чтобы работать только с его сотрудниками.</p>
          <div className="department-links">
            {departments.map((d) => (
              <Link
                key={d.id}
                to={`/admin/department/${d.id}`}
                className="btn-secondary"
              >
                {d.name}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
