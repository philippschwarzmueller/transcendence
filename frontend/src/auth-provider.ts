interface IAuthProvider {
  isAuthenticated: boolean;
  user: null | any;
  signin(username: string, password: string): Promise<void>;
  signout(): Promise<void>;
}

export const authProvider: IAuthProvider = {
  isAuthenticated: false,
  user: null,
  async signin(username: string, password: string) {
    const response: Response = await fetch("http://localhost:4000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, password: password }),
    });
    const data = await response.json();
    if (response.ok) {
      authProvider.isAuthenticated = true;
      authProvider.user = response;
    } else {
      alert("Login Failed: " + (data.message || "Unknown Error"));
    }
  },
  async signout() {
    authProvider.isAuthenticated = false;
    authProvider.user = null;
  }
};
