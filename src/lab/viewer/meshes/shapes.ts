import * as THREE from 'three'

/** Rectángulo con esquinas redondeadas (centrado en cx, cy). */
export function roundedRect(path: THREE.Path, cx: number, cy: number, w: number, h: number, r: number) {
  const x = cx - w / 2
  const y = cy - h / 2
  path.moveTo(x + r, y)
  path.lineTo(x + w - r, y)
  path.quadraticCurveTo(x + w, y, x + w, y + r)
  path.lineTo(x + w, y + h - r)
  path.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  path.lineTo(x + r, y + h)
  path.quadraticCurveTo(x, y + h, x, y + h - r)
  path.lineTo(x, y + r)
  path.quadraticCurveTo(x, y, x + r, y)
  return path
}

/** Extruye y centra en Z, de modo que la cara frontal quede en z = espesor total / 2. */
export function extrudeCentered(shape: THREE.Shape, options: THREE.ExtrudeGeometryOptions) {
  const geo = new THREE.ExtrudeGeometry(shape, { curveSegments: 24, ...options })
  const depth = options.depth ?? 1
  const bevel = options.bevelEnabled ? (options.bevelThickness ?? 0) : 0
  geo.translate(0, 0, -depth / 2)
  geo.computeVertexNormals()
  geo.userData.halfThickness = depth / 2 + bevel
  return geo
}
