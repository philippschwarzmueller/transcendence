import { Navigate, Route, Routes } from "react-router-dom";
import "./index.css";
import Root from "./routes/root";
import Home from "./routes/Home";
import Game from "./routes/Game";
import Queue from "./routes/Queue";
import ErrorPage from "./routes/error-page";
import SignUp from "./routes/SignUp";
import Login from "./routes/Login";
import SetUser from "./routes/SetUser";
import PrivateRoute from "./routes/PrivateRoute";
import NotFound from "./routes/404";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
        <Route path="/" element={<Navigate to="/home" />} />
        <Route
          path="home"
          element={
            <PrivateRoute>
              <Home/>
            </PrivateRoute>
          }
        />
        <Route path="play" element={<Game />}>
          <Route path=":gameId" element={<Game />}>
            <Route path=":side" element={<Game />} />
          </Route>
        </Route>
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
        <Route path="queue" element={<Queue />} />
        <Route path="set-user" element={<SetUser />} />
        <Route path="404" element={<NotFound />} />
      </Route>
      <Route path="*" element={<Navigate to="/404" />} />
    </Routes>
  );
}

export default App;
