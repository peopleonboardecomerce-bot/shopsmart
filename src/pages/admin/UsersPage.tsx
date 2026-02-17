import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Shield, User } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { es } from "date-fns/locale";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  isAdmin: boolean;
}

export const UsersPage = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    // First fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false });

    if (profilesError) {
      toast.error("Error al cargar usuarios");
      console.error(profilesError);
      setLoading(false);
      return;
    }

    // Fetch admin roles
    const { data: rolesData } = await supabase
      .from("user_roles")
      .select("user_id, role")
      .eq("role", "admin");

    const adminUserIds = new Set(rolesData?.map((r) => r.user_id) || []);

    // Fetch emails via edge function (admin only)
    const userIds = profilesData?.map((p) => p.id) || [];
    let emails: Record<string, string> = {};

    if (userIds.length > 0) {
      try {
        const { data: emailData } = await supabase.functions.invoke("get-user-emails", {
          body: { userIds },
        });
        if (emailData?.emails) {
          emails = emailData.emails;
        }
      } catch (error) {
        console.error("Error fetching emails:", error);
      }
    }

    const usersWithRoles: UserProfile[] = (profilesData || []).map((profile) => ({
      id: profile.id,
      email: emails[profile.id] || null,
      full_name: profile.full_name,
      created_at: profile.created_at,
      isAdmin: adminUserIds.has(profile.id),
    }));

    setUsers(usersWithRoles);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="font-serif text-3xl font-bold mb-8">Usuarios</h1>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay usuarios todavía.</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Fecha de registro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isAdmin ? (
                        <Shield className="h-4 w-4 text-primary" />
                      ) : (
                        <User className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">
                        {user.full_name || "Sin nombre"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email || "-"}</TableCell>
                  <TableCell>
                    {user.isAdmin ? (
                      <Badge className="bg-primary">Admin</Badge>
                    ) : (
                      <Badge variant="secondary">Usuario</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "dd MMM yyyy", { locale: es })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="mt-6 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Nota:</strong> Para asignar el rol de administrador a un usuario, 
          contacta con el equipo técnico o hazlo directamente desde el panel de base de datos.
        </p>
      </div>
    </div>
  );
};
