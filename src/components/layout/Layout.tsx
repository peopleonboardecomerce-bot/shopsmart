import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main
        id="main-content"
        className="flex-1 w-full"
      >
        {children}
      </main>

      <Footer />
    </div>
  );
};
