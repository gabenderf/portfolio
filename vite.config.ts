import { defineConfig, type Connect, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

/**
 * O demo do Hope SaaS (public/demo/hope) é uma SPA com rotas próprias. Em dev e no preview,
 * qualquer rota dele sem extensão de arquivo devolve o index.html do demo (na Vercel, quem faz isso é o vercel.json).
 */
function hopeDemoFallback(): Plugin {
  const rewrite: Connect.NextHandleFunction = (rawReq, _res, next) => {
    const req = rawReq as { url?: string };
    const url = req.url ?? "";
    if (/^\/demo\/hope(\/[^.?]*)?(\?.*)?$/.test(url)) req.url = "/demo/hope/index.html";
    next();
  };
  return {
    name: "hope-demo-fallback",
    configureServer: (server) => void server.middlewares.use(rewrite),
    configurePreviewServer: (server) => void server.middlewares.use(rewrite),
  };
}

export default defineConfig({
  base: "/",
  plugins: [hopeDemoFallback(), react()],
});
