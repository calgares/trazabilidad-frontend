import React from "react";
import ReactDOM from "react-dom/client";

// 👇 ESTA LÍNEA ES CRÍTICA
import "./index.css";

import App from "./App";



ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
