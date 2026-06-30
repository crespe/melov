import { Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import CollectionPage from "./pages/CollectionPage";
import IdentifyPage from "./pages/IdentifyPage";
import PlantDetailPage from "./pages/PlantDetailPage";
import CompetePage from "./pages/CompetePage";
import MapPage from "./pages/MapPage";
import ProfilePage from "./pages/ProfilePage";
import { useServerSync } from "./lib/useServerSync";
import { IconLeaf } from "./components/icons";

export default function App() {
  useServerSync();
  return (
    <div className="app-shell">
      <header className="app-bar">
        <IconLeaf className="app-bar-logo" width={22} height={22} />
        <span className="app-bar-name">풀리피아</span>
      </header>
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CollectionPage />} />
          <Route path="/identify" element={<IdentifyPage />} />
          <Route path="/plant/:id" element={<PlantDetailPage />} />
          <Route path="/compete" element={<CompetePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/me" element={<ProfilePage />} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
