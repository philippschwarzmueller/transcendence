import { useLocation, useNavigate } from "react-router-dom";

const GetToken: React.FC = () => {
  const location = useLocation();
  const nav = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const code: string | null = urlParams.get("code");
  const value: string | null = sessionStorage.getItem("code");
  if (code && !value) {
    sessionStorage.setItem("code", code);
  }
  if (code && code !== value) {
    fetch(`http://localhost:4000/auth/get-token?code=${code}`)
      .then((response) => response.text())
      .then((text) => {
        if (text) {
          sessionStorage.setItem("token", text);
          sessionStorage.removeItem("code");
          nav("/profile");
        }
      });
  }
  return null;
};

export default GetToken;
