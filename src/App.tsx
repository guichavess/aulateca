import React, { Suspense, lazy } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/context";
import { Toaster } from "@/components/ui/sonner";
import LoginPage from "./pages/auth/LoginPage";
import AuthCallbackPage from "./pages/auth/AuthCallbackPage";
import MainLayout from "./components/layout/MainLayout";

// Code-splitting: cada rota vira um chunk próprio, baixado sob demanda.
// Login e MainLayout ficam eager porque são o caminho crítico.
const HomePage = lazy(() => import("./pages/home/HomePage"));
const ExplorePage = lazy(() => import("./pages/home/ExplorePage"));
const FavoritesPage = lazy(() => import("./pages/profile/FavoritesPage"));
const AIPlanPage = lazy(() => import("./pages/create/AIPlanPage"));
const CommunityPage = lazy(() => import("./pages/community/CommunityPage"));
const CategoryPage = lazy(() => import("./pages/catalog/CategoryPage"));
const CatalogPage = lazy(() => import("./pages/catalog/CatalogPage"));
const CreatePage = lazy(() => import("./pages/create/CreatePage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const PrintTemplate = lazy(() => import("./pages/PrintTemplate"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminResourcesPage = lazy(() => import("./pages/admin/AdminResourcesPage"));
const AdminEnrollmentsPage = lazy(() => import("./pages/admin/AdminEnrollmentsPage"));
const AdminCatalogPage = lazy(() => import("./pages/admin/AdminCatalogPage"));
const AdminCommunityPage = lazy(() => import("./pages/admin/AdminCommunityPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));

// Defaults conservadores: o app é majoritariamente leitura e dados mudam pouco
// entre interações. Evitamos refetches automáticos em foco/reconexão para
// reduzir tráfego e jitter percebido na UI.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground text-sm">
    Carregando…
  </div>
);

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn } = useApp();

  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route
          path="/landing"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LandingPage />}
        />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
            <Route path="/template-preview" element={<PrintTemplate />} />
            <Route
              path="/admin"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="recursos" element={<AdminResourcesPage />} />
              <Route path="adesoes" element={<AdminEnrollmentsPage />} />
              <Route path="catalogo" element={<AdminCatalogPage />} />
              <Route path="comunidade" element={<AdminCommunityPage />} />
              <Route path="usuarios" element={<AdminUsersPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </>
        ) : (
          <Route path="*" element={<LoginPage />} />
        )}
      </Routes>
    </Suspense>
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
