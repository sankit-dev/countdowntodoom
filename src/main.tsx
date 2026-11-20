import { createRoot } from "react-dom/client";
import App from "./App";
import { Analytics } from "./analytics";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
    <Analytics />
  </>
);
