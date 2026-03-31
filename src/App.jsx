import { useMemo, useState } from "react";
import LayoutShell from "./components/LayoutShell";
import FutureModules from "./pages/FutureModules";
import LandingBuilder from "./pages/LandingBuilder";
import SiteManager from "./pages/SiteManager";
import ScraperControl from "./pages/ScraperControl";
import LoginPage from "./pages/LoginPage";
import { AUTH_TOKEN_KEY } from "./api/client";

function App() {
  const [session, setSession] = useState(() => {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    return token ? { token } : null;
  });
  const [activeKey, setActiveKey] = useState("landing-builder");

  const renderedTool = useMemo(() => {
    if (activeKey === "site-manager") return <SiteManager />;
    if (activeKey === "g2b-scraper") return <ScraperControl />;
    if (activeKey === "future-modules") return <FutureModules />;
    return <LandingBuilder />;
  }, [activeKey]);

  const handleLogout = () => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    setSession(null);
  };

  if (!session) {
    return <LoginPage onSuccess={setSession} />;
  }

  return (
    <LayoutShell activeKey={activeKey} onChangeMenu={setActiveKey} onLogout={handleLogout}>
      {renderedTool}
    </LayoutShell>
  );
}

export default App;
