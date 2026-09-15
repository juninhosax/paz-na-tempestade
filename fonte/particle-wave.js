// <particle-wave> — wave of particles, transparent canvas. Attrs: color (hex), opacity, gap, amount
class ParticleWave extends HTMLElement {
  connectedCallback() {
    if (this._started) return;
    this._started = true;
    this.style.display = 'block';
    this.style.position = this.style.position || 'absolute';
    this.style.inset = '0';
    this.style.width = '100%';
    this.style.height = '100%';
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%';
    this.appendChild(canvas);
    this._canvas = canvas;
    this._boot();
  }

  async _boot() {
    let THREE;
    try {
      THREE = await import('https://esm.sh/three@0.160.0');
    } catch (e) {
      this.style.background = 'radial-gradient(80% 60% at 50% 100%, rgba(217,174,74,0.18), transparent 70%)';
      return;
    }
    if (!this.isConnected) return;
    const canvas = this._canvas;
    const hex = this.getAttribute('color') || '#D9AE4A';
    const alpha = parseFloat(this.getAttribute('opacity') || '0.55');
    const gap = parseFloat(this.getAttribute('gap') || '0.3');
    const amount = parseInt(this.getAttribute('amount') || '150', 10);

    const size = () => [this.clientWidth || this.parentElement?.clientWidth || 800, this.clientHeight || this.parentElement?.clientHeight || 600];
    let [w, h] = size();
    const camera = new THREE.PerspectiveCamera(75, w / h, 0.01, 1000);
    camera.position.set(0, 6, 5);
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h, false);
    renderer.setClearColor(0x000000, 0);

    const n = amount * amount;
    const pos = new Float32Array(n * 3);
    const sc = new Float32Array(n);
    let i = 0, j = 0;
    for (let ix = 0; ix < amount; ix++) {
      for (let iy = 0; iy < amount; iy++) {
        pos[i] = ix * gap - (amount * gap) / 2;
        pos[i + 1] = 0;
        pos[i + 2] = iy * gap - (amount * gap) / 2;
        sc[j] = 1;
        i += 3; j++;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('scale', new THREE.BufferAttribute(sc, 1));

    const c = new THREE.Color(hex);
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new THREE.Vector3(c.r, c.g, c.b) },
        uAlpha: { value: alpha }
      },
      vertexShader: `
        attribute float scale;
        uniform float uTime;
        void main() {
          vec3 p = position;
          float s = scale;
          p.y += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
          p.x += (sin(p.y + uTime) * 0.5);
          s += (sin(p.x + uTime) * 0.5) + (cos(p.y + uTime) * 0.1) * 2.0;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = s * 15.0 * (1.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        uniform vec3 uColor;
        uniform float uAlpha;
        void main() { gl_FragColor = vec4(uColor, uAlpha); }`
    });

    const points = new THREE.Points(geo, material);
    scene.add(points);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
      if (!this.isConnected) return;
      if (!reduce) material.uniforms.uTime.value += 0.03;
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      this._raf = requestAnimationFrame(tick);
    };
    tick();

    const fit = () => {
      const [cw, ch] = size();
      if (!cw || !ch) return;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch, false);
    };
    this._ro = new ResizeObserver(fit);
    this._ro.observe(this);
    if (this.parentElement) this._ro.observe(this.parentElement);
    requestAnimationFrame(fit);

    this._cleanup = () => {
      cancelAnimationFrame(this._raf);
      this._ro && this._ro.disconnect();
      geo.dispose(); material.dispose(); renderer.dispose();
    };
  }

  disconnectedCallback() { this._cleanup && this._cleanup(); }
}
if (!customElements.get('particle-wave')) customElements.define('particle-wave', ParticleWave);
