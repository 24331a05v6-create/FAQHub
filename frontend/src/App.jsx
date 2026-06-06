import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import { ProtectedRoute, AdminRoute } from "./components/layout/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FAQHub from "./pages/FAQHub";
import RaiseQuery from "./pages/RaiseQuery";
import CommunityHub from "./pages/CommunityHub";
import AdminDashboard from "./pages/AdminDashboard";
import ModerationDashboard from "./pages/ModerationDashboard";
import DuplicateDetection from "./pages/DuplicateDetection";
import CredentialManagement from "./pages/CredentialManagement";
import AdminFAQS from "./pages/AdminFAQS";
import AdminLayout from "./components/layout/AdminLayout";
import ChatBot from "./components/ai/ChatBot";
import Profile from "./pages/Profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0f172a] text-gray-900 dark:text-gray-100">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/faq" element={<FAQHub />} />
                  <Route
                    path="/raise-query"
                    element={
                      <ProtectedRoute>
                        <RaiseQuery />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/community-qa" element={<CommunityHub />} />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminLayout />
                      </AdminRoute>
                    }
                  >
                    <Route index element={<AdminDashboard />} />
                    <Route path="moderation" element={<ModerationDashboard />} />
                    <Route path="faqs" element={<AdminFAQS />} />
                    <Route path="duplicates" element={<DuplicateDetection />} />
                    <Route path="credentials" element={<CredentialManagement />} />
                  </Route>
                </Routes>
              </main>
              <ChatBot />
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                },
              }}
            />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
