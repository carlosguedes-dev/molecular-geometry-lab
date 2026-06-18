/**
 * @fileoverview Builds 3-D molecule representations from data definitions.
 *
 * Creates atoms (spheres), bonds (half-coloured cylinders), electron cloud
 * auras, lone-pair lobes, and CSS2D annotation labels with angle arcs.
 * All objects are added to SceneManager.moleculeGroup and can be toggled.
 */

import * as THREE from 'three';
import { CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { ELEMENTS } from './moleculeData.js';

// ─── Material Presets ─────────────────────────────────────────────────
const BOND_COLOR         = 0xC5CAD4;  // Uniform light silver-gray for all bonds
const BOND_RADIUS        = 0.075;
const BOND_RADIUS_DOUBLE = 0.055;
const DOUBLE_BOND_OFFSET = 0.12;
const CLOUD_SCALE        = 1.8;   // cloud sphere = atom radius × this
const CLOUD_OPACITY      = 0.10;
const LP_COLOR           = 0x8B5CF6;
const LP_OPACITY         = 0.32;
const ARC_COLOR          = 0xDC2626;
const ARC_SEGMENTS       = 48;
const ARC_RADIUS         = 0.55;
const SPHERE_SEGMENTS    = 48;

// Shared geometries (pooled to reduce GC)
const _sphereGeoCache = new Map();
function getSphereGeo(radius) {
    const key = radius.toFixed(3);
    if (!_sphereGeoCache.has(key)) {
        _sphereGeoCache.set(key, new THREE.SphereGeometry(radius, SPHERE_SEGMENTS, SPHERE_SEGMENTS));
    }
    return _sphereGeoCache.get(key);
}

const _cylGeo = new THREE.CylinderGeometry(1, 1, 1, 20, 1);

// ─── Atom Texture Generation (sculpted element symbols) ───────────────
const _atomTextureCache = new Map();

/**
 * Generates a color map and bump map canvas texture for an atom sphere,
 * drawing the element symbol "engraved" onto the surface.
 */
function getAtomTextures(element) {
    if (_atomTextureCache.has(element)) return _atomTextureCache.get(element);

    const el = ELEMENTS[element];
    const baseColor = new THREE.Color(el.color);
    const SIZE = 512;

    // ── Color Map: base color + lighter symbol text ──────────────────
    const colorCanvas = document.createElement('canvas');
    colorCanvas.width = SIZE;
    colorCanvas.height = SIZE;
    const cCtx = colorCanvas.getContext('2d');

    cCtx.fillStyle = `#${baseColor.getHexString()}`;
    cCtx.fillRect(0, 0, SIZE, SIZE);

    // Symbol in a lighter, slightly desaturated shade
    const lighter = baseColor.clone();
    lighter.offsetHSL(0, -0.05, 0.18);

    const fontSize = el.symbol.length > 1 ? 155 : 195;
    cCtx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    cCtx.textAlign = 'center';
    cCtx.textBaseline = 'middle';

    // Subtle inner shadow for depth
    cCtx.shadowColor = 'rgba(0,0,0,0.30)';
    cCtx.shadowBlur = 6;
    cCtx.shadowOffsetX = 1;
    cCtx.shadowOffsetY = 2;
    cCtx.fillStyle = `#${lighter.getHexString()}`;
    cCtx.fillText(el.symbol, SIZE / 2, SIZE / 2);

    // Bright highlight pass (simulates top-light reflection on the engraving)
    cCtx.shadowColor = 'rgba(255,255,255,0.15)';
    cCtx.shadowBlur = 3;
    cCtx.shadowOffsetX = -1;
    cCtx.shadowOffsetY = -1;
    const highlight = baseColor.clone();
    highlight.offsetHSL(0, -0.08, 0.28);
    cCtx.fillStyle = `#${highlight.getHexString()}`;
    cCtx.fillText(el.symbol, SIZE / 2, SIZE / 2);

    const colorTexture = new THREE.CanvasTexture(colorCanvas);
    colorTexture.colorSpace = THREE.SRGBColorSpace;

    // ── Bump Map: neutral gray base + white symbol for relief ────────
    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = SIZE;
    bumpCanvas.height = SIZE;
    const bCtx = bumpCanvas.getContext('2d');

    bCtx.fillStyle = '#808080';
    bCtx.fillRect(0, 0, SIZE, SIZE);

    bCtx.fillStyle = '#b0b0b0';
    bCtx.font = `700 ${fontSize}px Arial, Helvetica, sans-serif`;
    bCtx.textAlign = 'center';
    bCtx.textBaseline = 'middle';
    bCtx.fillText(el.symbol, SIZE / 2, SIZE / 2);

    const bumpTexture = new THREE.CanvasTexture(bumpCanvas);

    const result = { colorMap: colorTexture, bumpMap: bumpTexture };
    _atomTextureCache.set(element, result);
    return result;
}


export class MoleculeBuilder {

    /** @param {import('./sceneManager.js').SceneManager} sceneManager */
    constructor(sceneManager) {
        this.sm = sceneManager;

        // Tracking arrays for toggle visibility
        this.cloudMeshes    = [];
        this.lonePairMeshes = [];
        this.labelObjects   = [];   // CSS2DObject labels + 3D arc lines
        this.lonePairLabels = [];   // Subset of labelObjects for LP labels
    }

    /* ═══════════════════════════════════════════════════════════════════
       Public API
       ═══════════════════════════════════════════════════════════════════ */

    /**
     * Build the full 3-D representation of a molecule.
     * @param {object} mol — molecule definition from moleculeData.js
     * @param {{ showCloud: boolean, showLabels: boolean, showLonePairs: boolean }} opts
     */
    build(mol, opts = {}) {
        this.clear();
        const group = this.sm.moleculeGroup;

        // 1) Atoms
        mol.atoms.forEach((atom) => this._createAtom(atom, group));

        // 2) Bonds
        mol.bonds.forEach((bond) => {
            this._createBond(mol.atoms[bond.from], mol.atoms[bond.to], bond.order, group);
        });

        // 3) Electron clouds (initially hidden unless requested)
        mol.atoms.forEach((atom) => this._createElectronCloud(atom, group));

        // 4) Bond electron clouds
        mol.bonds.forEach((bond) => {
            this._createBondCloud(mol.atoms[bond.from], mol.atoms[bond.to], group);
        });

        // 5) Lone pairs
        if (mol.lonePairDirections.length > 0) {
            const centralPos = mol.atoms[0].position;
            mol.lonePairDirections.forEach((dir) => {
                this._createLonePair(centralPos, dir, group);
            });
        }

        // 6) Labels (annotations)
        this._createAnnotations(mol, group);

        // Apply initial toggle states
        this.setCloudVisible(!!opts.showCloud);
        this.setLabelsVisible(!!opts.showLabels);
        this.setLonePairsVisible(!!opts.showLonePairs);
    }

    /* ─── Toggle visibility ────────────────────────────────────────── */

    setCloudVisible(v) {
        this.cloudMeshes.forEach((m) => { m.visible = v; });
    }

    setLabelsVisible(v) {
        this.labelObjects.forEach((o) => { o.visible = v; });
        // LP labels also depend on LP toggle
    }

    setLonePairsVisible(v) {
        this.lonePairMeshes.forEach((m) => { m.visible = v; });
        this.lonePairLabels.forEach((l) => { l.visible = v && this._labelsEnabled; });
    }

    /** Internal flag so LP labels respect both toggles */
    get _labelsEnabled() {
        return this.labelObjects.length > 0 && this.labelObjects[0]?.visible;
    }

    /* ─── Cleanup ──────────────────────────────────────────────────── */

    clear() {
        this.sm.clearMolecule();
        this.cloudMeshes    = [];
        this.lonePairMeshes = [];
        this.labelObjects   = [];
        this.lonePairLabels = [];
    }

    /* ═══════════════════════════════════════════════════════════════════
       Private — Atom
       ═══════════════════════════════════════════════════════════════════ */

    _createAtom(atom, group) {
        const el  = ELEMENTS[atom.element];
        const geo = getSphereGeo(el.radius);
        const tex = getAtomTextures(atom.element);
        const mat = new THREE.MeshStandardMaterial({
            map:       tex.colorMap,
            bumpMap:   tex.bumpMap,
            bumpScale: 0.022,
            metalness: 0.30,
            roughness: 0.16,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.position);
        group.add(mesh);
    }

    /* ═══════════════════════════════════════════════════════════════════
       Private — Bond
       ═══════════════════════════════════════════════════════════════════ */

    _createBond(atomA, atomB, order, group) {
        const pA = new THREE.Vector3(...atomA.position);
        const pB = new THREE.Vector3(...atomB.position);

        if (order === 1) {
            this._makeBondCylinder(pA, pB, BOND_RADIUS, group);
        } else if (order === 2) {
            // Two parallel cylinders offset perpendicular to the bond
            const dir = new THREE.Vector3().subVectors(pB, pA).normalize();
            const perp = this._perpendicular(dir).multiplyScalar(DOUBLE_BOND_OFFSET);

            for (const sign of [1, -1]) {
                const off = perp.clone().multiplyScalar(sign);
                this._makeBondCylinder(
                    pA.clone().add(off),
                    pB.clone().add(off),
                    BOND_RADIUS_DOUBLE,
                    group,
                );
            }
        }
    }

    /** Create a single bond cylinder from `start` to `end` in uniform BOND_COLOR. */
    _makeBondCylinder(start, end, radius, group) {
        const dir  = new THREE.Vector3().subVectors(end, start);
        const len  = dir.length();
        if (len < 0.001) return;

        const mesh = new THREE.Mesh(
            _cylGeo,
            new THREE.MeshStandardMaterial({
                color:     BOND_COLOR,
                metalness: 0.06,
                roughness: 0.50,
            }),
        );

        // Scale unit cylinder (radius 1, height 1)
        mesh.scale.set(radius, len, radius);

        // Position at midpoint
        mesh.position.lerpVectors(start, end, 0.5);

        // Align local Y with bond direction
        const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.normalize(),
        );
        mesh.quaternion.copy(q);

        group.add(mesh);
    }

    /** Return a normalised vector perpendicular to `dir`. */
    _perpendicular(dir) {
        const up = new THREE.Vector3(0, 1, 0);
        let p = new THREE.Vector3().crossVectors(dir, up);
        if (p.lengthSq() < 0.0001) {
            p = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(1, 0, 0));
        }
        return p.normalize();
    }

    /* ═══════════════════════════════════════════════════════════════════
       Private — Electron Cloud
       ═══════════════════════════════════════════════════════════════════ */

    _createElectronCloud(atom, group) {
        const el = ELEMENTS[atom.element];
        const r  = el.radius * CLOUD_SCALE;
        const geo = getSphereGeo(r);
        const mat = new THREE.MeshStandardMaterial({
            color:       el.color,
            transparent: true,
            opacity:     CLOUD_OPACITY,
            roughness:   0.95,
            metalness:   0.0,
            depthWrite:  false,
            side:        THREE.FrontSide,
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...atom.position);
        mesh.visible = false;
        group.add(mesh);
        this.cloudMeshes.push(mesh);
    }

    _createBondCloud(atomA, atomB, group) {
        const pA  = new THREE.Vector3(...atomA.position);
        const pB  = new THREE.Vector3(...atomB.position);
        const dir = new THREE.Vector3().subVectors(pB, pA);
        const len = dir.length();
        if (len < 0.001) return;

        const mesh = new THREE.Mesh(
            _cylGeo,
            new THREE.MeshStandardMaterial({
                color:       0x90CAF9,
                transparent: true,
                opacity:     0.06,
                roughness:   1.0,
                metalness:   0.0,
                depthWrite:  false,
                side:        THREE.DoubleSide,
            }),
        );
        const cloudR = 0.18;
        mesh.scale.set(cloudR, len * 0.75, cloudR);
        mesh.position.lerpVectors(pA, pB, 0.5);

        const q = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            dir.clone().normalize(),
        );
        mesh.quaternion.copy(q);
        mesh.visible = false;
        group.add(mesh);
        this.cloudMeshes.push(mesh);
    }

    /* ═══════════════════════════════════════════════════════════════════
       Private — Lone Pairs
       ═══════════════════════════════════════════════════════════════════ */

    _createLonePair(centralPos, direction, group) {
        const geo = new THREE.SphereGeometry(0.20, 32, 32);
        const mat = new THREE.MeshStandardMaterial({
            color:       LP_COLOR,
            transparent: true,
            opacity:     LP_OPACITY,
            roughness:   0.8,
            metalness:   0.0,
            depthWrite:  false,
            side:        THREE.DoubleSide,
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Elongated ellipsoid
        mesh.scale.set(0.65, 1.25, 0.65);

        // Position along direction from central atom
        const dir = new THREE.Vector3(...direction).normalize();
        mesh.position.set(
            centralPos[0] + dir.x * 0.72,
            centralPos[1] + dir.y * 0.72,
            centralPos[2] + dir.z * 0.72,
        );

        // Orient elongation axis along direction
        const yAxis = new THREE.Vector3(0, 1, 0);
        mesh.quaternion.setFromUnitVectors(yAxis, dir);

        mesh.visible = false;
        group.add(mesh);
        this.lonePairMeshes.push(mesh);
    }

    /* ═══════════════════════════════════════════════════════════════════
       Private — Labels & Annotations
       ═══════════════════════════════════════════════════════════════════ */

    _createAnnotations(mol, group) {
        const atoms = mol.atoms;

        // ── Element symbol labels ────────────────────────────────────
        atoms.forEach((atom) => {
            const el  = ELEMENTS[atom.element];
            const div = document.createElement('div');
            div.className = 'label-3d label-symbol';
            div.textContent = el.symbol;
            const label = new CSS2DObject(div);
            label.position.set(
                atom.position[0],
                atom.position[1] + el.radius + 0.18,
                atom.position[2],
            );
            label.visible = false;
            group.add(label);
            this.labelObjects.push(label);
        });

        // ── Role labels ──────────────────────────────────────────────
        atoms.forEach((atom, i) => {
            const el = ELEMENTS[atom.element];
            if (atom.role === 'central') {
                const div = document.createElement('div');
                div.className = 'label-3d label-central';
                div.textContent = 'Átomo Central';
                const label = new CSS2DObject(div);
                label.position.set(
                    atom.position[0],
                    atom.position[1] - el.radius - 0.30,
                    atom.position[2],
                );
                label.visible = false;
                group.add(label);
                this.labelObjects.push(label);
            } else if (i === 1) {
                // Annotate only the first ligand to avoid clutter
                const div = document.createElement('div');
                div.className = 'label-3d label-ligand';
                div.textContent = 'Átomo Ligante';
                const label = new CSS2DObject(div);
                label.position.set(
                    atom.position[0],
                    atom.position[1] - el.radius - 0.30,
                    atom.position[2],
                );
                label.visible = false;
                group.add(label);
                this.labelObjects.push(label);
            }
        });

        // ── Bond angle arc ───────────────────────────────────────────
        if (atoms.length >= 3 && mol.bondAngleLabel !== '—') {
            this._createAngleArc(
                atoms[0].position,
                atoms[1].position,
                atoms[2].position,
                mol.bondAngleLabel,
                group,
            );
        }

        // ── Lone-pair labels ─────────────────────────────────────────
        if (mol.lonePairDirections.length > 0) {
            const cp = mol.atoms[0].position;
            mol.lonePairDirections.forEach((dir, idx) => {
                const d = new THREE.Vector3(...dir).normalize();
                const div = document.createElement('div');
                div.className = 'label-3d label-lone-pair';
                div.textContent = idx === 0 ? 'Par Isolado' : 'Par Isolado';
                const label = new CSS2DObject(div);
                label.position.set(
                    cp[0] + d.x * 1.15,
                    cp[1] + d.y * 1.15,
                    cp[2] + d.z * 1.15,
                );
                label.visible = false;
                group.add(label);
                this.labelObjects.push(label);
                this.lonePairLabels.push(label);
            });
        }
    }

    /* ── Angle arc between two bonds ─────────────────────────────────── */

    _createAngleArc(centralPos, ligandPosA, ligandPosB, angleText, group) {
        const center = new THREE.Vector3(...centralPos);
        const dirA   = new THREE.Vector3(...ligandPosA).sub(center).normalize();
        const dirB   = new THREE.Vector3(...ligandPosB).sub(center).normalize();

        // Compute rotation quaternion from dirA → dirB
        const dot = dirA.dot(dirB);
        let points;

        if (dot < -0.999) {
            // ~180° — use an arbitrary perpendicular plane for the semicircle
            const perp = this._perpendicular(dirA);
            points = this._buildSemicircle(center, dirA, perp, ARC_RADIUS);
        } else {
            points = this._buildArc(center, dirA, dirB, ARC_RADIUS);
        }

        // Line geometry
        const geo  = new THREE.BufferGeometry().setFromPoints(points);
        const mat  = new THREE.LineBasicMaterial({ color: ARC_COLOR, linewidth: 1 });
        const line = new THREE.Line(geo, mat);
        line.visible = false;
        group.add(line);
        this.labelObjects.push(line);

        // Angle label at arc midpoint
        const midIdx = Math.floor(points.length / 2);
        const midPt  = points[midIdx].clone();
        // Nudge outward slightly for readability
        const nudge = midPt.clone().sub(center).normalize().multiplyScalar(0.22);
        midPt.add(nudge);

        const div = document.createElement('div');
        div.className = 'label-3d label-angle';
        div.textContent = angleText;
        const label = new CSS2DObject(div);
        label.position.copy(midPt);
        label.visible = false;
        group.add(label);
        this.labelObjects.push(label);
    }

    /** Build arc points via quaternion slerp. */
    _buildArc(center, dirA, dirB, radius) {
        const qId  = new THREE.Quaternion();
        const qRot = new THREE.Quaternion().setFromUnitVectors(dirA, dirB);
        const pts  = [];
        for (let i = 0; i <= ARC_SEGMENTS; i++) {
            const t = i / ARC_SEGMENTS;
            const q = new THREE.Quaternion().slerpQuaternions(qId, qRot, t);
            const p = dirA.clone().applyQuaternion(q).multiplyScalar(radius).add(center);
            pts.push(p);
        }
        return pts;
    }

    /** Build a semicircle for 180° bonds. */
    _buildSemicircle(center, dir, perp, radius) {
        const pts = [];
        for (let i = 0; i <= ARC_SEGMENTS; i++) {
            const t     = i / ARC_SEGMENTS;
            const angle = t * Math.PI;
            const p     = new THREE.Vector3()
                .addScaledVector(dir, Math.cos(angle))
                .addScaledVector(perp, Math.sin(angle))
                .multiplyScalar(radius)
                .add(center);
            pts.push(p);
        }
        return pts;
    }
}
