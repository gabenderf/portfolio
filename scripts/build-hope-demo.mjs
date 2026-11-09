// Gera o build de demonstração do Hope SaaS e copia para public/demo/hope.
//
// Uso: npm run build:hope-demo  (espera o repositório em ../plataforma-hope/hope-saas,
// ou o caminho em HOPE_SAAS_DIR).
//
// O build sai em modo demo (dados gerados no navegador, login sem senha) e com as
// variáveis do Supabase forçadas a vazio: variáveis do processo têm prioridade sobre
// os arquivos .env*.local, então nada de URL ou chave real entra no bundle.
// Ao final, o script confere o resultado e falha se encontrar algo suspeito.
import { execSync } from "node:child_process";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = resolve(process.env.HOPE_SAAS_DIR ?? join(root, "..", "plataforma-hope", "hope-saas"));
const out = join(src, "dist-portfolio");
const dest = join(root, "public", "demo", "hope");
const BASE = "/demo/hope/";

if (!existsSync(join(src, "package.json"))) {
  console.error(`hope-saas não encontrado em ${src}. Defina HOPE_SAAS_DIR.`);
  process.exit(1);
}

const env = {
  ...process.env,
  VITE_DATA_SOURCE: "demo",
  VITE_AUTH_MODE: "demo",
  VITE_ALLOW_DEMO_IN_PRODUCTION: "true",
  VITE_SUPABASE_URL: "",
  VITE_SUPABASE_ANON_KEY: "",
  VITE_TURNSTILE_SITE_KEY: "",
};

execSync(`npx vite build --mode portfolio --base ${BASE} --outDir dist-portfolio --emptyOutDir --sourcemap false`, {
  cwd: src,
  env,
  stdio: "inherit",
});

// Conferência: nenhum sourcemap, nenhuma URL de projeto Supabase, nenhum JWT.
const suspicious = [/[a-z0-9]{15,}\.supabase\.(co|in)/i,/eyJhbGciOi[A-Za-z0-9_-]{10,}/];
function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}
for (const file of walk(out)) {
  if (file.endsWith(".map")) rmSync(file);
  else if (/\.(js|html|css|json|webmanifest)$/.test(file)) {
    const text = readFileSync(file, "utf8");
    for (const re of suspicious) {
      if (re.test(text)) {
        console.error(`Conteúdo suspeito (${re}) em ${file}. Build abortado.`);
        process.exit(1);
      }
    }
  }
}

rmSync(dest, { recursive: true, force: true });
cpSync(out, dest, { recursive: true });
rmSync(out, { recursive: true, force: true });
console.log(`Demo do Hope SaaS copiado para ${dest}`);
