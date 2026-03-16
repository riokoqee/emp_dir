import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import MainLayout from "./components/Layout/MainLayout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import DepartmentPage from "./pages/DepartmentPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminDepartments from "./pages/AdminDepartments";
import DepartmentForm from "./pages/DepartmentForm";
import EmployeeList from "./components/Admin/employees/EmployeeList";
import EmployeeEdit from "./components/Admin/employees/EmployeeEdit";
import DepartmentAdminEmployees from "./pages/DepartmentAdminEmployees";
import DepartmentAdminEmployeeEdit from "./pages/DepartmentAdminEmployeeEdit";

function AdminRoute({ children }) {
  const { user } = useAuth();
  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function DepartmentAdminRoute({ children }) {
  const { user } = useAuth();
  const { departmentId } = useParams();
  const depId = Number(departmentId);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return children;

  if (user.role === "DEPT_ADMIN" && user.departmentId === depId) {
    return children;
  }

  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <MainLayout>
                <HomePage />
              </MainLayout>
            }
          />

          <Route
            path="/department/:id"
            element={
              <MainLayout>
                <DepartmentPage />
              </MainLayout>
            }
          />

          <Route
            path="/admin/department/:departmentId"
            element={
              <DepartmentAdminRoute>
                <MainLayout>
                  <DepartmentAdminEmployees />
                </MainLayout>
              </DepartmentAdminRoute>
            }
          />

          <Route
            path="/admin/department/:departmentId/employees/new"
            element={
              <DepartmentAdminRoute>
                <MainLayout>
                  <DepartmentAdminEmployeeEdit mode="create" />
                </MainLayout>
              </DepartmentAdminRoute>
            }
          />

          <Route
            path="/admin/department/:departmentId/employees/edit/:id"
            element={
              <DepartmentAdminRoute>
                <MainLayout>
                  <DepartmentAdminEmployeeEdit />
                </MainLayout>
              </DepartmentAdminRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <MainLayout>
                  <AdminDashboard />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/employees"
            element={
              <AdminRoute>
                <MainLayout>
                  <EmployeeList />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/employees/new"
            element={
              <AdminRoute>
                <MainLayout>
                  <EmployeeEdit mode="create" />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/employees/edit/:id"
            element={
              <AdminRoute>
                <MainLayout>
                  <EmployeeEdit mode="edit" />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/departments"
            element={
              <AdminRoute>
                <MainLayout>
                  <AdminDepartments />
                </MainLayout>
              </AdminRoute>
            }
          />

          <Route
            path="/admin/departments/new"
            element={
              <AdminRoute>
                <MainLayout>
                  <DepartmentForm />
                </MainLayout>
              </AdminRoute>
            }
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
