import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { iniciarMonitoramento } from "./lib/monitoring";
import "./index.css";

// Antes do render, de propósito: erro que acontece durante o primeiro render é
// exatamente o que vira tela branca, e é o que mais precisa ser capturado.
iniciarMonitoramento();

createRoot(document.getElementById("root")!).render(<App />);
