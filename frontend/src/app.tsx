import React from 'react';
import ReactDOM from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';
import './index.css';
import Root from './routes/root';
import Home from './routes/Home';
import Chat from './routes/Chat';
import Game from './routes/Game';
import Queue from './routes/Queue';
import ErrorPage from './routes/error-page';
import SignUp from './routes/SignUp';
import Login from './routes/Login';
import Profile from './routes/Profile';
import ProfileSettings from './routes/ProfileSettings';
import SetUser from './routes/SetUser';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Root />} errorElement={<ErrorPage />}>
        <Route index element={<Home />} />
        <Route path="home" element={<Home />} />
        <Route path="play" element={<Game />}>
          <Route path=":gameId" element={<Game />}>
            <Route path=":side" element={<Game />} />
          </Route>
        </Route>
        <Route path="chat" element={<Chat />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="login" element={<Login />} />
        <Route path="profile" element={<Profile />}>
          <Route path=":userId" element={<Profile />} />
        </Route>
        <Route path="profile/settings" element={<ProfileSettings />} />
        <Route path="queue" element={<Queue />} />
        <Route path="set-user" element={<SetUser />} />
      </Route>
    </Routes>
  );
}

export default App;
