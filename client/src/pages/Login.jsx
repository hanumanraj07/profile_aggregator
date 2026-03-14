import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastContext";
import { useAuth } from "../context/AuthContext";

const initialRegister = {
  name: "",
  username: "",
  email: "",
  password: ""
};

function Login() {
  const [mode, setMode] = useState("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [loading, setLoading] = useState(false);
  const { login, registerStudent } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const routeByRole = (role) => {
    navigate(role === "admin" ? "/admin" : "/student-dashboard", { replace: true });
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await login(identifier, password);
      pushToast(`Welcome ${user.name}`, "success");
      routeByRole(user.role);
    } catch (error) {
      pushToast(error.response?.data?.message || "Login failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const user = await registerStudent(registerForm);
      pushToast("Student account created.", "success");
      routeByRole(user.role);
    } catch (error) {
      pushToast(error.response?.data?.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const isAdminLogin = mode === "admin";

  return (
    <div className="mx-auto max-w-3xl">
      <section className="panel">
        <h1 className="text-3xl font-bold text-white">Developer Profile Aggregator</h1>
        <p className="mt-2 text-sm text-slate-400">
          Login first. Students are routed to student dashboard, admins to admin dashboard.
        </p>

        <div className="mt-5 inline-flex rounded-xl border border-line bg-surface p-1">
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${mode === "login" ? "bg-accentBlue text-white" : "text-slate-300"}`}
            onClick={() => setMode("login")}
          >
            Student Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${mode === "admin" ? "bg-accentBlue text-white" : "text-slate-300"}`}
            onClick={() => setMode("admin")}
          >
            Admin Login
          </button>
          <button
            type="button"
            className={`rounded-lg px-4 py-2 text-sm ${mode === "register" ? "bg-accentBlue text-white" : "text-slate-300"}`}
            onClick={() => setMode("register")}
          >
            Student Register
          </button>
        </div>

        {mode === "login" || mode === "admin" ? (
          <form onSubmit={onLogin} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm text-slate-300">{isAdminLogin ? "Admin Email or Username" : "Email or Username"}</label>
              <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : isAdminLogin ? "Login as Admin" : "Login as Student"}
            </button>
            {isAdminLogin ? (
              <p className="text-xs text-slate-500">
                
              </p>
            ) : null}
          </form>
        ) : (
          <form onSubmit={onRegister} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm text-slate-300">Name</label>
                <input
                  className="input"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-slate-300">Username</label>
                <input
                  className="input"
                  value={registerForm.username}
                  onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Email</label>
              <input
                type="email"
                className="input"
                value={registerForm.email}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-slate-300">Password</label>
              <input
                type="password"
                className="input"
                value={registerForm.password}
                onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Please wait..." : "Create Student Account"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default Login;
