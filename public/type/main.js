import * as THREE from 'three';
import { CONFIG } from './config.js';
import { vertexShader, fragmentShader } from './shaders.js';

const easings = {
  linear:        (t) => t,
  easeOutQuad:   (t) => 1 - (1 - t) ** 2,
  easeOutCubic:  (t) => 1 - (1 - t) ** 3,
  easeOutQuart:  (t) => 1 - (1 - t) ** 4,
  easeOutQuint:  (t) => 1 - (1 - t) ** 5,
  easeInOutCubic:(t) => t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2,
};
const ease = easings[CONFIG.easing] || easings.easeOutQuart;

const sourceCanvas = document.createElement('canvas');
const sourceCtx = sourceCanvas.getContext('2d');

function renderSourceCanvas(w, h) {
  sourceCanvas.width = w;
  sourceCanvas.height = h;
  sourceCtx.fillStyle = '#ffffff';
  sourceCtx.fillRect(0, 0, w, h);

  const fontSize = Math.min(w * CONFIG.fontSizeScale, CONFIG.fontSizeMax);
  sourceCtx.font = `${CONFIG.fontWeight} ${fontSize}px "${CONFIG.fontFamily}"`;
  sourceCtx.fillStyle = '#000000';
  sourceCtx.textAlign = 'center';
  sourceCtx.textBaseline = 'middle';
  sourceCtx.fillText(CONFIG.text, w / 2, h / 2);
}

async function init() {
  try { await document.fonts.load(`${CONFIG.fontWeight} 48px "${CONFIG.fontFamily}"`); } catch {}

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const gooeyWrap = document.getElementById('gooey-wrap');
  if (!gooeyWrap) {
    console.warn('type: missing #gooey-wrap — see jaddenki/type index.html');
    return;
  }
  gooeyWrap.appendChild(renderer.domElement);

  const svgBlur = document.querySelector('#goo feGaussianBlur');
  const svgMatrix = document.querySelector('#goo feColorMatrix');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let prevMouseX = mouseX, prevMouseY = mouseY;
  let offsetX = 0, offsetY = 0, velX = 0, velY = 0;
  let smoothUVX = 0.5, smoothUVY = 0.5;
  let smoothVelX = 0, smoothVelY = 0;
  let mouseInside = false;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY; mouseInside = true;
  });
  window.addEventListener('mouseleave', () => { mouseInside = false; });

  function updateMeshDrift() {
    if (!CONFIG.gooey) {
      renderer.domElement.style.transform = 'none';
      offsetX = offsetY = velX = velY = 0;
      smoothUVX = 0.5;
      smoothUVY = 0.5;
      smoothVelX = smoothVelY = 0;
      uniforms.uMouseUV.value.set(0.5, 0.5);
      uniforms.uMouseVel.value.set(0, 0);
      uniforms.uMouseSpeed.value = 0;
      return;
    }

    let targetX = 0, targetY = 0;
    if (mouseInside) {
      targetX = (mouseX - window.innerWidth / 2) * CONFIG.gooeyStrength;
      targetY = (mouseY - window.innerHeight / 2) * CONFIG.gooeyStrength;
    }
    velX += (targetX - offsetX) * CONFIG.gooeyStiffness;
    velY += (targetY - offsetY) * CONFIG.gooeyStiffness;
    velX *= CONFIG.gooeyDamping;
    velY *= CONFIG.gooeyDamping;
    offsetX += velX;
    offsetY += velY;
    renderer.domElement.style.transform = `translate(${offsetX}px, ${offsetY}px)`;

    const targetUVX = mouseInside ? mouseX / window.innerWidth : 0.5;
    const targetUVY = mouseInside ? 1.0 - mouseY / window.innerHeight : 0.5;
    smoothUVX += (targetUVX - smoothUVX) * 0.12;
    smoothUVY += (targetUVY - smoothUVY) * 0.12;
    uniforms.uMouseUV.value.set(smoothUVX, smoothUVY);

    const rawVX = mouseX - prevMouseX;
    const rawVY = mouseY - prevMouseY;
    prevMouseX = mouseX; prevMouseY = mouseY;
    smoothVelX += (rawVX - smoothVelX) * 0.15;
    smoothVelY += (rawVY - smoothVelY) * 0.15;
    const speed = Math.sqrt(smoothVelX * smoothVelX + smoothVelY * smoothVelY);
    const normSpeed = Math.min(speed / 40, 1.0);

    if (speed > 0.5) {
      uniforms.uMouseVel.value.set(
        smoothVelX / (speed * window.innerWidth),
        -smoothVelY / (speed * window.innerHeight)
      );
    } else {
      uniforms.uMouseVel.value.set(0, 0);
    }
    uniforms.uMouseSpeed.value = normSpeed;
  }

  const scene  = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, 0.1, 10);
  camera.position.z = 1;

  renderSourceCanvas(window.innerWidth, window.innerHeight);

  const texture = new THREE.CanvasTexture(sourceCanvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;

  const uniforms = {
    uTexture:         { value: texture },
    uProgress:        { value: 0.0 },
    uTime:            { value: 0.0 },
    uResolution:      { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uMaxBlockSize:    { value: CONFIG.maxBlockSize },
    uMinBlockSize:    { value: CONFIG.minBlockSize },
    uSweepSpeed:      { value: CONFIG.sweepSpeed },
    uSweepSpread:     { value: CONFIG.sweepSpread },
    uSweepOffset:     { value: CONFIG.sweepOffset },
    uJitterAmount:    { value: CONFIG.jitterAmount },
    uJitterBase:      { value: CONFIG.jitterBase },
    uJitterFPS:       { value: CONFIG.jitterFPS },
    uGooey:           { value: CONFIG.gooey ? 1.0 : 0.0 },
    uMouseUV:         { value: new THREE.Vector2(0.5, 0.5) },
    uMouseVel:        { value: new THREE.Vector2(0, 0) },
    uMouseSpeed:      { value: 0 },
    uGooeyWarp:       { value: CONFIG.gooeyWarp },
    uGooeyWarpRadius: { value: CONFIG.gooeyWarpRadius },
    uGooeySwirl:      { value: CONFIG.gooeySwirl },
  };

  function applyGooeyFilter() {
    const on = CONFIG.gooey;
    uniforms.uGooey.value = on ? 1.0 : 0.0;
    if (on && svgBlur && svgMatrix) {
      gooeyWrap.style.filter = 'url(#goo)';
      svgBlur.setAttribute('stdDeviation', String(CONFIG.gooeyBlur));
      const c = CONFIG.gooeyContrast;
      svgMatrix.setAttribute(
        'values',
        `1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${c} ${-(c / 2)}`,
      );
    } else if (on && (!svgBlur || !svgMatrix)) {
      console.warn('type: missing SVG #goo (feGaussianBlur / feColorMatrix)');
      gooeyWrap.style.filter = 'none';
    } else {
      gooeyWrap.style.filter = 'none';
      renderer.domElement.style.transform = 'none';
    }
  }
  applyGooeyFilter();

  const material = new THREE.ShaderMaterial({
    vertexShader, fragmentShader, uniforms, transparent: true,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  scene.add(quad);

  let animStart = null;
  let playing = false;

  function play() {
    animStart = performance.now();
    playing = true;
    uniforms.uProgress.value = 0.0;
  }

  function animate(now) {
    requestAnimationFrame(animate);
    uniforms.uTime.value = now * 0.001;

    if (playing && animStart !== null) {
      const rawT = Math.min((now - animStart) / CONFIG.duration, 1.0);
      uniforms.uProgress.value = ease(rawT);
      if (rawT >= 1.0) {
        playing = false;
        uniforms.uProgress.value = 1.0;
      }
    }

    updateMeshDrift();
    renderer.render(scene, camera);
  }

  requestAnimationFrame(animate);
  setTimeout(play, CONFIG.autoPlayDelay);

  window._revealPlay = play;

  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h);
    uniforms.uResolution.value.set(w, h);
    renderSourceCanvas(w, h);
    texture.needsUpdate = true;
  });
}

init();
