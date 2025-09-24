import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import './index.css'
import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/jsvectormap.css";

import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "@assets/css/Street.css";
import App from "./App.tsx";
import { PersistGate } from "redux-persist/es/integration/react";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import persistStore from "redux-persist/es/persistStore";
import { ToastContainer } from "react-toastify";
const persistor = persistStore(store);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ToastContainer />
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>
);
