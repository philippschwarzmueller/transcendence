import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import Home from "./routes/Home";
import Chat from "./routes/Chat";
import Game from "./routes/Game";
import App from "./routes/App";
import ErrorPage from "./routes/error-page";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import Profile from "./routes/Profile";
import ProfileSettings from "./routes/ProfileSettings";
import GetToken from "./routes/GetToken";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/home",
        element: <Home />,
      },
      {
        path: "/play",
        element: <Game />,
      },
      {
        path: "/chat",
        element: <Chat />,
      },
      {
        path: "/react-basics",
        element: <App />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/profile/settings",
        element: <ProfileSettings />,
      },
      {
        path: "/get-token",
        element: <GetToken />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
