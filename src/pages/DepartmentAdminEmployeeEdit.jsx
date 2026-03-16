import { useParams } from "react-router-dom";
import EmployeeEdit from "../components/Admin/employees/EmployeeEdit";

export default function DepartmentAdminEmployeeEdit({ mode = "edit" }) {
  const { departmentId } = useParams();
  const depId = Number(departmentId);

  return (
    <EmployeeEdit
      mode={mode}
      departmentId={depId}
      backPath={`/admin/department/${departmentId}`}
    />
  );
}
