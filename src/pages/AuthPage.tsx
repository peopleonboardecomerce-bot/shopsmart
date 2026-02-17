import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const returnTo = (location.state as { returnTo?: string })?.returnTo || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleSuccess = () => {
    navigate(returnTo, { replace: true });
  };

  return (
    <Layout>
      <div className="container py-16">
        <AuthModal onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
};

export default AuthPage;
