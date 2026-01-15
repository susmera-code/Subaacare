import { supabase } from "../supabaseClient";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const useAdminGuard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user || data.user.user_metadata.role !== "admin") {
        navigate("/login");
      }
    };
    checkAdmin();
  }, []);
};
