import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/context";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "./pages/LoginPage";
import MainLayout from "./components/MainLayout";
import HomePage from "./pages/HomePage";
import ExplorePage from "./pages/ExplorePage";
import FavoritesPage from "./pages/FavoritesPage";
import AIPlanPage from "./pages/AIPlanPage";
import CommunityPage from "./pages/CommunityPage";
import CategoryPage from "./pages/CategoryPage";
import CatalogPage from "./pages/CatalogPage";
import CreatePage from "./pages/CreatePage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";
import LandingPage from "./pages/LandingPage";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const { isLoggedIn } = useApp();

  return (
    <Routes>
      <Route
        path="/landing"
        element={isLoggedIn ? <Navigate to="/" replace /> : <LandingPage />}
      />

      {isLoggedIn ? (
        <>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/ai-plan" element={<AIPlanPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/categoria/:slug" element={<CategoryPage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </>
      ) : (
        <Route path="*" element={<LoginPage />} />
      )}
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRoutes />
        </BrowserRouter>
        <Toaster />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
