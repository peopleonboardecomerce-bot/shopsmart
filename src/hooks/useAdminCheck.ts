import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export const useAdminCheck = () => {
  const { isAuthenticated, isAdmin, isLoading, isAdminLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for both auth and admin check to complete
    if (!isLoading && !isAdminLoading) {
      if (!isAuthenticated) {
        navigate("/auth", { state: { returnTo: "/admin" } });
      } else if (!isAdmin) {
        navigate("/", { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, isLoading, isAdminLoading, navigate]);

  return { isLoading: isLoading || isAdminLoading, isAdmin, isAuthenticated };
};
