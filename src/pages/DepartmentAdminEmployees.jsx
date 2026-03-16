import { useParams } from "react-router-dom";
import EmployeeList from "../components/Admin/employees/EmployeeList";

export default function DepartmentAdminEmployees() {
  const { departmentId } = useParams();
  const depId = Number(departmentId);

  return (
    <EmployeeList
      departmentId={depId}
      title="Сотрудники моего отдела"
      basePath={`/admin/department/${departmentId}/employees`}
    />
  );
}
