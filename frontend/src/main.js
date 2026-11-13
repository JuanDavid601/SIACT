
import './style.css';

import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

// 1. Elementos HTML
const botonIniciar = document.getElementById('iniciar-camara');
const botonFoto = document.getElementById('tomar-foto');
const botonDetener = document.getElementById('detener-camara');

const fotoCodigo = document.getElementById('foto-codigo');
const camara = document.getElementById('camara');
const resultado = document.getElementById('resultado');

// 2. Configuración de ZXing
const pistas = new Map();

pistas.set(DecodeHintType.TRY_HARDER, true);

pistas.set(DecodeHintType.POSSIBLE_FORMATS, [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR
]);

const lector = new BrowserMultiFormatReader(pistas);

let controlesCamara = null;

// 3. Función para mostrar un código detectado
function codigoDetectado(codigo) {
  const valor = codigo.getText();

  resultado.textContent = `Código detectado: ${valor}`;

  console.log('Código leído:', valor);

  detenerEscaneo();
  
  // Más adelante conectaremos aquí la consulta al backend.
}

// 4. Escaneo en vivo
botonIniciar.addEventListener('click', async () => {
  try {
    detenerEscaneo();

    resultado.textContent = 'Iniciando cámara...';

    camara.hidden = false;
    botonIniciar.disabled = true;
    botonDetener.disabled = false;

    controlesCamara = await lector.decodeFromConstraints(
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      },
      camara,
      (codigo, error) => {
        if (codigo) {
          codigoDetectado(codigo);
        }
      }
    );

    // Intentar activar enfoque continuo cuando el dispositivo lo permita.
    const pista = camara.srcObject?.getVideoTracks()[0];

    if (pista) {
      const capacidades = pista.getCapabilities?.();

      if (capacidades?.focusMode?.includes('continuous')) {
        await pista.applyConstraints({
          advanced: [{ focusMode: 'continuous' }]
        }).catch(() => {});
      }
    }

    resultado.textContent = 'Enfoca la etiqueta del activo...';

  } catch (error) {
    console.error('Error al iniciar la cámara:', error);

    resultado.textContent =
      'No se pudo iniciar la cámara. Revisa los permisos del navegador.';

    detenerEscaneo();
  }
});

// 5. Detener cámara
function detenerEscaneo() {
  if (controlesCamara) {
    controlesCamara.stop();
    controlesCamara = null;
  }

  if (camara.srcObject) {
    camara.srcObject.getTracks().forEach(track => track.stop());
    camara.srcObject = null;
  }

  camara.hidden = true;

  botonIniciar.disabled = false;
  botonDetener.disabled = true;
}

botonDetener.addEventListener('click', () => {
  detenerEscaneo();
  resultado.textContent = 'Escaneo detenido.';
});

// 6. Abrir cámara o selector de fotografías
botonFoto.addEventListener('click', () => {
  fotoCodigo.click();
});

// 7. Procesar fotografía con ZXing
fotoCodigo.addEventListener('change', () => {
  const archivo = fotoCodigo.files[0];

  if (!archivo) return;

  detenerEscaneo();

  resultado.textContent = 'Analizando fotografía...';

  const imagen = new Image();
  const url = URL.createObjectURL(archivo);

  imagen.onload = async () => {
    try {
      const codigo = await lector.decodeFromImageElement(imagen);

      codigoDetectado(codigo);

    } catch (error) {
      console.error('Error al leer la fotografía:', error);

      resultado.textContent =
        'No se reconoció el código. Intenta tomar otra fotografía.';

    } finally {
      URL.revokeObjectURL(url);
      fotoCodigo.value = '';
    }
  };

  imagen.onerror = () => {
    resultado.textContent = 'No se pudo cargar la fotografía.';

    URL.revokeObjectURL(url);
    fotoCodigo.value = '';
  };

  imagen.src = url;
});
