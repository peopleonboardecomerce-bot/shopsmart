import { useNavigate, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { AuthModal } from "@/components/auth/AuthModal";
import { useAuth } from "@/contexts/AuthContext";
import { useCallback, useEffect, useMemo } from "react";

type LocationState = { returnTo?: string } | null;

const isSafeInternalPath = (path: unknown) => {
  if (typeof path !== "string") return false;
  if (!path.startsWith("/")) return false;
  // prevent protocol-relative, backslashes, and obvious external schemes
  if (path.startsWith("//")) return false;
  if (path.includes("\\")) return false;
  if (path.startsWith("/http")) return false;
  return true;
};

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Keep returnTo stable and prevent open-redirect style issues
  const returnTo = useMemo(() => {
    const state = (location.state as LocationState) || null;
    const candidate = state?.returnTo;
    return isSafeInternalPath(candidate) ? candidate! : "/";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnTo, { replace: true });
    }
  }, [isAuthenticated, navigate, returnTo]);

  const handleSuccess = useCallback(() => {
    navigate(returnTo, { replace: true });
  }, [navigate, returnTo]);

  return (
    <Layout>
      <div className="container py-16">
        <AuthModal onSuccess={handleSuccess} />
      </div>
    </Layout>
  );
};

export default AuthPage;
