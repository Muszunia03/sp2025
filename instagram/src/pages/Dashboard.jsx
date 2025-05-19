import { useState, useEffect } from "react";
import supabase from "../lib/supabase-client";

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  
  useEffect(() => {

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    if (session) {
      const fetchUserData = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Błąd pobierania danych użytkownika:", error);
        } else {
          setUser(user);
        }
      };
      fetchUserData();
    }
    return () => {
    };
  }, [session]); 

  if (!session) {
    return (
      <div>
        <h2>Musisz być zalogowany</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      <h2>Witaj!</h2>
      <p>
        Zalogowany jako: <strong>{user?.email}</strong>
      </p>
      <div>
        <p>Twoje ID : {user?.id}</p>
        <p>Rola: {user?.role || "Nie określono"}</p>
      </div>

      <button onClick={async () => { await supabase.auth.signOut(); setSession(null); }}>
        Wyloguj
      </button>
    </div>
  );
}
