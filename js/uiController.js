/**
 * @fileoverview UI Controller — bridges DOM events to the App state.
 *
 * Dynamically populates the geometry / molecule selectors, wires up
 * the toggle switches, and keeps the information card in sync with
 * the currently-selected molecule.
 */

import {
    GEOMETRIES,
    GEOMETRY_ORDER,
    MOLECULES,
    ELEMENTS,
    renderFormula,
} from './moleculeData.js';


export class UIController {

    /** @param {import('./main.js').MolecularGeometryApp} app */
    constructor(app) {
        this.app = app;

        // DOM references (cached once)
        this._geoContainer  = document.getElementById('geometry-selector');
        this._molContainer  = document.getElementById('molecule-selector');
        this._infoName      = document.getElementById('info-name');
        this._infoFormula   = document.getElementById('info-formula-display');
        this._infoGeometry  = document.getElementById('info-geometry');
        this._infoAngle     = document.getElementById('info-angle');
        this._infoBonds     = document.getElementById('info-bonds');
        this._infoLP        = document.getElementById('info-lone-pairs');
        this._infoDesc      = document.getElementById('info-description');

        this._toggleCloud   = document.getElementById('toggle-electron-cloud');
        this._toggleLabels  = document.getElementById('toggle-labels');
        this._toggleLP      = document.getElementById('toggle-lone-pairs');
    }

    /* ═══════════════════════════════════════════════════════════════════
       Initialise
       ═══════════════════════════════════════════════════════════════════ */

    init() {
        this._populateGeometries();
        this._bindToggles();
    }

    /* ─── Geometry buttons ─────────────────────────────────────────── */

    _populateGeometries() {
        this._geoContainer.innerHTML = '';

        GEOMETRY_ORDER.forEach((key) => {
            const geo = GEOMETRIES[key];
            const btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'geometry-btn';
            btn.dataset.geometry = key;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.innerHTML = `
                <span class="geo-icon" aria-hidden="true">${geo.icon}</span>
                <span class="geo-label">${geo.name}</span>
            `;
            btn.addEventListener('click', () => this.app.selectGeometry(key));
            this._geoContainer.appendChild(btn);
        });
    }

    /** Highlight the active geometry button */
    setActiveGeometry(key) {
        this._geoContainer.querySelectorAll('.geometry-btn').forEach((btn) => {
            const active = btn.dataset.geometry === key;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-checked', String(active));
        });
    }

    /* ─── Molecule buttons ─────────────────────────────────────────── */

    populateMolecules(geometryKey) {
        this._molContainer.innerHTML = '';
        const molKeys = GEOMETRIES[geometryKey].molecules;

        molKeys.forEach((key) => {
            const btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'molecule-btn';
            btn.dataset.molecule = key;
            btn.setAttribute('role', 'radio');
            btn.setAttribute('aria-checked', 'false');
            btn.innerHTML = renderFormula(key);
            btn.addEventListener('click', () => this.app.selectMolecule(key));
            this._molContainer.appendChild(btn);
        });
    }

    /** Highlight the active molecule button */
    setActiveMolecule(key) {
        this._molContainer.querySelectorAll('.molecule-btn').forEach((btn) => {
            const active = btn.dataset.molecule === key;
            btn.classList.toggle('active', active);
            btn.setAttribute('aria-checked', String(active));
        });
    }

    /* ─── Information Card ─────────────────────────────────────────── */

    updateInfoCard(moleculeKey) {
        const mol = MOLECULES[moleculeKey];
        if (!mol) return;

        const geo = GEOMETRIES[mol.geometryType];

        this._infoName.textContent    = mol.name;
        this._infoFormula.innerHTML   = renderFormula(mol.formula);
        this._infoGeometry.textContent = geo.name;
        this._infoAngle.textContent   = mol.bondAngleLabel;
        this._infoBonds.textContent   = mol.bonds.length;
        this._infoLP.textContent      = mol.lonePairDirections.length;
        this._infoDesc.textContent    = mol.description;
    }

    /* ─── Toggle Switches ──────────────────────────────────────────── */

    _bindToggles() {
        this._toggleCloud.addEventListener('change', (e) => {
            this.app.toggleElectronCloud(e.target.checked);
        });
        this._toggleLabels.addEventListener('change', (e) => {
            this.app.toggleLabels(e.target.checked);
        });
        this._toggleLP.addEventListener('change', (e) => {
            this.app.toggleLonePairs(e.target.checked);
        });
    }

    /** Reset toggle switches to unchecked (called on molecule change) */
    resetToggles() {
        this._toggleCloud.checked = false;
        this._toggleLabels.checked = false;
        this._toggleLP.checked = false;
    }
}
