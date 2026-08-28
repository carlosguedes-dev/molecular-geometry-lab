/**
 * @fileoverview Guided Molecule Builder
 *
 * Follows VSEPR rules — users select a geometry type, a central atom,
 * and a ligand atom. The molecule is auto-generated with the correct
 * geometry, bond angles, and lone pairs. No arbitrary placement.
 */

import * as THREE from 'three';
import { ELEMENTS, GEOMETRIES, GEOMETRY_ORDER, renderFormula } from './moleculeData.js';

// ─── Standard bond visualization length ───────────────────────────────
const D = 1.5;

// ─── VSEPR Geometry Configurations ────────────────────────────────────
const cos = (deg) => Math.cos((deg * Math.PI) / 180);
const sin = (deg) => Math.sin((deg * Math.PI) / 180);

const GEOMETRY_CONFIGS = {
    linear: {
        ligandCount: 2,
        lonePairs: 0,
        angle: 180,
        positions: () => [[-D, 0, 0], [D, 0, 0]],
        lonePairDirections: [],
    },
    trigonalPlanar: {
        ligandCount: 3,
        lonePairs: 0,
        angle: 120,
        positions: () => [0, 1, 2].map((i) => [D * cos(i * 120), 0, D * sin(i * 120)]),
        lonePairDirections: [],
    },
    tetrahedral: {
        ligandCount: 4,
        lonePairs: 0,
        angle: 109.5,
        positions: () => {
            const a = D / Math.sqrt(3);
            return [[a, a, a], [a, -a, -a], [-a, a, -a], [-a, -a, a]];
        },
        lonePairDirections: [],
    },
    trigonalPyramidal: {
        ligandCount: 3,
        lonePairs: 1,
        angle: 107,
        positions: () => {
            const cosT = cos(107);
            const cosA = Math.sqrt((cosT + 0.5) / 1.5);
            const sinA = Math.sqrt(1 - cosA * cosA);
            return [0, 1, 2].map((i) => [
                D * sinA * cos(i * 120),
                -D * cosA,
                D * sinA * sin(i * 120),
            ]);
        },
        lonePairDirections: [[0, 1, 0]],
    },
    angular: {
        ligandCount: 2,
        lonePairs: 2,
        angle: 104.5,
        positions: () => {
            const half = 104.5 / 2;
            return [
                [D * sin(half), -D * cos(half), 0],
                [-D * sin(half), -D * cos(half), 0],
            ];
        },
        lonePairDirections: [[0, 0.7, 0.7], [0, 0.7, -0.7]],
    },
};

// ─── Valid elements for each role ─────────────────────────────────────
const CENTRAL_ELEMENTS = ['C', 'N', 'O', 'S', 'B', 'Be', 'Si', 'P'];
const LIGAND_ELEMENTS  = ['H', 'F', 'Cl', 'O', 'N', 'C', 'S', 'B'];


export class CustomBuilder {

    /**
     * @param {import('./sceneManager.js').SceneManager} sm
     * @param {import('./moleculeBuilder.js').MoleculeBuilder} mb
     */
    constructor(sm, mb) {
        this.sm = sm;
        this.mb = mb;  // Reuse MoleculeBuilder for rendering

        this.selectedGeometry = 'linear';
        this.centralElement   = 'C';
        this.ligandElement    = 'H';

        this._active = false;

        this._geoSelector     = document.getElementById('build-geometry-selector');
        this._centralPalette  = document.getElementById('build-central-palette');
        this._ligandPalette   = document.getElementById('build-ligand-palette');
        this._resultCard      = document.getElementById('build-result-card');
        this._resultName      = document.getElementById('build-result-name');
        this._resultFormula   = document.getElementById('build-result-formula');
        this._resultGeo       = document.getElementById('build-result-geo');
        this._resultAngle     = document.getElementById('build-result-angle');
        this._resultBonds     = document.getElementById('build-result-bonds');
        this._resultLP        = document.getElementById('build-result-lp');
    }

    /* ═══════════════════════════════════════════════════════════════════
       Lifecycle
       ═══════════════════════════════════════════════════════════════════ */

    init() {
        this._buildGeometrySelector();
        this._buildPalette(this._centralPalette, CENTRAL_ELEMENTS, 'central');
        this._buildPalette(this._ligandPalette, LIGAND_ELEMENTS, 'ligand');
    }

    activate() {
        this._active = true;
        this.sm.moleculeGroup.visible = true;
        this._generateAndRender();
    }

    deactivate() {
        this._active = false;
    }

    /* ═══════════════════════════════════════════════════════════════════
       Geometry Selector
       ═══════════════════════════════════════════════════════════════════ */

    _buildGeometrySelector() {
        this._geoSelector.innerHTML = '';

        GEOMETRY_ORDER.forEach((key) => {
            const geo = GEOMETRIES[key];
            const btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'geometry-btn' + (key === this.selectedGeometry ? ' active' : '');
            btn.dataset.geometry = key;
            btn.innerHTML = `
                <span class="geo-icon" aria-hidden="true">${geo.icon}</span>
                <span class="geo-label">${geo.name}</span>
            `;
            btn.addEventListener('click', () => {
                this.selectedGeometry = key;
                this._geoSelector.querySelectorAll('.geometry-btn').forEach((b) =>
                    b.classList.toggle('active', b.dataset.geometry === key));
                if (this._active) this._generateAndRender();
            });
            this._geoSelector.appendChild(btn);
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       Element Palettes
       ═══════════════════════════════════════════════════════════════════ */

    _buildPalette(container, elements, role) {
        container.innerHTML = '';
        const selected = role === 'central' ? this.centralElement : this.ligandElement;

        elements.forEach((key) => {
            const el  = ELEMENTS[key];
            const btn = document.createElement('button');
            btn.type      = 'button';
            btn.className = 'element-btn' + (key === selected ? ' active' : '');
            btn.dataset.element = key;

            const color = `#${new THREE.Color(el.color).getHexString()}`;
            btn.innerHTML = `
                <span class="el-dot" style="background:${color}"></span>
                <span class="el-symbol">${el.symbol}</span>
                <span class="el-name">${el.name}</span>
            `;

            btn.addEventListener('click', () => {
                if (role === 'central') {
                    this.centralElement = key;
                } else {
                    this.ligandElement = key;
                }
                container.querySelectorAll('.element-btn').forEach((b) =>
                    b.classList.toggle('active', b.dataset.element === key));
                if (this._active) this._generateAndRender();
            });

            container.appendChild(btn);
        });
    }

    /* ═══════════════════════════════════════════════════════════════════
       Molecule Generation
       ═══════════════════════════════════════════════════════════════════ */

    _generateAndRender() {
        const molData = this._buildMoleculeData();

        // Clear and rebuild using the existing MoleculeBuilder
        this.mb.build(molData, {
            showCloud:    false,
            showLabels:   false,
            showLonePairs: molData.lonePairDirections.length > 0,
        });

        this.sm.triggerEntrance();
        this._updateResult(molData);
    }

    _buildMoleculeData() {
        const config    = GEOMETRY_CONFIGS[this.selectedGeometry];
        const geoInfo   = GEOMETRIES[this.selectedGeometry];
        const positions = config.positions();

        const atoms = [
            { element: this.centralElement, position: [0, 0, 0], role: 'central' },
            ...positions.map((pos) => ({
                element: this.ligandElement,
                position: pos,
                role: 'ligand',
            })),
        ];

        const bonds = positions.map((_, i) => ({
            from: 0,
            to: i + 1,
            order: 1,
        }));

        const formula = this._computeFormula(config.ligandCount);

        return {
            name: this._computeName(geoInfo, config),
            formula,
            geometryType: this.selectedGeometry,
            bondAngle: config.angle,
            bondAngleLabel: config.ligandCount > 1 ? `${config.angle}°` : '—',
            atoms,
            bonds,
            lonePairDirections: config.lonePairDirections,
            description: `Molécula personalizada com geometria ${geoInfo.name.toLowerCase()}. ${config.lonePairs > 0 ? `Possui ${config.lonePairs} par(es) isolado(s) no átomo central.` : 'Sem pares isolados no átomo central.'}`,
        };
    }

    _computeFormula(ligandCount) {
        const central = ELEMENTS[this.centralElement].symbol;
        const ligand  = ELEMENTS[this.ligandElement].symbol;
        return `${central}${ligand}${ligandCount > 1 ? ligandCount : ''}`;
    }

    _computeName(geoInfo, config) {
        const cName = ELEMENTS[this.centralElement].name;
        const lName = ELEMENTS[this.ligandElement].name;
        const prefix = ['', '', 'Di', 'Tri', 'Tetra'][config.ligandCount] || '';
        return `${prefix}${lName.toLowerCase()} de ${cName}`;
    }

    /* ═══════════════════════════════════════════════════════════════════
       Result Card Update
       ═══════════════════════════════════════════════════════════════════ */

    _updateResult(mol) {
        const geoInfo = GEOMETRIES[mol.geometryType];

        if (this._resultName)    this._resultName.textContent    = mol.name;
        if (this._resultFormula) this._resultFormula.innerHTML   = renderFormula(mol.formula);
        if (this._resultGeo)     this._resultGeo.textContent     = geoInfo.name;
        if (this._resultAngle)   this._resultAngle.textContent   = mol.bondAngleLabel;
        if (this._resultBonds)   this._resultBonds.textContent   = mol.bonds.length;
        if (this._resultLP)      this._resultLP.textContent      = mol.lonePairDirections.length;
    }
}
