/**
 * @fileoverview Molecular geometry data definitions.
 *
 * Contains element rendering properties, geometry-type metadata,
 * and full 3-D configuration for all 15 molecules (5 geometries × 3 examples).
 * All atom positions are pre-computed from VSEPR bond angles with a
 * standard visualization bond length of 1.5 units.
 */

// ─── Visualization constant ───────────────────────────────────────────
const D = 1.5; // Standard bond visualization length (arbitrary units)

// ─── Element Rendering Properties ─────────────────────────────────────
export const ELEMENTS = Object.freeze({
    H:  { color: 0xF06292, radius: 0.28, name: 'Hidrogênio', symbol: 'H'  },
    C:  { color: 0x37474F, radius: 0.44, name: 'Carbono',     symbol: 'C'  },
    N:  { color: 0x0D47A1, radius: 0.42, name: 'Nitrogênio',  symbol: 'N'  },
    O:  { color: 0xB71C1C, radius: 0.40, name: 'Oxigênio',    symbol: 'O'  },
    F:  { color: 0x2E7D32, radius: 0.34, name: 'Flúor',       symbol: 'F'  },
    Cl: { color: 0x1B5E20, radius: 0.52, name: 'Cloro',       symbol: 'Cl' },
    S:  { color: 0xF57F17, radius: 0.52, name: 'Enxofre',     symbol: 'S'  },
    Be: { color: 0xFFA726, radius: 0.48, name: 'Berílio',     symbol: 'Be' },
    B:  { color: 0xE65100, radius: 0.44, name: 'Boro',        symbol: 'B'  },
    Si: { color: 0x795548, radius: 0.54, name: 'Silício',     symbol: 'Si' },
    P:  { color: 0xFF6F00, radius: 0.50, name: 'Fósforo',     symbol: 'P'  },
});

// ─── Geometry Types ───────────────────────────────────────────────────
export const GEOMETRIES = Object.freeze({
    linear: {
        name: 'Linear',
        icon: '━',
        angle: '180°',
        molecules: ['HF', 'CO2', 'BeCl2'],
        description: 'Átomos dispostos em linha reta com ângulo de 180° entre ligações.',
    },
    trigonalPlanar: {
        name: 'Trigonal Planar',
        icon: '△',
        angle: '120°',
        molecules: ['BF3', 'SO3', 'BCl3'],
        description: 'Três domínios de ligação dispostos simetricamente em um plano.',
    },
    tetrahedral: {
        name: 'Tetraédrica',
        icon: '◇',
        angle: '109.5°',
        molecules: ['CH4', 'CCl4', 'SiF4'],
        description: 'Quatro ligações apontando para os vértices de um tetraedro regular.',
    },
    trigonalPyramidal: {
        name: 'Pirâmide Trigonal',
        icon: '▲',
        angle: '~107°',
        molecules: ['NH3', 'PCl3', 'NF3'],
        description: 'Três ligações e um par isolado formando uma pirâmide de base triangular.',
    },
    angular: {
        name: 'Angular',
        icon: '∠',
        angle: '~104°',
        molecules: ['H2O', 'SO2', 'H2S'],
        description: 'Duas ligações com pares isolados, resultando em geometria angular (bent).',
    },
});

export const GEOMETRY_ORDER = [
    'linear',
    'trigonalPlanar',
    'tetrahedral',
    'trigonalPyramidal',
    'angular',
];

// ─── Trigonometric helpers for position computation ───────────────────
const cos = (deg) => Math.cos((deg * Math.PI) / 180);
const sin = (deg) => Math.sin((deg * Math.PI) / 180);
const sqrt = Math.sqrt;

const TP = (i) => [D * cos(i * 120), 0, D * sin(i * 120)];

const TA = D / sqrt(3); // ≈ 0.866

// Trigonal pyramidal helper: given bond angle θ, compute ligand positions
function trigPyrLigands(bondAngle) {
    const cosTheta = cos(bondAngle);
    const cosA = sqrt((cosTheta + 0.5) / 1.5);
    const sinA = sqrt(1 - cosA * cosA);
    return [0, 1, 2].map((i) => [
        D * sinA * cos(i * 120),
        -D * cosA,
        D * sinA * sin(i * 120),
    ]);
}

function angularLigands(bondAngle) {
    const half = bondAngle / 2;
    return [
        [ D * sin(half), -D * cos(half), 0],
        [-D * sin(half), -D * cos(half), 0],
    ];
}

const NH3_LIGS  = trigPyrLigands(107);
const PCl3_LIGS = trigPyrLigands(100.1);
const NF3_LIGS  = trigPyrLigands(102.2);

const H2O_LIGS = angularLigands(104.5);
const SO2_LIGS = angularLigands(119);
const H2S_LIGS = angularLigands(92.1);

// ─── Molecule Definitions ─────────────────────────────────────────────
export const MOLECULES = Object.freeze({

    /* ═══════════ LINEAR ═══════════ */

    HF: {
        name: 'Fluoreto de Hidrogênio',
        formula: 'HF',
        geometryType: 'linear',
        bondAngle: 180,
        bondAngleLabel: '—',
        atoms: [
            { element: 'F',  position: [0, 0, 0],  role: 'central' },
            { element: 'H',  position: [-D, 0, 0],  role: 'ligand'  },
        ],
        bonds: [{ from: 0, to: 1, order: 1 }],
        lonePairDirections: [[1, 0.6, 0.5], [1, 0.6, -0.5], [1, -0.8, 0]],
        description: 'Molécula diatômica com geometria linear trivial. O flúor possui três pares de elétrons isolados.',
    },

    CO2: {
        name: 'Dióxido de Carbono',
        formula: 'CO2',
        geometryType: 'linear',
        bondAngle: 180,
        bondAngleLabel: '180°',
        atoms: [
            { element: 'C', position: [0, 0, 0],  role: 'central' },
            { element: 'O', position: [-D, 0, 0], role: 'ligand'  },
            { element: 'O', position: [ D, 0, 0], role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 2 },
            { from: 0, to: 2, order: 2 },
        ],
        lonePairDirections: [],
        description: 'Duas ligações duplas C=O em disposição linear. Sem pares isolados no átomo central — ângulo de 180°.',
    },

    BeCl2: {
        name: 'Cloreto de Berílio',
        formula: 'BeCl2',
        geometryType: 'linear',
        bondAngle: 180,
        bondAngleLabel: '180°',
        atoms: [
            { element: 'Be', position: [0, 0, 0],  role: 'central' },
            { element: 'Cl', position: [-D, 0, 0], role: 'ligand'  },
            { element: 'Cl', position: [ D, 0, 0], role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Dois domínios de ligação sem pares isolados. Geometria eletrônica e molecular linear perfeita.',
    },

    /* ═══════════ TRIGONAL PLANAR ═══════════ */

    BF3: {
        name: 'Trifluoreto de Boro',
        formula: 'BF3',
        geometryType: 'trigonalPlanar',
        bondAngle: 120,
        bondAngleLabel: '120°',
        atoms: [
            { element: 'B', position: [0, 0, 0],  role: 'central' },
            { element: 'F', position: TP(0),       role: 'ligand'  },
            { element: 'F', position: TP(1),       role: 'ligand'  },
            { element: 'F', position: TP(2),       role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Três ligações B–F simétricas no plano. Ângulos de 120° — geometria trigonal plana ideal.',
    },

    SO3: {
        name: 'Trióxido de Enxofre',
        formula: 'SO3',
        geometryType: 'trigonalPlanar',
        bondAngle: 120,
        bondAngleLabel: '120°',
        atoms: [
            { element: 'S', position: [0, 0, 0], role: 'central' },
            { element: 'O', position: TP(0),     role: 'ligand'  },
            { element: 'O', position: TP(1),     role: 'ligand'  },
            { element: 'O', position: TP(2),     role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 2 },
            { from: 0, to: 2, order: 2 },
            { from: 0, to: 3, order: 2 },
        ],
        lonePairDirections: [],
        description: 'Ligações S=O com caráter de dupla por ressonância. Geometria trigonal plana com ângulos de 120°.',
    },

    BCl3: {
        name: 'Tricloreto de Boro',
        formula: 'BCl3',
        geometryType: 'trigonalPlanar',
        bondAngle: 120,
        bondAngleLabel: '120°',
        atoms: [
            { element: 'B',  position: [0, 0, 0], role: 'central' },
            { element: 'Cl', position: TP(0),     role: 'ligand'  },
            { element: 'Cl', position: TP(1),     role: 'ligand'  },
            { element: 'Cl', position: TP(2),     role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Três ligações B–Cl idênticas em arranjo planar. Sem pares isolados no boro.',
    },

    /* ═══════════ TETRAHEDRAL ═══════════ */

    CH4: {
        name: 'Metano',
        formula: 'CH4',
        geometryType: 'tetrahedral',
        bondAngle: 109.5,
        bondAngleLabel: '109.5°',
        atoms: [
            { element: 'C', position: [0, 0, 0],          role: 'central' },
            { element: 'H', position: [ TA,  TA,  TA],    role: 'ligand'  },
            { element: 'H', position: [ TA, -TA, -TA],    role: 'ligand'  },
            { element: 'H', position: [-TA,  TA, -TA],    role: 'ligand'  },
            { element: 'H', position: [-TA, -TA,  TA],    role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
            { from: 0, to: 4, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Quatro ligações C–H equivalentes. Geometria tetraédrica ideal com ângulos de 109.5°.',
    },

    CCl4: {
        name: 'Tetracloreto de Carbono',
        formula: 'CCl4',
        geometryType: 'tetrahedral',
        bondAngle: 109.5,
        bondAngleLabel: '109.5°',
        atoms: [
            { element: 'C',  position: [0, 0, 0],         role: 'central' },
            { element: 'Cl', position: [ TA,  TA,  TA],   role: 'ligand'  },
            { element: 'Cl', position: [ TA, -TA, -TA],   role: 'ligand'  },
            { element: 'Cl', position: [-TA,  TA, -TA],   role: 'ligand'  },
            { element: 'Cl', position: [-TA, -TA,  TA],   role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
            { from: 0, to: 4, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Quatro ligações C–Cl em arranjo tetraédrico simétrico. Molécula apolar apesar das ligações polares.',
    },

    SiF4: {
        name: 'Tetrafluoreto de Silício',
        formula: 'SiF4',
        geometryType: 'tetrahedral',
        bondAngle: 109.5,
        bondAngleLabel: '109.5°',
        atoms: [
            { element: 'Si', position: [0, 0, 0],         role: 'central' },
            { element: 'F',  position: [ TA,  TA,  TA],   role: 'ligand'  },
            { element: 'F',  position: [ TA, -TA, -TA],   role: 'ligand'  },
            { element: 'F',  position: [-TA,  TA, -TA],   role: 'ligand'  },
            { element: 'F',  position: [-TA, -TA,  TA],   role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
            { from: 0, to: 4, order: 1 },
        ],
        lonePairDirections: [],
        description: 'Quatro ligações Si–F em geometria tetraédrica. Semelhante ao CCl₄ em simetria molecular.',
    },

    /* ═══════════ TRIGONAL PYRAMIDAL ═══════════ */

    NH3: {
        name: 'Amônia',
        formula: 'NH3',
        geometryType: 'trigonalPyramidal',
        bondAngle: 107,
        bondAngleLabel: '107°',
        atoms: [
            { element: 'N', position: [0, 0, 0],       role: 'central' },
            { element: 'H', position: NH3_LIGS[0],      role: 'ligand'  },
            { element: 'H', position: NH3_LIGS[1],      role: 'ligand'  },
            { element: 'H', position: NH3_LIGS[2],      role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
        ],
        lonePairDirections: [[0, 1, 0]],
        description: 'Três ligações N–H e um par isolado. O par isolado comprime o ângulo de 109.5° para ~107°.',
    },

    PCl3: {
        name: 'Tricloreto de Fósforo',
        formula: 'PCl3',
        geometryType: 'trigonalPyramidal',
        bondAngle: 100.1,
        bondAngleLabel: '100.1°',
        atoms: [
            { element: 'P',  position: [0, 0, 0],       role: 'central' },
            { element: 'Cl', position: PCl3_LIGS[0],     role: 'ligand'  },
            { element: 'Cl', position: PCl3_LIGS[1],     role: 'ligand'  },
            { element: 'Cl', position: PCl3_LIGS[2],     role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
        ],
        lonePairDirections: [[0, 1, 0]],
        description: 'Pirâmide trigonal com ângulo de ~100°. O par isolado do fósforo exerce forte repulsão.',
    },

    NF3: {
        name: 'Trifluoreto de Nitrogênio',
        formula: 'NF3',
        geometryType: 'trigonalPyramidal',
        bondAngle: 102.2,
        bondAngleLabel: '102.2°',
        atoms: [
            { element: 'N', position: [0, 0, 0],       role: 'central' },
            { element: 'F', position: NF3_LIGS[0],      role: 'ligand'  },
            { element: 'F', position: NF3_LIGS[1],      role: 'ligand'  },
            { element: 'F', position: NF3_LIGS[2],      role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
            { from: 0, to: 3, order: 1 },
        ],
        lonePairDirections: [[0, 1, 0]],
        description: 'Pirâmide trigonal com ângulo de ~102°. Menor que NH₃ devido à alta eletronegatividade do flúor.',
    },

    /* ═══════════ ANGULAR (BENT) ═══════════ */

    H2O: {
        name: 'Água',
        formula: 'H2O',
        geometryType: 'angular',
        bondAngle: 104.5,
        bondAngleLabel: '104.5°',
        atoms: [
            { element: 'O', position: [0, 0, 0],       role: 'central' },
            { element: 'H', position: H2O_LIGS[0],      role: 'ligand'  },
            { element: 'H', position: H2O_LIGS[1],      role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
        ],
        lonePairDirections: [[0, 0.7, 0.7], [0, 0.7, -0.7]],
        description: 'Duas ligações O–H e dois pares isolados. Os pares comprimem o ângulo para 104.5°.',
    },

    SO2: {
        name: 'Dióxido de Enxofre',
        formula: 'SO2',
        geometryType: 'angular',
        bondAngle: 119,
        bondAngleLabel: '119°',
        atoms: [
            { element: 'S', position: [0, 0, 0],       role: 'central' },
            { element: 'O', position: SO2_LIGS[0],      role: 'ligand'  },
            { element: 'O', position: SO2_LIGS[1],      role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 2 },
            { from: 0, to: 2, order: 2 },
        ],
        lonePairDirections: [[0, 1, 0]],
        description: 'Geometria angular com ligações S=O duplas. O par isolado no enxofre gera ângulo de ~119°.',
    },

    H2S: {
        name: 'Sulfeto de Hidrogênio',
        formula: 'H2S',
        geometryType: 'angular',
        bondAngle: 92.1,
        bondAngleLabel: '92.1°',
        atoms: [
            { element: 'S', position: [0, 0, 0],       role: 'central' },
            { element: 'H', position: H2S_LIGS[0],      role: 'ligand'  },
            { element: 'H', position: H2S_LIGS[1],      role: 'ligand'  },
        ],
        bonds: [
            { from: 0, to: 1, order: 1 },
            { from: 0, to: 2, order: 1 },
        ],
        lonePairDirections: [[0, 0.7, 0.7], [0, 0.7, -0.7]],
        description: 'Ângulo de apenas ~92°. Os orbitais do enxofre são menos hibridizados que os do oxigênio.',
    },
});


// ─── Utility: Render formula with HTML subscripts ─────────────────────
/**
 * Converts a plain formula string like "CO2" into HTML with <sub> tags.
 * @param {string} formula — e.g. "BeCl2", "CH4", "H2O"
 * @returns {string} HTML string — e.g. "BeCl<sub>2</sub>"
 */
export function renderFormula(formula) {
    return formula.replace(/(\d+)/g, '<sub>$1</sub>');
}
