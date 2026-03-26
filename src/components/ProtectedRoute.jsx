import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("merobase_token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}