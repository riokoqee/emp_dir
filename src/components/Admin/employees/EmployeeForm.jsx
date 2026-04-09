import { useState } from "react";
import "./admin.css";

export default function EmployeeForm({ initial, onSave, lockedDepartmentId }) {
  const [form, setForm] = useState(initial);

  function update(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    await onSave(form);
  }

  return (
    <form onSubmit={submit} className="admin-form">

      <label>ФИО</label>
      <input value={form.name} onChange={e => update("name", e.target.value)} />

      <label>Должность</label>
      <input value={form.position} onChange={e => update("position", e.target.value)} />

      <label>Кабинет</label>
      <input value={form.room} onChange={e => update("room", e.target.value)} />

      {/* Новое поле для внутреннего номера */}
      <label>Внутренний номер</label>
      <input 
        value={form.internal_phone || ""} 
        onChange={e => update("internal_phone", e.target.value)} 
        placeholder="Например: 102"
      />

      <label>Городской</label>
      <input value={form.phone_city} onChange={e => update("phone_city", e.target.value)} />

      <label>Сотовый</label>
      <input value={form.phone_mobile} onChange={e => update("phone_mobile", e.target.value)} />

      <label>Email</label>
      <input value={form.email} onChange={e => update("email", e.target.value)} />

      <label>Дата рождения</label>
      <input type="date" value={form.birthday || ""} onChange={e => update("birthday", e.target.value)} />

      <label>Департамент</label>
      <select
        value={lockedDepartmentId || form.department_id}
        onChange={e => update("department_id", e.target.value)}
        disabled={!!lockedDepartmentId}
      >
        {form.departments?.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>

      <button className="btn-primary">Сохранить</button>
    </form>
  );
}