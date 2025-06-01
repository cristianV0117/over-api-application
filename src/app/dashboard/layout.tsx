import Navbar from "@/components/menus/Navbar";
import Sidebar from "@/components/menus/Sidebar";
import Footer from "@/components/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Encabezado */}
      <Navbar />

      {/* Cuerpo principal: sidebar + contenido */}
      <div className="d-flex flex-grow-1">
        <Sidebar />
        <main className="flex-grow-1 p-4 bg-dark text-white">{children}</main>
      </div>

      {/* Pie de página */}
      <Footer />
    </div>
  );
}
