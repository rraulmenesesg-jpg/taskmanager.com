// Configuración
const SB_URL = "https://jlyqadygjogdfsqdqafn.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpseXFhZHlnam9nZGZzcWRxYWZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMjgyMDEsImV4cCI6MjA4MjcwNDIwMX0.ZWkR8NOdPGkdNDkBPLXLwmE1DT76udW_J5OgJ016AYk";

// Creamos el cliente. 
// 'supabase' (en minúsculas) es lo que viene de la librería externa.
// 'client' es como llamaremos a nuestra conexión.
window.supabaseClient = supabase.createClient(SB_URL, SB_KEY);
// Función para el login
console.log("Conexión con Supabase establecida correctamente.");