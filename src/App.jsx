import AppRoutes from "./app/AppRoutes";
import ScrollManager from "./app/ScrollManager";
import useAuthBootstrap from "./app/useAuthBootstrap";

export default function App() {
  useAuthBootstrap();

  return (
    <>
      <ScrollManager />
      <AppRoutes />
    </>
  );
}
