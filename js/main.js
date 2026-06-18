/**
 * @fileoverview Application entry point.
 *
 * Orchestrates the SceneManager (Three.js), MoleculeBuilder (3-D objects),
 * and UIController (DOM events) into a cohesive interactive experience.
 */

import { SceneManager }    from './sceneManager.js';
import { MoleculeBuilder } from './moleculeBuilder.js';
import { UIController }    from './uiController.js';
import { GEOMETRIES, MOLECULES } from './moleculeData.js';


export class MolecularGeometryApp {

    constructor() {
        this.sceneManager    = new SceneManager('viewport');
        this.moleculeBuilder = new MoleculeBuilder(this.sceneManager);
        this.uiController    = new UIController(this);

        // Current state
        this.currentGeometry = null;
        this.currentMolecule = null;
        this.showCloud       = false;
        this.showLabels      = false;
        this.showLonePairs   = false;

        // RAF handle
        this._rafId = null;
    }

    /* ═══════════════════════════════════════════════════════════════════
       Bootstrap
       ═══════════════════════════════════════════════════════════════════ */

    init() {
        this.sceneManager.init();
        this.uiController.init();

        // Default selection
        this.selectGeometry('linear');

        // Start render loop
        this._animate();
    }

    /* ═══════════════════════════════════════════════════════════════════
       Selection Handlers
       ═══════════════════════════════════════════════════════════════════ */

    /**
     * Select a geometry type — updates the molecule list and selects
     * the first molecule of that geometry.
     * @param {string} geometryKey
     */
    selectGeometry(geometryKey) {
        if (this.currentGeometry === geometryKey) return;
        this.currentGeometry = geometryKey;

        this.uiController.setActiveGeometry(geometryKey);
        this.uiController.populateMolecules(geometryKey);

        // Auto-select first molecule
        const firstMol = GEOMETRIES[geometryKey].molecules[0];
        this.selectMolecule(firstMol);
    }

    /**
     * Select a specific molecule — rebuilds the 3-D model and updates UI.
     * @param {string} moleculeKey
     */
    selectMolecule(moleculeKey) {
        if (!MOLECULES[moleculeKey]) return;
        this.currentMolecule = moleculeKey;

        // Reset toggles
        this.showCloud    = false;
        this.showLabels   = false;
        this.showLonePairs = false;
        this.uiController.resetToggles();

        // Build 3-D model
        this.moleculeBuilder.build(MOLECULES[moleculeKey], {
            showCloud:    this.showCloud,
            showLabels:   this.showLabels,
            showLonePairs: this.showLonePairs,
        });

        // Entrance animation
        this.sceneManager.triggerEntrance();

        // Update UI
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
        // LP labels also need refreshing
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
app.init();
