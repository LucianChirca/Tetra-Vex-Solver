import "./gui/style.css";
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./gui";

createRoot(document.getElementById("app")!).render(createElement(App));
