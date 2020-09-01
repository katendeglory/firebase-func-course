import app from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyAvG9Dd3Wecyzc9jby8yiC0z210sZBjmvI",
  authDomain: "project-manathan-781227.firebaseapp.com",
  databaseURL: "https://project-manathan-781227.firebaseio.com",
  projectId: "project-manathan-781227",
  storageBucket: "project-manathan-781227.appspot.com",
  messagingSenderId: "697524608485",
  appId: "1:697524608485:web:b09808c15bb3b83c43230c",
  measurementId: "G-F0VNVYD38Y"
}

app.initializeApp(firebaseConfig);

export const auth = app.auth();
export const db = app.firestore();
export const func = app.functions();