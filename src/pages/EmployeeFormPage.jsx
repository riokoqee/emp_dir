import EmployeeForm from "../components/Admin/employees/EmployeeForm";
import { useNavigate } from "react-router-dom";

export default function EmployeeFormPage() {
  const navigate = useNavigate();

  async function save(data) {
    await fetch("http://localhost:8080/api/admin/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    navigate("/admin/employees");
  }

  return (
    <div>
      <h2 style={{ color: "white" }}>Добавить сотрудника</h2>
      <EmployeeForm initial={{
        name: "",
        position: "",
        phone_city: "",
        phone_mobile: "",
        email: "",
        room: "",
        birthday: "",
        department_id: 1,
        departments: []
      }} 
      onSave={save} />
    </div>
  );
}
