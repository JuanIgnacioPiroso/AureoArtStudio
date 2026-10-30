/** Medidas del cinturón (unidades de escena). Las usan la malla y los tests. */

/** Tramo recto de cinturón: 350 × 35 mm y 4 mm de espesor, acostado, con la punta redondeada a la derecha. */
export const BELT = { length: 3.5, width: 0.35, thickness: 0.04 }
export const BELT_HALF = BELT.thickness / 2
export const BEVEL = 0.005
export const L = BELT.length / 2
export const W = BELT.width / 2
/** Donde empieza la punta (un semicírculo del ancho del cinturón). */
export const TIP_X = L - W
/** Agujeros de Ø 5 mm, a 25 mm uno del otro, antes de la punta. */
export const HOLES_X = [0.95, 1.2, 1.45]
export const HOLE_R = 0.025
/** Hebilla: marco de 42 × 48 mm de alambre de Ø 5 mm, centrado en el extremo izquierdo del cinturón. */
export const BUCKLE = { left: -1.97, right: -1.55, half: 0.24, wire: 0.025, corner: 0.06 }
/** La costura arranca pasando la hebilla y llega hasta la punta. */
export const STITCH_FROM = -1.5
