// src/routes/index.tsx
import React, { useEffect, type ReactNode } from "react";
import { createBrowserRouter, useLocation } from "react-router-dom";


// Pages
import Home from "../pages/Home";
import InvoicePage from "../pages/Invoice";



/* ----------------------------------
   Scroll To Top
-----------------------------------*/
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

type PageProps = {
  children: ReactNode;
};

const PageWrapper = ({ children }: PageProps) => (
  <>
    <ScrollToTop />
    {children}
  </>
);

/* ----------------------------------
   Router Configuration
-----------------------------------*/
const router = createBrowserRouter([

  {
    path: "/",
    element: (
      <Home />
    ),
  },
  {
    path: "/invoice",
    element: (
      <InvoicePage />
    ),
  }
]);

export default router;

