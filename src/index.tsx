import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { HashRouter, Route, Routes } from "react-router-dom";
import SpaceDetails from "./SpaceDetails";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:spaceId" element={<SpaceDetails />} />
        </Routes>
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);
