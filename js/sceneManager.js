/**
 * @fileoverview Three.js scene orchestration.
 *
 * Manages scene, camera, WebGL renderer, CSS2DRenderer (for label overlays),
 * OrbitControls, multi-source lighting, and a procedural studio environment map
 * that gives MeshStandardMaterial its metallic reflection quality.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js';

export class SceneManager {

    /** @param {string} viewportId — id of the parent <section> element */
    constructor(viewportId = 'viewport') {
        this.viewportEl = document.getElementById(viewportId);
        this.canvasEl   = document.getElementById('three-canvas');

        // Core Three.js objects (initialized in init())
        this.scene         = null;
        this.camera        = null;
        this.renderer      = null;
        this.labelRenderer = null;
        this.controls      = null;

        /** Group that holds the active molecule objects */
        this.moleculeGroup = null;

        // Entrance animation state
        this._targetScale = 1;
        this._animating   = false;

        // Auto-rotation
        this._autoRotate       = true;
        this._autoRotateSpeed  = 0.003;
        this._resumeTimeout    = null;
    }

    /* ───────────────────────────── bootstrap ─────────────────────────── */

    init() {
        this._createScene();
        this._createCamera();
        this._createRenderer();
        this._createLabelRenderer();
        this._createControls();
        this._createLights();
        this._createEnvironmentMap();
        this._createGroundShadow();

        this.moleculeGroup = new THREE.Group();
        this.scene.add(this.moleculeGroup);

        window.addEventListener('resize', () => this._onResize());
        this._onResize();
    }

    /* ───────────────────────── scene & background ────────────────────── */

    _createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xF6F7F9);
    }

    /* ──────────────────────────── camera ─────────────────────────────── */

    _createCamera() {
        const aspect = this.viewportEl.clientWidth / this.viewportEl.clientHeight;
        this.camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 100);
        this.camera.position.set(3.5, 2.8, 5.5);
        this.camera.lookAt(0, 0, 0);
    }

    /* ────────────────────────── WebGL renderer ───────────────────────── */

    _createRenderer() {
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvasEl,
            antialias: true,
            alpha: false,
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    /* ───────────────────── CSS2D label renderer ──────────────────────── */

    _createLabelRenderer() {
        this.labelRenderer = new CSS2DRenderer();
        const el = this.labelRenderer.domElement;
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.pointerEvents = 'none';
        el.style.overflow = 'hidden';
        this.viewportEl.appendChild(el);
    }

    /* ──────────────────────── orbit controls ─────────────────────────── */

    _createControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping  = true;
        this.controls.dampingFactor  = 0.07;
        this.controls.enablePan      = false;
        this.controls.minDistance     = 3;
        this.controls.maxDistance     = 14;
        this.controls.target.set(0, 0, 0);

        // Pause auto-rotation while the user interacts
        this.controls.addEventListener('start', () => {
            this._autoRotate = false;
            clearTimeout(this._resumeTimeout);
            // Hide the viewport hint on first interaction
            const hint = document.getElementById('viewport-hint');
            if (hint) hint.classList.add('hidden');
        });
        this.controls.addEventListener('end', () => {
            this._resumeTimeout = setTimeout(() => {
                this._autoRotate = true;
            }, 3500);
        });
    }

    /* ──────────────────────────── lighting ───────────────────────────── */

    _createLights() {
        // Soft ambient fill
        const ambient = new THREE.AmbientLight(0xffffff, 0.45);
        this.scene.add(ambient);

        // Key light — strong directional from upper-right
        const key = new THREE.DirectionalLight(0xffffff, 1.2);
        key.position.set(5, 8, 4);
        this.scene.add(key);

        // Fill light — softer from opposite side
        const fill = new THREE.DirectionalLight(0xffffff, 0.55);
        fill.position.set(-6, 4, -3);
        this.scene.add(fill);

        // Rim / back light for specular edge highlights
        const rim = new THREE.DirectionalLight(0xffffff, 0.35);
        rim.position.set(0, -2, -6);
        this.scene.add(rim);

        // Hemisphere for subtle sky/ground variation
        const hemi = new THREE.HemisphereLight(0xffffff, 0xdfe6e9, 0.3);
        this.scene.add(hemi);
    }

    /* ──────────────── procedural studio environment map ──────────────── */

    _createEnvironmentMap() {
        const canvas = document.createElement('canvas');
        canvas.width  = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Soft vertical gradient — simulates a clean studio
        const grad = ctx.createLinearGradient(0, 0, 0, 512);
        grad.addColorStop(0,    '#ffffff');
        grad.addColorStop(0.25, '#f7f7f7');
        grad.addColorStop(0.5,  '#efefef');
        grad.addColorStop(0.75, '#e4e4e4');
        grad.addColorStop(1,    '#dadada');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1024, 512);

        const texture = new THREE.CanvasTexture(canvas);
        texture.mapping = THREE.EquirectangularReflectionMapping;

        const pmrem = new THREE.PMREMGenerator(this.renderer);
        pmrem.compileEquirectangularShader();
        const envMap = pmrem.fromEquirectangular(texture).texture;
        texture.dispose();
        pmrem.dispose();

        this.scene.environment = envMap;
    }

    /* ──────────────── subtle ground shadow disc ─────────────────────── */

    _createGroundShadow() {
        const geo = new THREE.CircleGeometry(2.2, 64);
        const mat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.025,
            depthWrite: false,
        });
        const disc = new THREE.Mesh(geo, mat);
        disc.rotation.x = -Math.PI / 2;
        disc.position.y = -1.8;
        this.scene.add(disc);
    }

    /* ──────────────────── molecule group helpers ─────────────────────── */

    /** Recursively dispose geometry + materials + CSS2D elements */
    clearMolecule() {
        const group = this.moleculeGroup;
        group.traverse((child) => {
            // Remove CSS2D label DOM nodes
            if (child.isCSS2DObject && child.element?.parentNode) {
                child.element.parentNode.removeChild(child.element);
            }
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                const mats = Array.isArray(child.material) ? child.material : [child.material];
                mats.forEach((m) => m.dispose());
            }
        });
        group.clear();
    }

    /**
     * Trigger a scale-in entrance animation on the molecule group.
     */
    triggerEntrance() {
        this.moleculeGroup.scale.set(0.01, 0.01, 0.01);
        this._targetScale = 1;
        this._animating = true;
        this._autoRotate = true;
    }

    /* ──────────────────────────── resize ─────────────────────────────── */

    _onResize() {
        const w = this.viewportEl.clientWidth;
        const h = this.viewportEl.clientHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
        this.labelRenderer.setSize(w, h);
    }

    /* ─────────────────────── render (per-frame) ──────────────────────── */

    render() {
        // Orbit damping
        this.controls.update();

        // Entrance scale animation
        if (this._animating) {
            const s = this.moleculeGroup.scale.x;
            const next = s + (this._targetScale - s) * 0.1;
            if (Math.abs(next - this._targetScale) < 0.002) {
                this.moleculeGroup.scale.set(this._targetScale, this._targetScale, this._targetScale);
                this._animating = false;
            } else {
                this.moleculeGroup.scale.set(next, next, next);
            }
        }

        // Gentle auto-rotation
        if (this._autoRotate && this.moleculeGroup) {
            this.moleculeGroup.rotation.y += this._autoRotateSpeed;
        }

        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
}
