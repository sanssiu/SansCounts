import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBooi_FfQmHYXzrqoiJPAQMuMT3_8iQFkY",
  authDomain: "sanscountsauth.firebaseapp.com",
  projectId: "sanscountsauth",
  storageBucket: "sanscountsauth.firebasestorage.app",
  messagingSenderId: "1033970622393",
  appId: "1:1033970622393:web:2c7ecb0df95a543d82e068"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);