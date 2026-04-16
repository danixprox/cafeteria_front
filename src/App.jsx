import { useState } from "react";
import Home from "./Features/public/Home";
import Login from "./Features/public/Login";

function App() {
  const [page, setPage] = useState("home");

  return (
    <div className="min-h-screen bg-slate-50">
      {page === "home" ? (
        <Home onLogin={() => setPage("login")} />
      ) : (
        <Login onBack={() => setPage("home")} />
      )}
    </div>
  );
}

export default App;
