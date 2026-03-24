import { useMemo, useState } from "react";
import LayoutShell from "./components/LayoutShell";
import LandingBuilder from "./pages/LandingBuilder";
import SiteManager from "./pages/SiteManager";
import ScraperControl from "./pages/ScraperControl";

function App() {
  const [activeKey, setActiveKey] = useState("landing-builder");

  const renderedTool = useMemo(() => {
    if (activeKey === "site-manager") return <SiteManager />;
    if (activeKey === "g2b-scraper") return <ScraperControl />;
    return <LandingBuilder />;
  }, [activeKey]);

  return (
    <LayoutShell activeKey={activeKey} onChangeMenu={setActiveKey}>
      {renderedTool}
    </LayoutShell>
  );
}

export default App;
