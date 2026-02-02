import React from "react";
import ReactDOM from "react-dom/client";

import "./styles/design-system.css";
import "./styles/components.css";
import "./styles/Login.css";
import "./index.css";

import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
