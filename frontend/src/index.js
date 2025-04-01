import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import firebase from "firebase/compat/app";
import "firebase/compat/storage"; // Ensure Firebase Storage is imported
import store from "./redux/store";
import { Provider } from "react-redux";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDYS6AbgDR-xM-_nBgVvmfhV99neOjTiV0",
  authDomain: "assessa-d31c6.firebaseapp.com",
  projectId: "assessa-d31c6",
  storageBucket: "assessa-d31c6.appspot.com",
  messagingSenderId: "24759926573",
  appId: "1:24759926573:web:46757416fdfdd6250d1da4",
  measurementId: "G-B1MNYNG46D"
}
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

reportWebVitals();
