import { useState, useEffect } from "react";
import supabase from "../lib/supabase-client";
<<<<<<< Updated upstream
=======
import styles from "../styles/Dashboard.module.css"; 
>>>>>>> Stashed changes

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
<<<<<<< Updated upstream
  
  useEffect(() => {

=======

  useEffect(() => {
>>>>>>> Stashed changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

<<<<<<< Updated upstream
    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
=======
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
    return () => {
    };
  }, [session]); 

  if (!session) {
    return (
      <div>
        <h2>Musisz być zalogowany</h2>
=======

    return () => {
      subscription?.unsubscribe();
    };
  }, [session]);

  if (!session) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>
          Musisz być zalogowany, aby zobaczyć panel!
        </h2>
>>>>>>> Stashed changes
      </div>
    );
  }

  return (
<<<<<<< Updated upstream
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
=======
    <div className={styles.container}>
      <h2 className={styles.title}>Witaj</h2>
      <div className={styles.infoBox}>
        <p className={styles.infoText}>
          Zalogowany jako: <strong>{user?.email}</strong>
        </p>
        <p className={styles.subText}>
          Twoje ID użytkownika: <span className={styles.value}>{user?.id}</span>
        </p>
        <p className={styles.subText}>
          Rola: <span className={styles.value}>{user?.role || "Nie określono"}</span>
        </p>
      </div>
>>>>>>> Stashed changes
    </div>
  );
}
