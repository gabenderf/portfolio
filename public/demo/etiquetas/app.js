// ==========================================================================
// Gerador de Etiquetas de Expedição - Hope Cirúrgica (versão de demonstração, dados fictícios)
// ==========================================================================

// Configuração de Acesso ao Supabase
// Vem do config.js (fora do git; modelo em config.example.js). Sem ele, roda só com o localStorage.
const etiquetasConfig = window.ETIQUETAS_CONFIG || {};
const supabaseUrl = etiquetasConfig.SUPABASE_URL;
const supabaseKey = etiquetasConfig.SUPABASE_ANON_KEY;

let supabaseClient = null;
try {
    if (supabaseUrl && supabaseKey && typeof window.supabase !== 'undefined' && window.supabase.createClient) {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey, {
            auth: { persistSession: false }
        });
    }
} catch (e) {
    console.warn('Supabase não pôde ser inicializado:', e);
}

// Chave do LocalStorage para redundância e modo offline
const LOCAL_STORAGE_CLIENTS_KEY = 'demo_etiquetas_clientes_v1';

// Cache de clientes cadastrados
let clientsCache = [];
let selectedClientId = null;

// Modo ativo da ferramenta: 'nf' (Nota Fiscal) ou 'free' (Modo Livre)
let currentMode = 'nf';
const LOCAL_STORAGE_FREE_MODE_KEY = 'demo_etiquetas_modo_livre_v1';

// ==========================================================================
// Logotipo Oficial Hope Cirúrgica em SVG Inline Vetorial Nítido
// (Inclui o símbolo H, a barra vertical divisória e o texto Hope Cirúrgica)
// ==========================================================================
const logoHopeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3937.8 1332.68" style="shape-rendering:geometricPrecision; text-rendering:geometricPrecision; image-rendering:optimizeQuality; fill-rule:evenodd; clip-rule:evenodd; width: 100%; height: 100%;">
  <defs>
    <style type="text/css">
      .fil0 {fill:#000000;}
      .fil1 {fill:#000000;}
    </style>
  </defs>
  <g id="Camada_x0020_1">
    <!-- Ícone H -->
    <path class="fil0" d="M340.45 881.47c-116.29,-12.03 -222.56,-56.14 -284.71,-140.35 -28.07,-38.09 -50.13,-74.19 -52.13,-74.19l0 541.35c0,124.31 0,132.33 58.14,120.3 318.8,-40.1 278.7,-178.44 278.7,-447.11zm-323.98 -350.59c-13.31,-60.79 -18.01,-127.54 -16.23,-196.63 -2.11,-94.84 -11.46,-182.18 69.53,-253.06 74.24,-64.96 175.24,-80.95 270.69,-80.95 1.68,0 3.05,1.37 3.05,3.05 0,45.19 -4,91.49 -6.15,136.72 -2.56,54.02 -3.97,109.13 0.62,163.06 6.96,81.75 29.85,191.54 132.76,190.4 172.82,-1.92 388.44,-26.59 527.39,99.03 54.22,49.02 88.2,97.99 102.87,150.22l0.21 0.76c10.93,32.57 17.22,74.37 20.93,119.9 7.52,92.2 4.49,199.72 8.09,276.96 0.78,16.8 1.11,35.28 -3.72,51.54 -11.26,37.98 -56.77,62.91 -88.87,81.26 -47.26,24.57 -202.76,77.47 -251.4,54.2 -0.82,-0.39 -1.38,-1.05 -1.63,-1.93 -7.61,-27.26 -6.52,-66.39 -5.59,-94.65 1.41,-42.8 4.7,-85.58 6.74,-128.37 2.67,-55.92 8.35,-170.69 -26.68,-217.03 -31.56,-39.82 -84.98,-51.42 -136.62,-53.66 -21.22,0.26 -41.98,0.61 -62.06,0.71 -39.83,1.97 -79.53,6.17 -119.35,7.9 -1.61,0.07 -3.24,0.13 -4.87,0.17 -1.63,0.05 -3.28,0.09 -4.93,0.11 -1.65,0.02 -3.31,0.04 -4.98,0.04 -1.67,0 -3.34,-0 -5.03,-0.02 -1.69,-0.02 -3.37,-0.05 -5.07,-0.08l0 0c-1.7,-0.04 -3.41,-0.09 -5.12,-0.15 -1.71,-0.06 -3.44,-0.13 -5.16,-0.21 -1.73,-0.08 -3.46,-0.17 -5.2,-0.28 -1.74,-0.1 -3.49,-0.21 -5.24,-0.34 -1.75,-0.12 -3.51,-0.26 -5.28,-0.4 -1.77,-0.14 -3.54,-0.3 -5.31,-0.46l0 0c-1.78,-0.17 -3.56,-0.34 -5.34,-0.52 -1.78,-0.19 -3.57,-0.38 -5.37,-0.59l0 0c-1.8,-0.21 -3.59,-0.42 -5.39,-0.65l0 0c-1.8,-0.23 -3.61,-0.46 -5.41,-0.71 -1.81,-0.24 -3.62,-0.5 -5.44,-0.77l-0 0c-1.81,-0.27 -3.63,-0.54 -5.45,-0.83 -1.82,-0.28 -3.65,-0.58 -5.47,-0.89 -1.83,-0.31 -3.65,-0.62 -5.48,-0.95l0 0c-1.83,-0.33 -3.66,-0.66 -5.49,-1.01l-0 0c-1.83,-0.34 -3.67,-0.7 -5.5,-1.06l0 -0c-1.83,-0.37 -3.67,-0.74 -5.5,-1.12l-0 0c-1.83,-0.39 -3.67,-0.78 -5.51,-1.18l0 0c-1.84,-0.41 -3.67,-0.82 -5.51,-1.24l0 0c-1.83,-0.43 -3.67,-0.86 -5.51,-1.3l0 0c-1.83,-0.44 -3.67,-0.89 -5.5,-1.35l0 0c-1.83,-0.46 -3.67,-0.93 -5.5,-1.41l-0 -0c-1.83,-0.48 -3.66,-0.96 -5.48,-1.46 -1.83,-0.5 -3.65,-1 -5.48,-1.52l0 0c-1.82,-0.52 -3.64,-1.04 -5.46,-1.58l0 0c-1.82,-0.54 -3.63,-1.08 -5.44,-1.63l0 -0c-1.81,-0.55 -3.62,-1.11 -5.43,-1.69l0 0c-1.8,-0.57 -3.61,-1.15 -5.4,-1.74l0 0c-1.8,-0.59 -3.59,-1.19 -5.38,-1.8l0 0c-1.79,-0.61 -3.57,-1.22 -5.35,-1.85l0 0c-1.78,-0.63 -3.56,-1.26 -5.32,-1.9l0 -0c-1.77,-0.64 -3.53,-1.29 -5.29,-1.95 -1.76,-0.66 -3.51,-1.33 -5.26,-2l0 -0c-1.74,-0.68 -3.48,-1.36 -5.22,-2.06l-0 0c-1.73,-0.7 -3.46,-1.4 -5.18,-2.11l0 -0c-1.72,-0.71 -3.43,-1.43 -5.14,-2.16l0 0c-1.7,-0.73 -3.4,-1.46 -5.09,-2.21l0 -0c-1.69,-0.74 -3.37,-1.5 -5.04,-2.26l0 -0c-1.68,-0.76 -3.34,-1.53 -5,-2.31l-0 -0c-1.66,-0.78 -3.3,-1.57 -4.94,-2.36l0 0c-1.64,-0.8 -3.27,-1.6 -4.89,-2.41l0 0c-1.62,-0.81 -3.23,-1.63 -4.83,-2.46l0 0c-1.6,-0.83 -3.19,-1.67 -4.77,-2.51l-0 0c-1.58,-0.85 -3.15,-1.7 -4.71,-2.56l0 0c-1.56,-0.86 -3.11,-1.73 -4.65,-2.61l-0 -0c-1.54,-0.87 -3.06,-1.76 -4.58,-2.65l-0 0c-1.51,-0.89 -3.02,-1.8 -4.51,-2.7l-0 0c-1.49,-0.91 -2.97,-1.82 -4.44,-2.75l-0 0c-1.47,-0.93 -2.92,-1.85 -4.36,-2.8l-0 -0c-1.44,-0.94 -2.87,-1.89 -4.29,-2.84 -1.42,-0.96 -2.82,-1.92 -4.21,-2.89l0 0c-1.39,-0.97 -2.77,-1.95 -4.13,-2.93l0 -0c-1.36,-0.98 -2.71,-1.98 -4.04,-2.98 -1.33,-1 -2.65,-2.01 -3.96,-3.02 -1.31,-1.02 -2.6,-2.04 -3.87,-3.07 -1.28,-1.03 -2.54,-2.07 -3.78,-3.11l-0 -0c-1.24,-1.04 -2.47,-2.09 -3.68,-3.15l0 0c-1.21,-1.06 -2.41,-2.13 -3.59,-3.2 -1.18,-1.07 -2.34,-2.15 -3.49,-3.24 -56.15,-53.33 -88.39,-124.35 -105.29,-203.69zm771.09 -74.46c234.59,0 308.77,180.45 336.84,210.52l-2 -663.65c-352.88,0 -334.83,178.44 -334.83,453.13z"/>
    <!-- Barra vertical divisória -->
    <polygon class="fil1" points="1326.24,5.37 1354.97,5.37 1354.97,1327.96 1326.24,1327.96 "/>
    <!-- Texto Hope Cirúrgica -->
    <path class="fil1" d="M1817.19 271.65l-200.46 0 0 159.66c0,4.07 -3.32,7.4 -7.4,7.4l-53.55 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -374.81c0,-4.07 3.32,-7.4 7.4,-7.4l53.55 0c4.07,0 7.4,3.32 7.4,7.4l0 153.78 200.46 0 0 -153.78c0,-4.07 3.32,-7.4 7.4,-7.4l53.54 0c4.07,0 7.4,3.32 7.4,7.4l0 374.81c0,4.07 -3.32,7.4 -7.4,7.4l-53.54 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -159.66zm287.43 170.28c-28.05,0 -55.13,-5.84 -79.67,-19.69 -23.26,-13.13 -41.73,-31.33 -55.22,-54.38 -14.09,-24.07 -20.29,-50.61 -20.29,-78.43 0,-27.88 6.07,-54.62 20.3,-78.73 13.52,-22.91 32,-40.91 55.25,-53.84 24.57,-13.67 51.65,-19.4 79.63,-19.4 27.92,0 54.81,5.85 79.34,19.39 23.27,12.84 41.83,30.69 55.28,53.61 14.18,24.17 20.03,51.11 20.03,78.97 0,27.8 -5.96,54.52 -20.02,78.68 -13.42,23.06 -31.96,41.1 -55.24,54.14 -24.5,13.72 -51.39,19.68 -79.38,19.68zm277.26 -34.5l0 127.77c0,4.07 -3.32,7.4 -7.4,7.4l-51.4 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -387.67c0,-4.07 3.32,-7.4 7.4,-7.4l49.26 0c4.07,0 7.4,3.32 7.4,7.4l0 25.09c7.32,-7.09 15.54,-13.18 24.63,-18.19 21.4,-11.78 44.8,-16.97 69.16,-16.97 27.29,0 53.67,5.64 77.54,19.17 22.69,12.86 40.56,30.76 53.62,53.33 14.09,24.35 19.74,51.52 19.74,79.47 0,28.02 -5.69,55.24 -19.73,79.7 -13.02,22.7 -30.87,40.73 -53.63,53.63 -23.87,13.52 -50.24,19.17 -77.54,19.17 -24.13,0 -47.07,-5.48 -68.14,-17.27 -8.6,-4.81 -16.44,-10.59 -23.52,-17.23zm340.15 -93.46c1.94,8.78 5.17,17.14 9.79,24.98 8.17,13.85 19.52,24.31 33.74,31.74 15.72,8.22 33.01,11.48 50.65,11.48 14.73,0 29.3,-2.33 42.94,-8 12.95,-5.38 24.07,-13.45 33.5,-23.84 1.48,-1.63 3.39,-2.46 5.59,-2.43 2.2,0.03 4.09,0.91 5.52,2.59l28.38 33.2c2.39,2.79 2.38,6.83 -0.01,9.62 -13.89,16.2 -31.02,28.19 -50.72,36.29 -21.24,8.73 -43.91,12.34 -66.8,12.34 -29.2,0 -57.76,-5.62 -83.58,-19.63 -23.75,-12.89 -42.81,-30.83 -56.4,-54.19 -14.06,-24.15 -20.02,-50.88 -20.02,-78.68 0,-27.68 5.74,-54.41 19.44,-78.61 12.93,-22.86 30.83,-40.92 53.64,-53.92 23.64,-13.48 49.6,-19.44 76.75,-19.44 26.98,0 53.02,5.65 76.51,19.19 22.52,12.98 39.9,31.18 52.34,54.01 13.5,24.79 18.83,52.32 18.83,80.37 0,2.65 -0.11,5.31 -0.28,7.95 -0.18,2.88 -0.46,5.76 -0.87,8.61 -0.52,3.68 -3.61,6.37 -7.32,6.37l-221.62 0zm-998.65 867.41c-28,0 -55.57,-4.45 -81.68,-14.7 -24.41,-9.59 -46.37,-23.41 -65.11,-41.76 -18.5,-18.13 -32.86,-39.32 -43.11,-63.12 -10.88,-25.24 -15.59,-52.09 -15.59,-79.5 0,-27.41 4.72,-54.26 15.59,-79.5 10.29,-23.87 24.75,-45.06 43.4,-63.15 18.87,-18.31 40.9,-32.13 65.37,-41.74 26.11,-10.25 53.68,-14.7 81.67,-14.7 28.43,0 56.37,4.64 82.81,15.26 25.2,10.12 47.09,25.28 65.15,45.59 2.63,2.96 2.46,7.47 -0.38,10.23l-34.81 33.74c-1.47,1.43 -3.25,2.13 -5.3,2.09 -2.05,-0.04 -3.8,-0.81 -5.21,-2.3 -13,-13.67 -28.14,-24.55 -45.63,-31.72 -17.39,-7.13 -35.7,-10.42 -54.49,-10.42 -19.19,0 -38.04,3.1 -55.91,10.18 -16.61,6.58 -31.59,15.95 -44.41,28.42 -12.71,12.36 -22.33,26.93 -29.12,43.31 -7.22,17.44 -10.41,35.89 -10.41,54.73 0,18.84 3.19,37.28 10.41,54.72 6.78,16.37 16.41,30.94 29.12,43.3 12.81,12.46 27.8,21.83 44.41,28.41 17.88,7.08 36.72,10.19 55.91,10.19 18.78,0 37.1,-3.29 54.49,-10.42 17.57,-7.2 32.67,-18.32 45.57,-32.19 1.41,-1.51 3.16,-2.3 5.22,-2.35 2.06,-0.06 3.86,0.65 5.34,2.08l34.81 33.73c2.85,2.76 3.02,7.26 0.38,10.23 -18.07,20.32 -39.93,35.55 -65.11,45.84 -26.57,10.86 -54.76,15.54 -83.39,15.54zm204.64 -11.69l0 -283.79c0,-4.07 3.32,-7.4 7.4,-7.4l51.4 0c4.07,0 7.4,3.32 7.4,7.4l0 283.79c0,4.07 -3.32,7.4 -7.4,7.4l-51.4 0c-4.07,0 -7.4,-3.32 -7.4,-7.4zm33.09 -331c-11.49,0 -21.78,-3.69 -30.06,-11.73 -8.06,-7.84 -12.14,-17.62 -12.14,-28.86 0,-11.4 3.94,-21.43 12.14,-29.39 8.27,-8.05 18.56,-11.73 30.06,-11.73 11.39,0 21.67,3.53 29.98,11.39 8.17,7.71 12.23,17.45 12.23,28.67 0,11.33 -3.81,21.38 -11.73,29.52 -8.22,8.45 -18.77,12.14 -30.48,12.14zm180.36 72.02c6.81,-7.26 14.78,-13.39 23.8,-18.41 21.96,-12.25 47.24,-16.46 72.14,-16.46 4.07,0 7.4,3.33 7.4,7.4l0 49.8c0,2.26 -0.9,4.2 -2.63,5.65 -1.72,1.46 -3.79,2.02 -6.02,1.64 -1.62,-0.28 -3.26,-0.43 -4.91,-0.43 -1.87,0 -3.75,0 -5.63,0 -22.7,0 -43.88,5.88 -60.04,22.4 -17.15,17.53 -21.98,42.33 -21.98,66.04l0 141.35c0,4.07 -3.32,7.4 -7.4,7.4l-51.4 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -283.79c0,-4.07 3.32,-7.4 7.4,-7.4l49.26 0c4.07,0 7.4,3.32 7.4,7.4l0 24.8zm371.24 236.42c-6.77,6.49 -14.37,12.05 -22.73,16.71 -20.47,11.41 -42.87,16.47 -66.25,16.47 -23.19,0 -46.24,-3.94 -67.22,-14.13 -20,-9.71 -35.31,-24.59 -46.07,-44.04 -12.23,-22.1 -16.19,-47.95 -16.19,-72.92l0 -163.31c0,-4.07 3.32,-7.4 7.4,-7.4l51.4 0c4.07,0 7.4,3.32 7.4,7.4l0 157.42c0,20.03 3.57,42.5 18.01,57.52 13.56,14.1 32.1,18.62 51.16,18.62 14.98,0 29.8,-2.73 43.01,-10.05 12.2,-6.76 21.2,-16.56 27.5,-29 7.44,-14.69 9.92,-31.48 9.92,-47.8l0 -146.72c0,-4.07 3.32,-7.4 7.4,-7.4l51.4 0c4.07,0 7.4,3.32 7.4,7.4l0 283.79c0,4.07 -3.32,7.4 -7.4,7.4l-48.73 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -22.56zm-122.47 -307.8l72.82 -69.6c1.43,-1.37 3.13,-2.05 5.11,-2.05l65.32 0c3.22,0 5.96,1.96 7,5 1.04,3.05 0.07,6.27 -2.47,8.24l-89.96 69.6c-1.35,1.05 -2.82,1.55 -4.53,1.55l-48.18 0c-3.09,0 -5.72,-1.78 -6.87,-4.64 -1.15,-2.87 -0.47,-5.97 1.76,-8.1zm333.24 71.38c6.81,-7.26 14.78,-13.39 23.8,-18.41 21.96,-12.25 47.24,-16.46 72.14,-16.46 4.07,0 7.4,3.33 7.4,7.4l0 49.8c0,2.26 -0.9,4.2 -2.63,5.65 -1.72,1.46 -3.79,2.02 -6.02,1.64 -1.62,-0.28 -3.26,-0.43 -4.91,-0.43 -1.87,0 -3.75,0 -5.63,0 -22.7,0 -43.88,5.88 -60.04,22.4 -17.15,17.53 -21.98,42.33 -21.98,66.04l0 141.35c0,4.07 -3.32,7.4 -7.4,7.4l-51.4 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -283.79c0,-4.07 3.32,-7.4 7.4,-7.4l49.26 0c4.07,0 7.4,3.32 7.4,7.4l0 24.81zm369.11 221.52c-7.58,6.68 -15.97,12.36 -25.12,17.02 -21.79,11.09 -45.34,16.06 -69.74,16.06 -27.03,0 -53.21,-5.43 -77.13,-18.28 -22.63,-12.16 -40.8,-29.2 -54.21,-51.11 -14.09,-23.02 -20.1,-48.73 -20.1,-75.61 0,-26.94 5.88,-52.84 20.11,-75.9 13.43,-21.76 31.63,-38.61 54.23,-50.57 23.94,-12.67 50.12,-18 77.09,-18 24.28,0 47.79,4.76 69.65,15.49 10.33,5.07 19.63,11.46 27.9,19.1l0 -24.52c0,-4.07 3.32,-7.4 7.4,-7.4l48.73 0c4.07,0 7.4,3.32 7.4,7.4l0 245.24c0,41.46 -8.38,86.05 -39.81,115.68 -30.81,29.04 -73.83,37.36 -114.84,37.36 -26.44,0 -52.56,-3.71 -77.89,-11.29 -22.68,-6.79 -44.63,-17.1 -62.48,-32.87 -2.73,-2.41 -3.31,-6.36 -1.39,-9.45l24.64 -39.61c1.19,-1.9 2.96,-3.07 5.17,-3.41 2.21,-0.34 4.25,0.25 5.95,1.72 13.49,11.67 29.47,19.88 46.28,25.63 18.79,6.43 38.26,9.51 58.11,9.51 23.56,0 51.21,-3.95 68.65,-21.4 17.16,-17.17 21.39,-43.23 21.39,-66.51l0 -4.27zm149.39 37.46l0 -283.79c0,-4.07 3.32,-7.4 7.4,-7.4l51.4 0c4.07,0 7.4,3.32 7.4,7.4l0 283.79c0,4.07 -3.32,7.4 -7.4,7.4l-51.4 0c-4.08,0 -7.4,-3.32 -7.4,-7.4zm33.09 -331c-11.5,0 -21.78,-3.69 -30.06,-11.73 -8.06,-7.84 -12.14,-17.62 -12.14,-28.86 0,-11.4 3.95,-21.43 12.14,-29.39 8.27,-8.05 18.56,-11.73 30.06,-11.73 11.38,0 21.67,3.53 29.98,11.39 8.17,7.71 12.23,17.45 12.23,28.67 0,11.33 -3.81,21.38 -11.73,29.52 -8.22,8.45 -18.77,12.14 -30.47,12.14zm247.38 341.62c-28.45,0 -55.93,-5.87 -80.95,-19.66 -23.54,-12.98 -42.41,-30.98 -56.07,-54.13 -14.23,-24.11 -20.3,-50.85 -20.3,-78.72 0,-27.88 6.07,-54.62 20.3,-78.73 13.65,-23.13 32.51,-41.06 56.11,-53.88 25.05,-13.61 52.52,-19.37 80.91,-19.37 25.1,0 49.63,4.7 72.14,16.06 21.59,10.9 38.27,27.09 49.98,48.26 1.89,3.41 0.81,7.69 -2.47,9.8l-39.08 25.17c-3.39,2.19 -7.92,1.24 -10.16,-2.11 -7.99,-11.98 -18.13,-21.86 -31.12,-28.26 -12.54,-6.19 -25.85,-9.14 -39.83,-9.14 -16.28,0 -31.92,3.37 -46.18,11.36 -13.61,7.64 -24.2,18.29 -32.02,31.8 -8.66,14.96 -11.86,31.9 -11.86,49.04 0,17.24 3.25,34.24 11.88,49.33 7.76,13.59 18.33,24.36 32,32.03 14.26,8 29.89,11.37 46.18,11.37 13.98,0 27.3,-2.96 39.83,-9.15 12.98,-6.4 23.13,-16.28 31.12,-28.25 2.22,-3.33 6.71,-4.29 10.1,-2.15l39.08 24.63c3.34,2.1 4.44,6.45 2.5,9.89 -11.81,20.97 -28.54,37.04 -49.86,48.18 -22.47,11.73 -47,16.64 -72.23,16.64zm350.81 -28.17c-5.25,4.75 -11.06,8.89 -17.31,12.47 -20.66,11.84 -44.93,15.7 -68.46,15.7 -20.02,0 -40.1,-3.11 -58.46,-11.37 -16.04,-7.21 -29.86,-17.67 -39.76,-32.32 -9.61,-14.2 -14.12,-30.11 -14.12,-47.25 0,-16.19 3.8,-31.52 11.99,-45.5 8.97,-15.32 23.25,-25.79 39.21,-32.99 21.17,-9.56 47.26,-11.89 70.24,-11.89l73.99 0 0 -2.78c0,-16.92 -4.06,-33.3 -16.69,-45.22 -13.59,-12.81 -34,-15.92 -51.95,-15.92 -16.03,0 -31.69,2.67 -46.85,7.89 -13.83,4.77 -27.1,11.46 -38.35,20.89 -1.75,1.47 -3.85,2.02 -6.1,1.6 -2.25,-0.41 -4.01,-1.69 -5.12,-3.68l-21.41 -38.55c-1.76,-3.17 -1,-7.08 1.83,-9.35 16.33,-13.15 35.22,-22.28 55.22,-28.36 21.66,-6.59 44.05,-9.69 66.68,-9.69 33.91,0 68.95,6.97 94.89,30.27 26.25,23.58 34.05,58.22 34.05,92.24l0 171.34c0,4.07 -3.32,7.4 -7.4,7.4l-48.72 0c-4.07,0 -7.4,-3.32 -7.4,-7.4l0 -17.56zm-1768.64 -769.97c16.04,0 31.35,-3.41 45.34,-11.35 13.5,-7.67 23.76,-18.5 31.15,-32.16 8.23,-15.2 11.43,-32.05 11.43,-49.22 0,-17.07 -3.05,-34.09 -11.39,-49.15 -7.47,-13.48 -17.78,-24.09 -31.18,-31.7 -13.98,-7.94 -29.31,-11.35 -45.34,-11.35 -15.92,0 -31.18,3.36 -45.04,11.33 -13.41,7.71 -23.81,18.44 -31.56,31.83 -8.65,14.96 -11.86,31.9 -11.86,49.04 0,17.23 3.37,34 11.9,49.1 7.65,13.55 17.99,24.52 31.52,32.3 13.86,7.97 29.12,11.33 45.04,11.33zm364.63 0c16.03,0 31.35,-3.41 45.33,-11.35 13.56,-7.7 23.91,-18.57 31.45,-32.22 8.37,-15.15 11.65,-31.96 11.65,-49.16 0,-17.11 -3.12,-34.09 -11.62,-49.09 -7.63,-13.47 -18.03,-24.11 -31.49,-31.76 -13.98,-7.94 -29.31,-11.35 -45.33,-11.35 -15.89,0 -30.97,3.48 -44.8,11.35 -13.46,7.64 -23.86,18.29 -31.49,31.76 -8.5,15.01 -11.62,31.99 -11.62,49.09 0,17.2 3.28,34.01 11.65,49.16 7.54,13.65 17.89,24.52 31.45,32.22 13.84,7.86 28.91,11.35 44.8,11.35zm252.51 -119.94l165.28 0c-1.6,-8.71 -4.47,-17.06 -8.78,-24.91 -7.11,-12.93 -16.91,-23.19 -29.65,-30.63 -13.54,-7.9 -28.62,-11.04 -44.19,-11.04 -15.54,0 -30.44,3.27 -43.96,11.07 -12.89,7.43 -22.75,17.78 -29.85,30.85 -4.24,7.79 -7.13,16.07 -8.86,24.67zm281.85 843.32c16.37,0 32.33,-3.11 46.83,-10.9 13.3,-7.13 23.91,-17.04 31.69,-29.96 8.17,-13.55 11.52,-28.64 11.52,-44.37 0,-15.75 -3.35,-30.82 -11.52,-44.38 -7.75,-12.87 -18.33,-22.68 -31.63,-29.65 -14.56,-7.63 -30.55,-10.67 -46.9,-10.67 -16.46,0 -32.51,3.07 -47.2,10.68 -13.39,6.94 -24.08,16.72 -31.87,29.64 -8.17,13.56 -11.53,28.63 -11.53,44.38 0,15.74 3.36,30.82 11.53,44.37 7.82,12.97 18.54,22.85 31.93,29.94 14.64,7.76 30.66,10.91 47.14,10.91zm866.97 -24.01l0 -30.8 -71.84 0c-13.01,0 -36.75,1.11 -46.82,10.79 -7.38,7.09 -11.11,15.48 -11.11,25.72 0,11.58 4.44,20.57 13.67,27.57 11.6,8.79 27.4,11.08 41.58,11.08 16.52,0 32.52,-3.34 46.83,-11.82 12.99,-7.7 22,-18.67 27.69,-32.54z"/>
  </g>
</svg>
`;

// ==========================================================================
// Utilitários de Notificação Toast
// ==========================================================================
function createToastElement() {
    if (document.getElementById('appToast')) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.id = 'appToast';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="toast-icon">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span class="toast-message">Mensagem</span>
    `;
    document.body.appendChild(toast);
}

function showToast(message, isError = false) {
    const toast = document.getElementById('appToast');
    if (!toast) return;
    
    toast.querySelector('.toast-message').textContent = message;
    const icon = toast.querySelector('.toast-icon');
    
    if (isError) {
        toast.classList.add('error');
        icon.innerHTML = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
    } else {
        toast.classList.remove('error');
        icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
    }
    
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 4000);
}

// ==========================================================================
// Funções de Formatação e Máscaras
// ==========================================================================
function formatCNPJorCPF(value) {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 11) {
        // CPF: 000.000.000-00
        return digits
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
        // CNPJ: 00.000.000/0000-00
        return digits
            .substring(0, 14)
            .replace(/^(\d{2})(\d)/, '$1.$2')
            .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
            .replace(/\.(\d{3})(\d)/, '.$1/$2')
            .replace(/(\d{4})(\d)/, '$1-$2');
    }
}

function formatCEP(cep) {
    if (!cep) return '';
    const digits = cep.replace(/\D/g, '').substring(0, 8);
    if (digits.length <= 5) return digits;
    return digits.replace(/^(\d{5})(\d{1,3})$/, '$1-$2');
}

function normalizeSearchText(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

// ==========================================================================
// Inicialização do Aplicativo
// ==========================================================================
function initApp() {
    createToastElement();
    populateDateSelectors();
    initPresetSelector();
    initClientAutocomplete();
    initLiveMasks();
    initStorageAndFetchClients();
    initNfFileImporter();
    initFreeMode();
    initModeTabs();

    // Registrar observadores nos campos do formulário para atualizar o preview em tempo real
    const fieldsToWatch = [
        'clientNome', 'clientCnpj', 'clientLogradouro', 'clientBairro', 
        'clientCidadeUf', 'clientCep', 'nfNumero', 'volQty', 
        'fabMonth', 'fabYear', 'validadeText', 'loteText',
        'customWidth', 'customHeight'
    ];
    
    fieldsToWatch.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    // Zoom Slider
    const zoomSlider = document.getElementById('previewScale');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
            const val = e.target.value;
            document.getElementById('scaleLabel').textContent = `${val}x`;
            document.documentElement.style.setProperty('--label-scale', val);
            updatePreview();
        });
    }

    // Botões de Ação
    const btnSample = document.getElementById('btnFillTestData');
    if (btnSample) btnSample.addEventListener('click', fillTestData);
    
    document.getElementById('btnGenLote').addEventListener('click', generateRandomLote);
    document.getElementById('btnClearClient').addEventListener('click', clearClientForm);
    document.getElementById('btnSaveClient').addEventListener('click', saveClient);
    document.getElementById('btnDeleteClient').addEventListener('click', deleteCurrentClient);
    document.getElementById('btnPrint').addEventListener('click', printLabels);
    
    // Gerar lote inicial padrão
    generateRandomLote();
}

// ==========================================================================
// Leitura e Extração de NF (PDF DANFE e XML)
// ==========================================================================
function initNfFileImporter() {
    const fileInput = document.getElementById('nfFileInput');
    const uploadBtn = document.getElementById('btnUploadNf');
    const fileHint = document.getElementById('fileStatusHint');
    
    if (!fileInput || !uploadBtn) return;
    
    uploadBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleNfFile(e.target.files[0]);
        }
    });
    
    // Suporte para Drag and Drop
    ['dragenter', 'dragover'].forEach(eventName => {
        document.body.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadBtn.classList.add('drag-over');
        }, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        document.body.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadBtn.classList.remove('drag-over');
        }, false);
    });
    
    document.body.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleNfFile(e.dataTransfer.files[0]);
        }
    });
}

async function handleNfFile(file) {
    const fileHint = document.getElementById('fileStatusHint');
    const fileName = file.name.toLowerCase();

    // NF arrastada enquanto o Modo Livre está aberto: volta para a aba de Nota Fiscal
    if (currentMode !== 'nf') switchMode('nf');

    if (fileHint) fileHint.textContent = `Processando ${file.name}...`;
    showToast(`Carregando arquivo: ${file.name}...`);
    
    try {
        if (fileName.endsWith('.xml')) {
            await parseNfXml(file);
        } else if (fileName.endsWith('.pdf')) {
            await parseNfPdf(file);
        } else {
            showToast('Formato não suportado. Por favor, envie um arquivo PDF ou XML.', true);
            if (fileHint) fileHint.textContent = 'Preenche automaticamente cliente, NF e volumes';
        }
    } catch (err) {
        console.error('Erro ao ler Nota Fiscal:', err);
        showToast(`Erro ao processar ${file.name}: ${err.message || 'Formato não reconhecido'}`, true);
        if (fileHint) fileHint.textContent = 'Erro na leitura do arquivo';
    }
}

// Extração de dados a partir do XML da NF-e
function parseNfXml(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const parser = new DOMParser();
                const xmlDoc = parser.parseFromString(text, 'text/xml');
                
                // Extração dos campos da NF-e
                const nNF = xmlDoc.querySelector('ide > nNF')?.textContent || '';
                const qVol = xmlDoc.querySelector('vol > qVol')?.textContent || '1';
                const dhEmi = xmlDoc.querySelector('ide > dhEmi, ide > dEmi')?.textContent || '';
                
                const xNome = xmlDoc.querySelector('dest > xNome')?.textContent || '';
                const cnpj = xmlDoc.querySelector('dest > CNPJ')?.textContent || xmlDoc.querySelector('dest > CPF')?.textContent || '';
                const xLgr = xmlDoc.querySelector('enderDest > xLgr')?.textContent || '';
                const nro = xmlDoc.querySelector('enderDest > nro')?.textContent || '';
                const xCpl = xmlDoc.querySelector('enderDest > xCpl')?.textContent || '';
                const xBairro = xmlDoc.querySelector('enderDest > xBairro')?.textContent || '';
                const xMun = xmlDoc.querySelector('enderDest > xMun')?.textContent || '';
                const uf = xmlDoc.querySelector('enderDest > UF')?.textContent || '';
                const cep = xmlDoc.querySelector('enderDest > CEP')?.textContent || '';
                
                const logradouroCompleto = [xLgr, nro, xCpl].filter(Boolean).join(', ');
                const cidadeUf = [xMun, uf].filter(Boolean).join('/');
                
                // Preenche formulário
                applyExtractedNfData({
                    nome: xNome,
                    cnpj: cnpj,
                    logradouro: logradouroCompleto,
                    bairro: xBairro,
                    cidadeUf: cidadeUf,
                    cep: cep,
                    nfNumero: nNF,
                    volQty: qVol,
                    dataEmissao: dhEmi
                }, file.name);
                
                resolve();
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ==========================================================================
// Extração de dados a partir do PDF da DANFE usando Mozilla PDF.js
// ==========================================================================
async function parseNfPdf(file) {
    if (typeof pdfjsLib === 'undefined') {
        throw new Error('Biblioteca PDF.js não carregada');
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    
    // Coleta texto de todas as linhas da primeira página da DANFE
    const page = await pdfDoc.getPage(1);
    const textContent = await page.getTextContent();
    const items = textContent.items;
    
    // 1. Agrupa itens em linhas baseadas na coordenada Y com tolerância de 3px
    const lineGroups = [];
    items.forEach(item => {
        const str = (item.str || '').trim();
        if (!str) return;
        
        const y = item.transform[5];
        const x = item.transform[4];
        const width = item.width || 0;
        
        let group = lineGroups.find(g => Math.abs(g.y - y) <= 3);
        if (!group) {
            group = { y: y, items: [] };
            lineGroups.push(group);
        }
        group.items.push({ str, x, y, width });
    });
    
    // Ordena linhas de cima para baixo (Y decrescente)
    lineGroups.sort((a, b) => b.y - a.y);
    
    // Dentro de cada linha, ordena itens da esquerda para a direita (X crescente)
    const structuredLines = lineGroups.map(g => {
        g.items.sort((a, b) => a.x - b.x);
        return {
            y: g.y,
            items: g.items,
            text: g.items.map(i => i.str).join(' ')
        };
    });
    
    const fullText = structuredLines.map(l => l.text).join('\n');
    console.log('Estrutura extraída do PDF DANFE:\n', fullText);
    
    let extracted = {
        nome: '',
        cnpj: '',
        logradouro: '',
        bairro: '',
        cidadeUf: '',
        cep: '',
        nfNumero: '',
        volQty: '1',
        dataEmissao: ''
    };
    
    // ----------------------------------------------------------------------
    // 1. NÚMERO DA NOTA FISCAL
    // ----------------------------------------------------------------------
    // Procura número após 'Nº' ou 'N°' ou 'DANFE ... Nº'
    const nfMatch = fullText.match(/N[º°o\.\s]+([0-9\.\s]{3,12})/i) ||
                    fullText.match(/NF-e[\s\S]{1,50}?N[º°o\.\s]+([0-9\.\s]{3,12})/i);
    if (nfMatch) {
        extracted.nfNumero = nfMatch[1].replace(/[^\d\.]/g, '').trim();
    }
    
    // ----------------------------------------------------------------------
    // 2. SEÇÃO DESTINATÁRIO / REMETENTE
    // ----------------------------------------------------------------------
    const destHeaderIdx = structuredLines.findIndex(l => 
        /DESTINAT[ÁA]RIO\s*\/\s*REMETENTE/i.test(l.text)
    );
    
    if (destHeaderIdx !== -1) {
        const destLines = structuredLines.slice(destHeaderIdx, destHeaderIdx + 12);
        
        // 2.1 Razão Social, CNPJ e Data de Emissão (linha de valores abaixo de NOME / RAZÃO SOCIAL)
        const nameLabelIdx = destLines.findIndex(l => /NOME\s*\/\s*RAZ[ÃA]O\s*SOCIAL/i.test(l.text));
        if (nameLabelIdx !== -1 && destLines[nameLabelIdx + 1]) {
            const valLine = destLines[nameLabelIdx + 1];
            
            // CNPJ
            const cnpjItem = valLine.items.find(i => /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2}/.test(i.str));
            if (cnpjItem) {
                extracted.cnpj = cnpjItem.str.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2}/)[0];
            }
            
            // Razão Social (itens à esquerda do CNPJ)
            const nameItems = cnpjItem 
                ? valLine.items.filter(i => i.x < cnpjItem.x - 5)
                : valLine.items.filter(i => !/\d{2}\.\d{3}\.\d{3}\/|\d{2}\/\d{2}\/\d{4}/.test(i.str));
            
            if (nameItems.length > 0) {
                extracted.nome = nameItems.map(i => i.str).join(' ').trim();
            }
            
            // Data da Emissão
            const dateItem = valLine.items.find(i => /\d{2}[\/\.-]\d{2}[\/\.-]\d{4}/.test(i.str));
            if (dateItem) {
                const dm = dateItem.str.match(/(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/);
                if (dm) extracted.dataEmissao = `${dm[3]}-${dm[2]}-${dm[1]}`;
            }
        }
        
        // 2.2 Endereço, Bairro e CEP (linha de valores abaixo de ENDEREÇO)
        const addrLabelIdx = destLines.findIndex(l => /ENDERE[ÇC]O/i.test(l.text) && /BAIRRO/i.test(l.text));
        if (addrLabelIdx !== -1 && destLines[addrLabelIdx + 1]) {
            const valLine = destLines[addrLabelIdx + 1];
            
            // CEP
            const cepItem = valLine.items.find(i => /\b\d{5}-\d{3}\b|\b\d{8}\b/.test(i.str));
            if (cepItem) {
                extracted.cep = cepItem.str.match(/\b\d{5}-\d{3}\b|\b\d{8}\b/)[0];
            }
            
            // Logradouro (itens na coluna esquerda, x < 280) e Bairro (coluna do meio, 280 <= x < CEP)
            const logrItems = valLine.items.filter(i => i.x < 280);
            const bairroItems = valLine.items.filter(i => i.x >= 280 && (!cepItem || i.x < cepItem.x - 5) && !/\d{2}\/\d{2}\/\d{4}/.test(i.str));
            
            if (logrItems.length > 0) {
                extracted.logradouro = logrItems.map(i => i.str).join(' ').trim();
            }
            if (bairroItems.length > 0) {
                extracted.bairro = bairroItems.map(i => i.str).join(' ').trim();
            }
        }
        
        // 2.3 Município e UF (linha de valores abaixo de MUNICÍPIO)
        const munLabelIdx = destLines.findIndex(l => /MUNIC[ÍI]PIO/i.test(l.text) && /UF/i.test(l.text));
        if (munLabelIdx !== -1 && destLines[munLabelIdx + 1]) {
            const valLine = destLines[munLabelIdx + 1];
            
            const cityItems = valLine.items.filter(i => i.x < 270);
            const ufItem = valLine.items.find(i => i.x >= 270 && i.x < 330 && /^[A-Z]{2}$/i.test(i.str));
            
            const cityName = cityItems.map(i => i.str).join(' ').trim();
            const ufName = ufItem ? ufItem.str.trim().toUpperCase() : '';
            
            if (cityName && ufName) {
                extracted.cidadeUf = `${cityName}/${ufName}`;
            } else if (cityName) {
                extracted.cidadeUf = cityName;
            }
        }
    }
    
    // ----------------------------------------------------------------------
    // 3. SEÇÃO TRANSPORTADOR / VOLUMES TRANSPORTADOS
    // ----------------------------------------------------------------------
    const transpHeaderIdx = structuredLines.findIndex(l => 
        /TRANSPORTADOR|VOLUMES\s+TRANSPORTADOS/i.test(l.text)
    );
    
    if (transpHeaderIdx !== -1) {
        const transpLines = structuredLines.slice(transpHeaderIdx, transpHeaderIdx + 10);
        const qLabelIdx = transpLines.findIndex(l => /QUANTIDADE/i.test(l.text));
        
        if (qLabelIdx !== -1 && transpLines[qLabelIdx + 1]) {
            const valLine = transpLines[qLabelIdx + 1];
            // Primeiro número inteiro ou item na coluna de quantidade (x < 120)
            const qItem = valLine.items.find(i => i.x < 120 && /^\d+$/.test(i.str.replace(/[^\d]/g, ''))) ||
                          valLine.items.find(i => /^\d+$/.test(i.str.trim()));
            if (qItem) {
                extracted.volQty = qItem.str.replace(/[^\d]/g, '').trim();
            }
        }
    }
    
    // ----------------------------------------------------------------------
    // 4. FALLBACKS INTELIGENTES
    // ----------------------------------------------------------------------
    // Fallback de CNPJ (se não extraiu da linha específica, pega o 2º CNPJ do documento)
    if (!extracted.cnpj) {
        const allCnpjs = fullText.match(/\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}|\d{3}\.\d{3}\.\d{3}-\d{2}/g) || [];
        if (allCnpjs.length > 1) extracted.cnpj = allCnpjs[1];
        else if (allCnpjs.length === 1) extracted.cnpj = allCnpjs[0];
    }
    
    // Fallback de CEP (se não extraiu da linha específica, pega o 2º CEP do documento)
    if (!extracted.cep) {
        const allCeps = fullText.match(/\b\d{5}-\d{3}\b|\b\d{8}\b/g) || [];
        if (allCeps.length > 1) extracted.cep = allCeps[1];
        else if (allCeps.length === 1) extracted.cep = allCeps[0];
    }
    
    // Fallback de Quantidade de Volumes
    if (!extracted.volQty || extracted.volQty === '1') {
        const qRegex = fullText.match(/QUANTIDADE[\s\S]{0,40}?\b([0-9]+)\b/i);
        if (qRegex && parseInt(qRegex[1]) > 0) {
            extracted.volQty = qRegex[1];
        }
    }
    
    // Fallback de Razão Social via Canhoto de Recebimento
    if (!extracted.nome) {
        const stubMatch = fullText.match(/DESTINAT[ÁA]RIO:\s*([^\-]+?)\s*-\s*(.+?)(?:NF-e|VALOR|$)/i);
        if (stubMatch && stubMatch[1]) {
            extracted.nome = stubMatch[1].trim();
        }
    }
    
    // Fallback de Data de Emissão
    if (!extracted.dataEmissao) {
        const dateMatch = fullText.match(/DATA\s+(?:DA\s+)?EMISS[ÃA]O[\s:]*(\d{2})[\/\.-](\d{2})[\/\.-](\d{4})/i);
        if (dateMatch) {
            extracted.dataEmissao = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
        }
    }
    
    console.log('Dados extraídos com precisão:', extracted);
    applyExtractedNfData(extracted, file.name);
}

function applyExtractedNfData(data, fileName) {
    const fileHint = document.getElementById('fileStatusHint');
    
    // Sempre gera um novo lote aleatório a cada NF carregada
    generateRandomLote();
    
    if (data.nome) document.getElementById('clientNome').value = data.nome.toUpperCase();
    if (data.cnpj) document.getElementById('clientCnpj').value = formatCNPJorCPF(data.cnpj);
    if (data.logradouro) document.getElementById('clientLogradouro').value = data.logradouro.toUpperCase();
    if (data.bairro) document.getElementById('clientBairro').value = data.bairro.toUpperCase();
    if (data.cidadeUf) document.getElementById('clientCidadeUf').value = data.cidadeUf.toUpperCase();
    if (data.cep) document.getElementById('clientCep').value = formatCEP(data.cep);
    
    if (data.nfNumero) document.getElementById('nfNumero').value = data.nfNumero;
    if (data.volQty) document.getElementById('volQty').value = Math.max(1, parseInt(data.volQty) || 1);
    
    // Mês e ano a partir da data de emissão se presente
    if (data.dataEmissao) {
        const d = new Date(data.dataEmissao);
        if (!isNaN(d.getTime())) {
            const months = [
                'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
                'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
            ];
            document.getElementById('fabMonth').value = months[d.getMonth()];
            document.getElementById('fabYear').value = String(d.getFullYear());
        }
    }
    
    // Se o CEP foi extraído mas o endereço ficou incompleto, tenta buscar via ViaCEP
    const cepClean = (data.cep || '').replace(/\D/g, '');
    if (cepClean.length === 8 && (!data.logradouro || !data.bairro || !data.cidadeUf)) {
        fetch(`https://viacep.com.br/ws/${cepClean}/json/`)
            .then(res => res.json())
            .then(viaData => {
                if (!viaData.erro) {
                    if (!document.getElementById('clientLogradouro').value) {
                        document.getElementById('clientLogradouro').value = (viaData.logradouro || '').toUpperCase();
                    }
                    if (!document.getElementById('clientBairro').value) {
                        document.getElementById('clientBairro').value = (viaData.bairro || '').toUpperCase();
                    }
                    if (!document.getElementById('clientCidadeUf').value) {
                        document.getElementById('clientCidadeUf').value = `${(viaData.localidade || '').toUpperCase()}/${(viaData.uf || '').toUpperCase()}`;
                    }
                    updatePreview();
                }
            })
            .catch(() => {});
    }
    
    selectedClientId = null;
    document.getElementById('btnDeleteClient').style.display = 'none';
    
    if (fileHint) {
        fileHint.textContent = `Arquivo carregado: ${fileName}`;
    }
    
    updatePreview();
    showToast(`Nota Fiscal ${data.nfNumero || ''} carregada com sucesso! (${data.volQty || 1} volumes)`);
}

// ==========================================================================
// Preenchimento de Dados de Exemplo (dados fictícios)
// ==========================================================================
function fillTestData() {
    document.getElementById('clientNome').value = 'CLINICA EXEMPLO SAUDE LTDA';
    document.getElementById('clientCnpj').value = '00.000.000/0001-00';
    document.getElementById('clientLogradouro').value = 'RUA DAS FLORES, 123';
    document.getElementById('clientBairro').value = 'CENTRO';
    document.getElementById('clientCidadeUf').value = 'CIDADE EXEMPLO/SP';
    document.getElementById('clientCep').value = '00000-000';
    
    document.getElementById('nfNumero').value = '000.123';
    document.getElementById('volQty').value = '40';
    document.getElementById('fabMonth').value = 'JUNHO';
    document.getElementById('fabYear').value = '2026';
    document.getElementById('validadeText').value = '5 ANOS';
    document.getElementById('loteText').value = '00000123';
    
    // Redefine para preset 60x30 padrão
    document.getElementById('labelPreset').value = '60x30';
    document.getElementById('customSizeRow').style.display = 'none';
    document.getElementById('customWidth').value = '60';
    document.getElementById('customHeight').value = '30';
    
    selectedClientId = null;
    document.getElementById('btnDeleteClient').style.display = 'none';
    
    const fileHint = document.getElementById('fileStatusHint');
    if (fileHint) fileHint.textContent = 'Modelo de exemplo carregado (dados fictícios)';
    
    updatePreview();
    showToast('Modelo de exemplo carregado!');
}

// ==========================================================================
// Máscaras e Eventos de Digitação Inteligente
// ==========================================================================
function initLiveMasks() {
    // Máscara dinâmica de CNPJ/CPF
    const cnpjInput = document.getElementById('clientCnpj');
    if (cnpjInput) {
        cnpjInput.addEventListener('input', (e) => {
            const raw = e.target.value.replace(/\D/g, '');
            e.target.value = formatCNPJorCPF(raw);
        });
    }

    // Máscara de CEP com busca automática ViaCEP
    const cepInput = document.getElementById('clientCep');
    if (cepInput) {
        cepInput.addEventListener('input', async (e) => {
            const raw = e.target.value.replace(/\D/g, '');
            e.target.value = formatCEP(raw);
            
            // Quando digitar os 8 números do CEP, consulta endereço
            if (raw.length === 8) {
                try {
                    const res = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
                    if (res.ok) {
                        const data = await res.json();
                        if (!data.erro) {
                            const logr = document.getElementById('clientLogradouro');
                            const bairro = document.getElementById('clientBairro');
                            const cidUf = document.getElementById('clientCidadeUf');
                            
                            if (logr && !logr.value.trim()) {
                                logr.value = (data.logradouro || '').toUpperCase();
                            }
                            if (bairro && !bairro.value.trim()) {
                                bairro.value = (data.bairro || '').toUpperCase();
                            }
                            if (cidUf && !cidUf.value.trim()) {
                                cidUf.value = `${(data.localidade || '').toUpperCase()}/${(data.uf || '').toUpperCase()}`;
                            }
                            updatePreview();
                            showToast(`Endereço localizado: ${data.localidade}/${data.uf}`);
                        }
                    }
                } catch (err) {
                    // Falha silenciosa no ViaCEP se offline
                }
            }
        });
    }

    // Limitar campo FAB Ano para números de 4 dígitos
    const fabYearEl = document.getElementById('fabYear');
    if (fabYearEl) {
        fabYearEl.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
        });
    }

    // Forçar caixa alta nos inputs de texto exceto números e datas especiais
    const textInputs = document.querySelectorAll('input[type="text"]:not(#clientCnpj):not(#clientCep)');
    textInputs.forEach(input => {
        input.addEventListener('input', (e) => {
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const upper = e.target.value.toUpperCase();
            if (e.target.value !== upper) {
                e.target.value = upper;
                e.target.setSelectionRange(start, end);
            }
        });
    });
}

// Popula seletores de data (mês atual e ano)
function populateDateSelectors() {
    const yearInput = document.getElementById('fabYear');
    const currentYear = new Date().getFullYear();
    if (yearInput) {
        yearInput.value = currentYear;
    }
    
    const months = [
        'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
        'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
    ];
    const currentMonthIndex = new Date().getMonth();
    const monthSelect = document.getElementById('fabMonth');
    if (monthSelect) {
        monthSelect.value = months[currentMonthIndex];
    }
}

// Inicializa configurações de tamanho de etiqueta
function initPresetSelector() {
    const presetSelect = document.getElementById('labelPreset');
    const customRow = document.getElementById('customSizeRow');
    
    presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        if (val === 'custom') {
            customRow.style.display = 'grid';
        } else {
            customRow.style.display = 'none';
            const [w, h] = val.split('x');
            document.getElementById('customWidth').value = w;
            document.getElementById('customHeight').value = h;
        }
        updatePreview();
    });
}

// Gerador de lote aleatório com 8 dígitos
function generateRandomLote() {
    const randomLoteNum = Math.floor(10000000 + Math.random() * 90000000);
    const loteInput = document.getElementById('loteText');
    if (loteInput) {
        loteInput.value = String(randomLoteNum);
    }
    updatePreview();
}

// Limpa os campos do cliente
function clearClientForm() {
    document.getElementById('clientSearch').value = '';
    document.getElementById('clientNome').value = '';
    document.getElementById('clientCnpj').value = '';
    document.getElementById('clientLogradouro').value = '';
    document.getElementById('clientBairro').value = '';
    document.getElementById('clientCidadeUf').value = '';
    document.getElementById('clientCep').value = '';
    
    selectedClientId = null;
    document.getElementById('btnDeleteClient').style.display = 'none';
    
    updatePreview();
    showToast('Formulário de cliente limpo.');
}

// ==========================================================================
// Persistência Híbrida de Clientes (LocalStorage + Supabase)
// ==========================================================================
function initStorageAndFetchClients() {
    try {
        const localData = localStorage.getItem(LOCAL_STORAGE_CLIENTS_KEY);
        if (localData) {
            clientsCache = JSON.parse(localData);
        }
    } catch (e) {
        console.warn('Erro ao ler cache local:', e);
    }

    if (supabaseClient) {
        fetchClientsFromSupabase();
    }
}

async function fetchClientsFromSupabase() {
    try {
        const { data, error } = await supabaseClient
            .from('etiquetas_clientes')
            .select('*')
            .order('nome', { ascending: true });
            
        if (error) {
            console.warn('Aviso ao consultar Supabase (usando dados locais):', error.message);
            return;
        }
        
        if (data && Array.isArray(data) && data.length > 0) {
            clientsCache = data;
            try {
                localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clientsCache));
            } catch (e) {}
        }
    } catch (err) {
        console.warn('Executando em modo offline / LocalStorage');
    }
}

// ==========================================================================
// Busca e Autocomplete de Clientes
// ==========================================================================
function initClientAutocomplete() {
    const searchInput = document.getElementById('clientSearch');
    const dropdown = document.getElementById('clientDropdown');
    
    searchInput.addEventListener('input', () => {
        const query = normalizeSearchText(searchInput.value);
        dropdown.innerHTML = '';
        
        if (!query) {
            dropdown.style.display = 'none';
            return;
        }
        
        const filtered = clientsCache.filter(c => {
            const nomeNorm = normalizeSearchText(c.nome);
            const cnpjDigits = (c.cnpj || '').replace(/\D/g, '');
            const cidadeNorm = normalizeSearchText(c.cidade_uf);
            return nomeNorm.includes(query) || cnpjDigits.includes(query) || cidadeNorm.includes(query);
        });
        
        if (filtered.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'client-dropdown-item';
            emptyItem.style.color = 'var(--text-muted)';
            emptyItem.style.cursor = 'default';
            emptyItem.textContent = 'Nenhum cliente cadastrado com esse termo';
            dropdown.appendChild(emptyItem);
        } else {
            filtered.forEach(client => {
                const item = document.createElement('div');
                item.className = 'client-dropdown-item';
                item.innerHTML = `
                    <span class="c-name">${client.nome || 'SEM NOME'}</span>
                    <span class="c-cnpj">CNPJ/CPF: ${formatCNPJorCPF(client.cnpj || '')}</span>
                    <span class="c-city">${client.cidade_uf || ''} ${client.bairro ? '• ' + client.bairro : ''}</span>
                `;
                
                item.addEventListener('click', () => {
                    selectClient(client);
                    dropdown.style.display = 'none';
                });
                dropdown.appendChild(item);
            });
        }
        
        dropdown.style.display = 'block';
    });
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
}

function selectClient(client) {
    document.getElementById('clientSearch').value = client.nome;
    document.getElementById('clientNome').value = client.nome;
    document.getElementById('clientCnpj').value = formatCNPJorCPF(client.cnpj || '');
    document.getElementById('clientLogradouro').value = client.logradouro || '';
    document.getElementById('clientBairro').value = client.bairro || '';
    document.getElementById('clientCidadeUf').value = client.cidade_uf || '';
    document.getElementById('clientCep').value = formatCEP(client.cep || '');
    
    selectedClientId = client.id || null;
    document.getElementById('btnDeleteClient').style.display = 'inline-flex';
    
    updatePreview();
    showToast(`Cliente selecionado: ${client.nome}`);
}

// ==========================================================================
// Salvar e Excluir Cliente
// ==========================================================================
async function saveClient() {
    const nome = document.getElementById('clientNome').value.trim().toUpperCase();
    const cnpjRaw = document.getElementById('clientCnpj').value.trim();
    const logradouro = document.getElementById('clientLogradouro').value.trim().toUpperCase();
    const bairro = document.getElementById('clientBairro').value.trim().toUpperCase();
    const cidade_uf = document.getElementById('clientCidadeUf').value.trim().toUpperCase();
    const cepRaw = document.getElementById('clientCep').value.trim();
    
    const cnpj = cnpjRaw.replace(/\D/g, '');
    const cep = cepRaw.replace(/\D/g, '');

    if (!nome) {
        showToast('O Nome / Razão Social é obrigatório.', true);
        document.getElementById('clientNome').focus();
        return;
    }

    if (!cnpj) {
        showToast('O CNPJ / CPF é obrigatório.', true);
        document.getElementById('clientCnpj').focus();
        return;
    }

    const clientData = {
        id: selectedClientId || `client_${Date.now()}`,
        nome,
        cnpj,
        logradouro,
        bairro,
        cidade_uf,
        cep,
        updated_at: new Date().toISOString()
    };

    // Salva no Cache Local / LocalStorage
    const existingIndex = clientsCache.findIndex(c => 
        (selectedClientId && c.id === selectedClientId) || 
        (c.cnpj && c.cnpj.replace(/\D/g, '') === cnpj)
    );

    if (existingIndex >= 0) {
        clientData.id = clientsCache[existingIndex].id || clientData.id;
        clientsCache[existingIndex] = clientData;
    } else {
        clientsCache.push(clientData);
    }

    try {
        localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clientsCache));
    } catch (e) {}

    selectedClientId = clientData.id;
    document.getElementById('btnDeleteClient').style.display = 'inline-flex';

    // Sincroniza com Supabase se disponível
    if (supabaseClient) {
        try {
            const dbPayload = {
                nome: clientData.nome,
                cnpj: clientData.cnpj,
                logradouro: clientData.logradouro,
                bairro: clientData.bairro,
                cidade_uf: clientData.cidade_uf,
                cep: clientData.cep
            };
            
            await supabaseClient
                .from('etiquetas_clientes')
                .upsert(dbPayload, { onConflict: 'cnpj' });
        } catch (err) {
            console.warn('Não foi possível sincronizar com o Supabase no momento:', err);
        }
    }

    showToast('Cliente salvo com sucesso!');
}

async function deleteCurrentClient() {
    if (!selectedClientId) return;
    
    const clientNome = document.getElementById('clientNome').value;
    if (!confirm(`Deseja realmente excluir o cliente "${clientNome}" do cadastro?`)) {
        return;
    }

    const cnpjRaw = document.getElementById('clientCnpj').value.replace(/\D/g, '');
    clientsCache = clientsCache.filter(c => c.id !== selectedClientId && c.cnpj !== cnpjRaw);
    
    try {
        localStorage.setItem(LOCAL_STORAGE_CLIENTS_KEY, JSON.stringify(clientsCache));
    } catch (e) {}

    if (supabaseClient) {
        try {
            if (cnpjRaw) {
                await supabaseClient.from('etiquetas_clientes').delete().eq('cnpj', cnpjRaw);
            }
        } catch (err) {
            console.warn('Erro ao remover no Supabase:', err);
        }
    }

    clearClientForm();
    showToast('Cliente excluído com sucesso.');
}

// ==========================================================================
// Ajuste Dinâmico e Automático de Tipografia (Auto-Fit sem Cortes ou Reticências)
// ==========================================================================
function fitElementToContainer(element, printElement, defaultEm, minEm = 0.48) {
    if (!element) return;
    
    // Reseta inicialmente para o tamanho padrão em em
    element.style.fontSize = `${defaultEm}em`;
    if (printElement) printElement.style.fontSize = `${defaultEm}em`;
    
    const clientWidth = element.clientWidth;
    const scrollWidth = element.scrollWidth;
    
    if (clientWidth > 0 && scrollWidth > clientWidth) {
        // Redução proporcional com margem de segurança de 2%
        const scaleFactor = (clientWidth / scrollWidth) * 0.98;
        const newEm = Math.max(minEm, defaultEm * scaleFactor);
        
        element.style.fontSize = `${newEm.toFixed(3)}em`;
        if (printElement) printElement.style.fontSize = `${newEm.toFixed(3)}em`;
    }
}

function autoFitCardTypography(previewCard, printCard) {
    if (!previewCard) return;

    // 1. Título da NF (caso o número seja muito extenso)
    const previewNf = previewCard.querySelector('.label-nf-title');
    const printNf = printCard ? printCard.querySelector('.label-nf-title') : null;
    fitElementToContainer(previewNf, printNf, 1.68, 1.0);

    // 2. Razão Social / Destinatário (ajuste para caber em no máximo 2 linhas sem empurrar o rodapé)
    const previewName = previewCard.querySelector('.label-client-name');
    const printName = printCard ? printCard.querySelector('.label-client-name') : null;
    if (previewName) {
        let nameEm = 0.94;
        previewName.style.fontSize = `${nameEm}em`;
        if (printName) printName.style.fontSize = `${nameEm}em`;

        const textLen = (previewName.textContent || '').trim().length;
        if (textLen > 65) {
            nameEm = 0.68;
        } else if (textLen > 50) {
            nameEm = 0.74;
        } else if (textLen > 38) {
            nameEm = 0.82;
        } else if (textLen > 28) {
            nameEm = 0.88;
        }
        previewName.style.fontSize = `${nameEm}em`;
        if (printName) printName.style.fontSize = `${nameEm}em`;

        // Refinamento baseado na altura real renderizada no preview
        const computedFont = parseFloat(window.getComputedStyle(previewName).fontSize) || 14;
        const maxAllowedHeight = computedFont * 2.35;
        while (previewName.clientHeight > maxAllowedHeight && nameEm > 0.58) {
            nameEm -= 0.03;
            previewName.style.fontSize = `${nameEm.toFixed(3)}em`;
            if (printName) printName.style.fontSize = `${nameEm.toFixed(3)}em`;
        }
    }

    // 3. Logradouro / Endereço Completo
    const previewStreet = previewCard.querySelector('.label-address-street');
    const printStreet = printCard ? printCard.querySelector('.label-address-street') : null;
    fitElementToContainer(previewStreet, printStreet, 0.74, 0.48);

    // 4. Bairro
    const previewNeigh = previewCard.querySelector('.label-address-neighborhood');
    const printNeigh = printCard ? printCard.querySelector('.label-address-neighborhood') : null;
    fitElementToContainer(previewNeigh, printNeigh, 0.74, 0.48);

    // 5. Cidade / UF (Garante que cidades longas não fiquem com reticências '...')
    const previewCity = previewCard.querySelector('.label-city-line');
    const printCity = printCard ? printCard.querySelector('.label-city-line') : null;
    fitElementToContainer(previewCity, printCity, 0.74, 0.48);

    // 6. Datas e Validade
    const previewDates = previewCard.querySelector('.label-dates-text');
    const printDates = printCard ? printCard.querySelector('.label-dates-text') : null;
    fitElementToContainer(previewDates, printDates, 0.88, 0.58);

    // 7. Lote
    const previewLote = previewCard.querySelector('.label-lote-text');
    const printLote = printCard ? printCard.querySelector('.label-lote-text') : null;
    fitElementToContainer(previewLote, printLote, 0.92, 0.65);
}

// ==========================================================================
// Renderização do Preview e do Recipiente de Impressão Térmica Maximizado
// ==========================================================================
function updatePreview() {
    if (currentMode === 'free') {
        renderFreeLabels();
        return;
    }

    const canvas = document.getElementById('labelsCanvas');
    const printSection = document.getElementById('print-section');
    
    // Dados do destinatário
    const name = document.getElementById('clientNome').value.trim().toUpperCase();
    const cnpj = formatCNPJorCPF(document.getElementById('clientCnpj').value.trim());
    const logradouro = document.getElementById('clientLogradouro').value.trim().toUpperCase();
    const bairro = document.getElementById('clientBairro').value.trim().toUpperCase();
    const cidade_uf = document.getElementById('clientCidadeUf').value.trim().toUpperCase();
    const cep = formatCEP(document.getElementById('clientCep').value.trim());
    
    // Dados do volume e rastreio
    const nf = document.getElementById('nfNumero').value.trim().toUpperCase();
    const qty = Math.max(1, parseInt(document.getElementById('volQty').value) || 1);
    const fabMonth = document.getElementById('fabMonth').value;
    const fabYear = document.getElementById('fabYear').value || new Date().getFullYear();
    const validade = document.getElementById('validadeText').value.trim().toUpperCase();
    const lote = document.getElementById('loteText').value.trim().toUpperCase();
    
    // Dimensões configuradas
    const width = parseFloat(document.getElementById('customWidth').value) || 60;
    const height = parseFloat(document.getElementById('customHeight').value) || 30;
    const scale = parseFloat(document.getElementById('previewScale').value) || 6;

    // Atualiza badge de dimensões
    const badge = document.getElementById('labelDimensionsBadge');
    if (badge) {
        badge.textContent = `${width} × ${height} mm`;
    }

    // Cálculo proporcional maximizado de tamanho de visualização
    const previewW = width * scale;
    const previewH = height * scale;
    // Tamanho maximizado da tipografia mantendo margem de segurança de ~1.5mm
    const baseFontSize = (previewW / 60) * 2.75;

    document.documentElement.style.setProperty('--label-w', String(width));
    document.documentElement.style.setProperty('--label-h', String(height));
    document.documentElement.style.setProperty('--label-w-px', `${previewW}px`);
    document.documentElement.style.setProperty('--label-h-px', `${previewH}px`);
    document.documentElement.style.setProperty('--label-font-size-px', `${baseFontSize}px`);

    // Validação de estado vazio
    if (!name && !cnpj) {
        canvas.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="9" y1="15" x2="15" y2="15"></line>
                    <line x1="9" y1="11" x2="15" y2="11"></line>
                </svg>
                <p>Preencha os dados do cliente à esquerda ou clique em <strong>"Carregar NF (PDF ou XML)"</strong> para gerar a visualização das etiquetas.</p>
            </div>
        `;
        printSection.innerHTML = '';
        return;
    }

    // Limpa recipientes
    canvas.innerHTML = '';
    printSection.innerHTML = '';

    // Geração sequencial de volumes (01/40, 02/40...)
    for (let i = 1; i <= qty; i++) {
        const currentVol = String(i).padStart(2, '0');
        const totalVols = String(qty).padStart(2, '0');
        
        // Estrutura HTML maximizada idêntica à referência oficial (image1.png)
        const labelHtml = `
            <div class="label-header">
                <div class="label-logo-container">
                    ${logoHopeSvg}
                </div>
                <div class="label-nf-container">
                    <div class="label-nf-title">NF ${nf || '-----'}</div>
                    <div class="label-vol-value">Volume &nbsp; <strong>${currentVol}/${totalVols}</strong></div>
                </div>
            </div>
            
            <div class="label-body">
                <div class="label-client-name">${name || 'DESTINATÁRIO NÃO INFORMADO'}</div>
                <div class="label-client-cnpj">
                    <strong>CNPJ</strong> &nbsp; ${cnpj || '--.---.---/----.--'}
                </div>
                <div class="label-address-details">
                    <div class="label-address-line label-address-street">${logradouro || '----------------------------------------'}</div>
                    <div class="label-address-line label-address-neighborhood">${bairro || '--------------------'}</div>
                    <div class="label-bottom-grid">
                        <div class="label-bottom-left">
                            <div class="label-address-line label-city-line">${cidade_uf || 'CIDADE/UF'}</div>
                            <div class="label-address-line label-cep-line">${cep || '00000-000'}</div>
                        </div>
                        <div class="label-bottom-right">
                            <div class="label-lote-text">LOTE ${lote || '--------'}</div>
                            <div class="label-dates-text">FAB.: ${fabMonth}/${fabYear} &nbsp; VALIDADE: ${validade}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Elemento de Preview em tela
        const previewCard = document.createElement('div');
        previewCard.className = 'label-card';
        previewCard.innerHTML = labelHtml;
        canvas.appendChild(previewCard);
        
        // Elemento para Impressão Térmica Real
        const printCard = document.createElement('div');
        printCard.className = 'print-label-card';
        printCard.style.width = `${width}mm`;
        printCard.style.height = `${height}mm`;
        printCard.style.fontSize = `${(width / 60) * 2.75 * 0.95}mm`;
        printCard.innerHTML = labelHtml;
        printSection.appendChild(printCard);

        // Aplica ajuste dinâmico de fonte para garantir que nada seja cortado ou truncado
        autoFitCardTypography(previewCard, printCard);
    }
}

// ==========================================================================
// Abas de Modo (Nota Fiscal / Modo Livre)
// ==========================================================================
function initModeTabs() {
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.addEventListener('click', () => switchMode(tab.dataset.mode));
    });

    const saved = loadFreeModeState();
    if (saved && saved.mode === 'free') switchMode('free');
}

function switchMode(mode) {
    currentMode = mode === 'free' ? 'free' : 'nf';

    document.querySelectorAll('.mode-tab').forEach(tab => {
        const isActive = tab.dataset.mode === currentMode;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
    });
    document.getElementById('panelNf').hidden = currentMode !== 'nf';
    document.getElementById('panelFree').hidden = currentMode !== 'free';

    saveFreeModeState();
    updatePreview();
}

// ==========================================================================
// Modo Livre: Editor de Texto Simples (negrito, itálico, alinhamento, tamanho)
// ==========================================================================
const PT_TO_MM = 25.4 / 72;
// Margem interna do Modo Livre (manter igual a .print-label-card.label-free no style.css)
const FREE_PADDING_MM = { v: 3, h: 3 };

let freeSavedRange = null;

function initFreeMode() {
    const editor = document.getElementById('freeEditor');
    if (!editor) return;

    // Restaura o último texto e configurações usados
    const saved = loadFreeModeState();
    if (saved) {
        if (typeof saved.html === 'string') editor.innerHTML = saved.html;
        if (saved.fontSize) document.getElementById('freeFontSize').value = saved.fontSize;
        if (saved.qty) document.getElementById('freeQty').value = saved.qty;
        document.getElementById('freeAutoFit').checked = !!saved.autoFit;
        if (saved.valign) setFreeVAlign(saved.valign);
        if (saved.preset) document.getElementById('freeLabelPreset').value = saved.preset;
        if (saved.width) document.getElementById('freeCustomWidth').value = saved.width;
        if (saved.height) document.getElementById('freeCustomHeight').value = saved.height;
        document.getElementById('freeCustomSizeRow').style.display = saved.preset === 'custom' ? 'grid' : 'none';
    }

    try {
        document.execCommand('styleWithCSS', false, false);
    } catch (e) { /* navegador sem suporte: usa o padrão */ }

    document.getElementById('freeFontSize').disabled = document.getElementById('freeAutoFit').checked;

    editor.addEventListener('input', onFreeChange);

    // Colar sempre como texto simples (mantém a fonte única padrão)
    editor.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
    });

    // Guarda a seleção para que os botões/menus da barra possam aplicá-la
    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (sel.rangeCount > 0 && editor.contains(sel.anchorNode)) {
            freeSavedRange = sel.getRangeAt(0).cloneRange();
            updateFreeToolbarState();
        }
    });

    // Barra de ferramentas (mousedown evita que o editor perca a seleção)
    document.querySelectorAll('#freeToolbar .tool-btn').forEach(btn => {
        btn.addEventListener('mousedown', (e) => e.preventDefault());
        btn.addEventListener('click', () => {
            restoreFreeSelection();
            document.execCommand(btn.dataset.cmd, false, null);
            onFreeChange();
            updateFreeToolbarState();
        });
    });

    const sizeSelect = document.getElementById('freeSelSize');
    sizeSelect.addEventListener('change', () => {
        applyFreeSelectionSize(sizeSelect.value);
        sizeSelect.value = '';
    });

    document.querySelectorAll('#freeVAlign button').forEach(btn => {
        btn.addEventListener('click', () => {
            setFreeVAlign(btn.dataset.valign);
            onFreeChange();
        });
    });

    ['freeFontSize', 'freeQty', 'freeCustomWidth', 'freeCustomHeight'].forEach(id => {
        const el = document.getElementById(id);
        el.addEventListener('input', onFreeChange);
        el.addEventListener('change', onFreeChange);
    });

    const autoFit = document.getElementById('freeAutoFit');
    autoFit.addEventListener('change', onFreeChange);

    const presetSelect = document.getElementById('freeLabelPreset');
    presetSelect.addEventListener('change', () => {
        const val = presetSelect.value;
        const customRow = document.getElementById('freeCustomSizeRow');
        if (val === 'custom') {
            customRow.style.display = 'grid';
        } else {
            customRow.style.display = 'none';
            const [w, h] = val.split('x');
            document.getElementById('freeCustomWidth').value = w;
            document.getElementById('freeCustomHeight').value = h;
        }
        onFreeChange();
    });

    document.getElementById('btnClearFree').addEventListener('click', () => {
        editor.innerHTML = '';
        editor.focus();
        onFreeChange();
    });

    refreshFreeEditorEmptyState();
}

function onFreeChange() {
    refreshFreeEditorEmptyState();
    saveFreeModeState();
    if (currentMode === 'free') renderFreeLabels();
}

function isFreeEditorEmpty() {
    const editor = document.getElementById('freeEditor');
    return !editor || editor.textContent.replace(/ /g, ' ').trim() === '';
}

function refreshFreeEditorEmptyState() {
    const editor = document.getElementById('freeEditor');
    if (editor) editor.classList.toggle('is-empty', isFreeEditorEmpty());
}

function restoreFreeSelection() {
    const editor = document.getElementById('freeEditor');
    editor.focus();
    if (freeSavedRange) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(freeSavedRange);
    }
}

function updateFreeToolbarState() {
    document.querySelectorAll('#freeToolbar .tool-btn').forEach(btn => {
        const cmd = btn.dataset.cmd;
        if (cmd === 'removeFormat') return;
        let active = false;
        try {
            active = document.queryCommandState(cmd);
        } catch (e) { /* comando sem estado */ }
        btn.classList.toggle('active', active);
    });
}

function setFreeVAlign(valign) {
    document.querySelectorAll('#freeVAlign button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.valign === valign);
    });
}

function getFreeVAlign() {
    const active = document.querySelector('#freeVAlign button.active');
    return active ? active.dataset.valign : 'center';
}

// Aplica um dos tamanhos ao texto selecionado. O editor gera <font size="N">,
// e o CSS converte cada N em um múltiplo do tamanho base (sem multiplicar quando aninhado)
function applyFreeSelectionSize(fontSizeStep) {
    if (!fontSizeStep) return;
    restoreFreeSelection();
    document.execCommand('fontSize', false, fontSizeStep);
    onFreeChange();
}

function getFreeLabelSize() {
    return {
        width: parseFloat(document.getElementById('freeCustomWidth').value) || 60,
        height: parseFloat(document.getElementById('freeCustomHeight').value) || 30
    };
}

function setFreeCardBaseSize(card, size) {
    card.style.fontSize = size;
    card.style.setProperty('--free-base', size);
}

// Verifica se o conteúdo cabe no cartão de preview (sem quebrar palavras no meio quando possível)
function freeContentFits(card, content) {
    const style = window.getComputedStyle(card);
    const availH = card.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    return content.scrollHeight <= availH + 0.5 && content.scrollWidth <= content.clientWidth + 0.5;
}

// Busca o maior tamanho base (pt) em que o texto ainda cabe inteiro na etiqueta
function findFreeAutoFitPt(card, content, scale) {
    content.style.overflowWrap = 'normal';
    let lo = 3;
    let hi = 300;
    for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        setFreeCardBaseSize(card, `${mid * PT_TO_MM * scale}px`);
        if (freeContentFits(card, content)) lo = mid; else hi = mid;
    }
    content.style.overflowWrap = '';
    // Margem de segurança para diferenças de renderização entre tela e impressora
    return Math.floor(lo * 0.97 * 2) / 2;
}

function renderFreeLabels() {
    const canvas = document.getElementById('labelsCanvas');
    const printSection = document.getElementById('print-section');
    const editor = document.getElementById('freeEditor');
    const warning = document.getElementById('freeOverflowWarning');
    const fontInput = document.getElementById('freeFontSize');
    const autoFit = document.getElementById('freeAutoFit').checked;

    const { width, height } = getFreeLabelSize();
    const scale = parseFloat(document.getElementById('previewScale').value) || 6;
    const qty = Math.max(1, Math.min(999, parseInt(document.getElementById('freeQty').value) || 1));
    const valign = getFreeVAlign();

    fontInput.disabled = autoFit;

    const badge = document.getElementById('labelDimensionsBadge');
    if (badge) badge.textContent = `${width} × ${height} mm`;

    document.documentElement.style.setProperty('--label-w-px', `${width * scale}px`);
    document.documentElement.style.setProperty('--label-h-px', `${height * scale}px`);

    if (isFreeEditorEmpty()) {
        canvas.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 20h9"></path>
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                <p>Digite o texto da etiqueta à esquerda para gerar a visualização no <strong>Modo Livre</strong>.</p>
            </div>
        `;
        printSection.innerHTML = '';
        warning.hidden = true;
        return;
    }

    const contentHtml = `<div class="label-free-content">${editor.innerHTML}</div>`;

    canvas.innerHTML = '';
    printSection.innerHTML = '';

    // Primeiro cartão é usado para medir o ajuste automático e o estouro de texto
    const makePreviewCard = () => {
        const card = document.createElement('div');
        card.className = 'label-card label-free';
        card.style.padding = `${FREE_PADDING_MM.v * scale}px ${FREE_PADDING_MM.h * scale}px`;
        card.style.setProperty('--free-valign', valign);
        card.innerHTML = contentHtml;
        return card;
    };

    const firstCard = makePreviewCard();
    canvas.appendChild(firstCard);
    const firstContent = firstCard.querySelector('.label-free-content');

    let basePt = parseFloat(fontInput.value) || 12;
    if (autoFit) {
        basePt = findFreeAutoFitPt(firstCard, firstContent, scale);
        fontInput.value = basePt;
    }
    const previewFontPx = `${basePt * PT_TO_MM * scale}px`;
    setFreeCardBaseSize(firstCard, previewFontPx);
    warning.hidden = freeContentFits(firstCard, firstContent);

    for (let i = 1; i <= qty; i++) {
        if (i > 1) {
            const previewCard = makePreviewCard();
            setFreeCardBaseSize(previewCard, previewFontPx);
            canvas.appendChild(previewCard);
        }

        const printCard = document.createElement('div');
        printCard.className = 'print-label-card label-free';
        printCard.style.width = `${width}mm`;
        printCard.style.height = `${height}mm`;
        setFreeCardBaseSize(printCard, `${basePt}pt`);
        printCard.style.setProperty('--free-valign', valign);
        printCard.innerHTML = contentHtml;
        printSection.appendChild(printCard);
    }
}

function loadFreeModeState() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_FREE_MODE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch (e) {
        return null;
    }
}

function saveFreeModeState() {
    const editor = document.getElementById('freeEditor');
    if (!editor) return;
    try {
        localStorage.setItem(LOCAL_STORAGE_FREE_MODE_KEY, JSON.stringify({
            mode: currentMode,
            html: editor.innerHTML,
            valign: getFreeVAlign(),
            fontSize: document.getElementById('freeFontSize').value,
            qty: document.getElementById('freeQty').value,
            autoFit: document.getElementById('freeAutoFit').checked,
            preset: document.getElementById('freeLabelPreset').value,
            width: document.getElementById('freeCustomWidth').value,
            height: document.getElementById('freeCustomHeight').value
        }));
    } catch (e) { /* armazenamento indisponível: segue sem salvar */ }
}

// ==========================================================================
// Disparo da Impressão com Calibração Térmica
// ==========================================================================
function printLabels() {
    let width, height;

    if (currentMode === 'free') {
        if (isFreeEditorEmpty()) {
            showToast('Digite o texto da etiqueta antes de imprimir.', true);
            return;
        }
        renderFreeLabels();
        ({ width, height } = getFreeLabelSize());
    } else {
        const name = document.getElementById('clientNome').value.trim();
        if (!name) {
            showToast('Preencha os dados da etiqueta antes de imprimir.', true);
            return;
        }

        width = parseFloat(document.getElementById('customWidth').value) || 60;
        height = parseFloat(document.getElementById('customHeight').value) || 30;
    }

    // Injeta regra @page com as dimensões exatas da etiqueta térmica
    let pageStyleEl = document.getElementById('print-page-style');
    if (!pageStyleEl) {
        pageStyleEl = document.createElement('style');
        pageStyleEl.id = 'print-page-style';
        document.head.appendChild(pageStyleEl);
    }
    
    pageStyleEl.innerHTML = `
        @page {
            size: ${width}mm ${height}mm;
            margin: 0mm;
        }
    `;
    
    window.print();
}

// Inicia o aplicativo quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
