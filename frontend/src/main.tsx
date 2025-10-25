import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// import './index.css'
import "@assets/css/remixicon.css";
import "@assets/css/lib/bootstrap.min.css";
import "@assets/css/lib/apexcharts.css";
import "@assets/css/lib/dataTables.min.css";
import "@assets/css/lib/editor-katex.min.css";
import "@assets/css/lib/editor.atom-one-dark.min.css";
import "@assets/css/lib/editor.quill.snow.css";
import "@assets/css/lib/flatpickr.min.css";
import "@assets/css/lib/full-calendar.css";
import "@assets/css/lib/jquery-jvectormap-2.0.5.css";
import "@assets/css/lib/magnific-popup.css";
import "@assets/css/lib/slick.css";
import "@assets/css/lib/prism.css";
import "@assets/css/lib/file-upload.css";
import "@assets/css/lib/audioplayer.css";
import "@assets/css/lib/animate.min.css";
import "@assets/css/style.css";
import "@assets/css/extra.css";
import "react-quill/dist/quill.snow.css";
import "jsvectormap/dist/jsvectormap.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import "react-toastify/dist/ReactToastify.css";
import "react-modal-video/css/modal-video.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "react-datepicker/dist/react-datepicker.css";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import "@assets/css/Street.css";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
// main.tsx

import App from "./App.tsx";
import { PersistGate } from "redux-persist/es/integration/react";
import { Provider } from "react-redux";
import { store } from "./redux/store.ts";
import persistStore from "redux-persist/es/persistStore";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "./context/SocketProvider.tsx";
const persistor = persistStore(store);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <SocketProvider>
          <ToastContainer />
          <App />
        </SocketProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
