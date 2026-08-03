import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>
      {user ? (
        <div>
          <p>Welcome, {user.role}!</p>
          <p>User ID: {user.id}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default DashboardPage;