/**
 * @fileoverview Application entry point v3.
 *
 * Orchestrates: cinematic loading → intro overlay → main app with
 * tab switching (Explore / Build), mobile sidebar toggle, and
 * the full render loop.
 */

import { SceneManager }    from './sceneManager.js';
import { MoleculeBuilder } from './moleculeBuilder.js';
import { UIController }    from './uiController.js';
import { CustomBuilder }   from './customBuilder.js';
import { GEOMETRIES, MOLECULES } from './moleculeData.js';


export class MolecularGeometryApp {

    constructor() {
        this.sceneManager    = new SceneManager('viewport');
        this.moleculeBuilder = new MoleculeBuilder(this.sceneManager);
        this.uiController    = new UIController(this);
        this.customBuilder   = new CustomBuilder(this.sceneManager, this.moleculeBuilder);

        this.currentGeometry = null;
        this.currentMolecule = null;
        this.showCloud       = false;
        this.showLabels      = false;
        this.showLonePairs   = false;
        this.activeTab       = 'explore';  // 'explore' | 'build'

        this._rafId = null;
    }

    /* ═══════════════════════════════════════════════════════════════════
       Bootstrap — Loading → Intro → App
       ═══════════════════════════════════════════════════════════════════ */

    start() {
        this.sceneManager.init();
        this.uiController.init();
        this.customBuilder.init();

        this.selectGeometry('linear');

        this._animate();

        // Loading screen → intro → app
        this._runLoadingSequence();

        this._bindTabs();

        // Mobile panel toggle
        this._bindMobilePanel();
    }

    /* ─── Cinematic loading sequence ───────────────────────────────── */

    _runLoadingSequence() {
        const loading  = document.getElementById('loading-screen');
        const intro    = document.getElementById('intro-overlay');
        const wrapper  = document.getElementById('app-wrapper');
        const startBtn = document.getElementById('intro-start-btn');

        setTimeout(() => {
            loading.classList.add('fade-out');

            setTimeout(() => {
                loading.style.display = 'none';
                wrapper.classList.add('visible');

                // Show intro after app is visible
                setTimeout(() => {
                    intro.style.display = '';
                }, 300);
            }, 800);
        }, 3500);

        // "Começar" button dismisses intro
        startBtn.addEventListener('click', () => {
            intro.classList.add('fade-out');
            setTimeout(() => {
                intro.style.display = 'none';
            }, 400);
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       Tab Switching
       ═══════════════════════════════════════════════════════════════════ */

    _bindTabs() {
        document.querySelectorAll('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                if (tab === this.activeTab) return;
                this.activeTab = tab;

                // Update tab button states
                document.querySelectorAll('.tab-btn').forEach((b) => {
                    const active = b.dataset.tab === tab;
                    b.classList.toggle('active', active);
                    b.setAttribute('aria-selected', String(active));
                });

                const explorePanel = document.getElementById('panel-explore');
                const buildPanel   = document.getElementById('panel-build');

                if (tab === 'explore') {
                    explorePanel.style.display = '';
                    buildPanel.style.display   = 'none';
                    this.customBuilder.deactivate();

                    // Rebuild current molecule
                    if (this.currentMolecule && MOLECULES[this.currentMolecule]) {
                        this.moleculeBuilder.build(MOLECULES[this.currentMolecule], {
                            showCloud: this.showCloud,
                            showLabels: this.showLabels,
                            showLonePairs: this.showLonePairs,
                        });
                        this.sceneManager.triggerEntrance();
                    }
                } else {
                    explorePanel.style.display = 'none';
                    buildPanel.style.display   = '';
                    this.customBuilder.activate();
                }
            });
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       Mobile Panel
       ═══════════════════════════════════════════════════════════════════ */

    _bindMobilePanel() {
        const toggle  = document.getElementById('mobile-panel-toggle');
        const panel   = document.getElementById('control-panel');
        const main    = document.getElementById('app-main');

        // Create backdrop element
        const backdrop = document.createElement('div');
        backdrop.className = 'panel-backdrop';
        main.appendChild(backdrop);

        let isOpen = false;
        const open  = () => { isOpen = true;  panel.classList.add('open');  backdrop.classList.add('visible'); };
        const close = () => { isOpen = false; panel.classList.remove('open'); backdrop.classList.remove('visible'); };

        toggle.addEventListener('click', () => isOpen ? close() : open());
        backdrop.addEventListener('click', close);

        panel.addEventListener('click', (e) => {
            if (e.target.closest('.geometry-btn') || e.target.closest('.molecule-btn')) {
                setTimeout(close, 150);
            }
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       Selection Handlers
       ═══════════════════════════════════════════════════════════════════ */

    selectGeometry(geometryKey) {
        if (this.currentGeometry === geometryKey) return;
        this.currentGeometry = geometryKey;

        this.uiController.setActiveGeometry(geometryKey);
        this.uiController.populateMolecules(geometryKey);

        const firstMol = GEOMETRIES[geometryKey].molecules[0];
        this.selectMolecule(firstMol);
    }

    selectMolecule(moleculeKey) {
        if (!MOLECULES[moleculeKey]) return;
        this.currentMolecule = moleculeKey;

        this.showCloud     = false;
        this.showLabels    = false;
        this.showLonePairs = false;
        this.uiController.resetToggles();

        this.moleculeBuilder.build(MOLECULES[moleculeKey], {
            showCloud:    this.showCloud,
            showLabels:   this.showLabels,
            showLonePairs: this.showLonePairs,
        });

        this.sceneManager.triggerEntrance();
        this.uiController.setActiveMolecule(moleculeKey);
        this.uiController.updateInfoCard(moleculeKey);
    }

    /* ═══════════════════════════════════════════════════════════════════
       Toggle Handlers
       ═══════════════════════════════════════════════════════════════════ */

    toggleElectronCloud(enabled) {
        this.showCloud = enabled;
        this.moleculeBuilder.setCloudVisible(enabled);
    }

    toggleLabels(enabled) {
        this.showLabels = enabled;
        this.moleculeBuilder.setLabelsVisible(enabled);
        this.moleculeBuilder.setLonePairsVisible(this.showLonePairs);
    }

    toggleLonePairs(enabled) {
        this.showLonePairs = enabled;
        this.moleculeBuilder.setLonePairsVisible(enabled);
    }

    /* ═══════════════════════════════════════════════════════════════════
       Render Loop
       ═══════════════════════════════════════════════════════════════════ */

    _animate() {
        this._rafId = requestAnimationFrame(() => this._animate());
        this.sceneManager.render();
    }
}


/* ── Instantiate & run ─────────────────────────────────────────────── */
const app = new MolecularGeometryApp();
app.start();
