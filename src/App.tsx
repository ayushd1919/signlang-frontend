import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import ASL from "./pages/ASL";
import ISL from "./pages/ISL";
import ISLStatic from "./pages/ISLStatic";
import ISLDynamic from "./pages/ISLDynamic";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/asl" element={<ASL />} />
      <Route path="/isl" element={<ISL />} />
      <Route path="/isl/static" element={<ISLStatic />} />
      <Route path="/isl/dynamic" element={<ISLDynamic />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
