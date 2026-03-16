import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EmployeeForm from "./EmployeeForm";
import "./admin.css";

export default function EmployeeEdit({ mode = "edit", departmentId, backPath }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isCreate = mode === "create";

  const [employee, setEmployee] = useState(null);
  const apiBase = "http://localhost:8080/api/admin";
  const departmentQuery = departmentId ? `?departmentId=${departmentId}` : "";
  const redirectTo = backPath || "/admin/employees";

  useEffect(() => {
    async function load() {
      const depsRes = await fetch(`${apiBase}/departments`);
      const depsRaw = await depsRes.json();
      const deps = departmentId
        ? depsRaw.filter((d) => d.id === Number(departmentId))
        : depsRaw;

      const defaultDepartmentId = departmentId || deps[0]?.id || "";

      if (isCreate) {
        setEmployee({
          name: "",
          position: "",
          phone_city: "",
          phone_mobile: "",
          email: "",
          room: "",
          birthday: "",
          department_id: defaultDepartmentId,
          departments: deps
        });
        return;
      }

      const res = await fetch(`${apiBase}/employees/${id}${departmentQuery}`);
      const emp = await res.json();
      setEmployee({
        ...emp,
        departments: deps,
        department_id: departmentId || emp.department_id || deps[0]?.id || ""
      });
    }

    load();
  }, [apiBase, id, isCreate, departmentId, departmentQuery]);

  const title = useMemo(
    () => (isCreate ? "Добавить сотрудника" : "Редактировать сотрудника"),
    [isCreate]
  );

  async function save(updated) {
    const payload = {
      ...updated,
      department_id: departmentId || updated.department_id
    };
    delete payload.departments;

    const method = isCreate ? "POST" : "PUT";
    const url = isCreate
      ? `${apiBase}/employees${departmentQuery}`
      : `${apiBase}/employees/${id}${departmentQuery}`;

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    navigate(redirectTo);
  }

  if (!employee) return <p style={{ color: "white" }}>Загрузка...</p>;

  return (
    <div>
      <h2 style={{ color: "white" }}>{title}</h2>
      <EmployeeForm
        initial={employee}
        onSave={save}
        lockedDepartmentId={departmentId}
      />
    </div>
  );
}
