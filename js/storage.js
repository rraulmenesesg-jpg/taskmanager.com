// Reemplaza a supabase.js. "BD" en localStorage, formato JSON.
const DB_KEY = "gt_db_v1";
const SESSION_KEY = "gt_session_v1";

const db = {
  read() {
    try {
      const d = JSON.parse(localStorage.getItem(DB_KEY));
      return { users: d?.users || [], tasks: d?.tasks || [] };
    } catch {
      return { users: [], tasks: [] };
    }
  },
  write(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }
};

const uid = () => crypto.randomUUID();
