import React, { Suspense, lazy } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AppProvider, useApp } from "@/lib/context";
import { Toaster } from "@/components/ui/sonner";
import PaidGuard from "@/components/auth/PaidGuard";
import RouteFallback from "@/components/layout/RouteFallback";
import LoginPage from "./pages/auth/LoginPage";
import MainLayout from "./components/layout/MainLayout";

// Code-splitting: cada rota vira um chunk próprio, baixado sob demanda.
// Login e MainLayout ficam eager porque são o caminho crítico.
const HomePage = lazy(() => import("./pages/home/HomePage"));
const ExplorePage = lazy(() => import("./pages/home/ExplorePage"));
const FavoritesPage = lazy(() => import("./pages/profile/FavoritesPage"));
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
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const AdminVendasPage = lazy(() => import("./pages/admin/AdminVendasPage"));
const CriarAcessoPage = lazy(() => import("./pages/auth/CriarAcessoPage"));
const RecuperarSenhaPage = lazy(() => import("./pages/auth/RecuperarSenhaPage"));
const RedefinirSenhaPage = lazy(() => import("./pages/auth/RedefinirSenhaPage"));
const AcessoEncerradoPage = lazy(() => import("./pages/access/AcessoEncerradoPage"));

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

const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useApp();
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
};

/**
 * Enquanto a sessão vier de um link de recuperação, tudo leva a
 * /redefinir-senha. A sessão PKCE já está ativa neste ponto: sem esta trava, a
 * pessoa cairia no app com a senha antiga e nunca veria o formulário.
 */
const RecoveryGate: React.FC = () => {
  const { isRecoveringPassword } = useApp();
  const { pathname } = useLocation();
  if (isRecoveringPassword && pathname !== '/redefinir-senha') {
    return <Navigate to="/redefinir-senha" replace />;
  }
  return null;
};

const AppRoutes = () => {
  const { isLoggedIn } = useApp();

  return (
    <Suspense fallback={<RouteFallback />}>
      <RecoveryGate />
      <Routes>
        {/* Faixa 1 — sempre disponíveis, com ou sem sessão.
            /redefinir-senha PRECISA estar aqui: o link de recuperação chega com
            sessão ativa, e deixá-la só na área logada a esconderia atrás do
            PaidGuard justamente para quem não consegue entrar. */}
        <Route
          path="/landing"
          element={isLoggedIn ? <Navigate to="/" replace /> : <LandingPage />}
        />
        {/* Quem já está logado não tem o que criar: é também o caminho de saída
            depois que a criação dá certo — login() liga isLoggedIn e o redirect
            leva direto ao app. */}
        <Route
          path="/criar-acesso"
          element={isLoggedIn ? <Navigate to="/" replace /> : <CriarAcessoPage />}
        />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        {isLoggedIn ? (
          <>
            {/* Faixa 2 — logado, sem acesso pago. */}
            <Route path="/acesso" element={<AcessoEncerradoPage />} />
            {/* Faixa 3 — logado e com acesso: o app. */}
            <Route
              element={
                <PaidGuard>
                  <MainLayout />
                </PaidGuard>
              }
            >
              <Route path="/" element={<HomePage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/categoria/:slug" element={<CategoryPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/create" element={<CreatePage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            <Route
              path="/template-preview"
              element={
                <PaidGuard>
                  <PrintTemplate />
                </PaidGuard>
              }
            />
            {/* O bloco /admin fica fora do PaidGuard de propósito: admin não
                compra o produto, e `has_active_access()` já devolve true para
                ele — o gate aqui é o papel, não a venda. */}
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
              <Route path="vendas" element={<AdminVendasPage />} />
              <Route path="adesoes" element={<AdminEnrollmentsPage />} />
              <Route path="catalogo" element={<AdminCatalogPage />} />
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
