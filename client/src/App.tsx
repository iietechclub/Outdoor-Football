import { BrowserRouter, Route, Routes } from "react-router";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import AdminPage from "./pages/AdminPage";
import { SocketProvider } from "./context/SocketProvider";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <SocketProvider>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </SocketProvider>
      <Footer />
    </BrowserRouter>
  );
}
