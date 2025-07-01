
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ArticlePage from "./pages/ArticlePage";
import CategoryPage from "./pages/CategoryPage";
import AboutPage from "./pages/AboutPage";
import TableOfContents from "./pages/TableOfContents";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import EnhancedDashboard from "./pages/EnhancedDashboard";
import OrderPage from "./pages/OrderPage";

const queryClient = new QueryClient();

const App = () => {
  // Check for saved theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    
    if (savedTheme === "dark" || 
      (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<EnhancedDashboard />} />
              <Route path="/dashboard-old" element={<Dashboard />} />
              <Route path="/order" element={<OrderPage />} />
              <Route path="/article/:slug" element={<ArticlePage />} />
              <Route path="/category/:slug" element={<CategoryPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/table-of-contents" element={<TableOfContents />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
