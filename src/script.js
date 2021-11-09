import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Earcut } from 'three/src/extras/Earcut'
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js'
import * as dat from 'dat.gui'
import axiosInstance from './helper'

const buildColors = [0x219fd4, 0x24aee8, 0x4ec1f1]
const getGeometry = (points, height) => {
  if (points.length < 3) return
  const totalPoints = points.concat(
    points.map(p => [p[0], height + p[1], p[2]])
  )
  const vertices = totalPoints.map(p => new THREE.Vector3(p[0], p[1], p[2]))
  const faces = []
  const length = points.length
  for (let i = 0; i < length; i++) {
    //侧面生成三角形
    if (i !== length - 1) {
      faces.push(new THREE.Face3(i, i + 1, length + i + 1))
      faces.push(new THREE.Face3(length + i + 1, length + i, i))
    } else {
      faces.push(new THREE.Face3(i, 0, length))
      faces.push(new THREE.Face3(length, length + i, i))
    }
  }
  const triangles = Earcut.triangulate(points.map(p => [p[0], p[2]]).flat())
  if (triangles && triangles.length !== 0) {
    for (let i = 0; i < triangles.length; i++) {
      const tlength = triangles.length
      if (i % 3 == 0 && i < tlength - 2) {
        faces.push(
          new THREE.Face3(triangles[i], triangles[i + 1], triangles[i + 2])
        ) //底部的三角面
        faces.push(
          new THREE.Face3(
            triangles[i] + length,
            triangles[i + 1] + length,
            triangles[i + 2] + length
          )
        ) //顶部的三角面
      }
    }
  }
  const geometry = new THREE.Geometry()
  geometry.vertices = vertices
  geometry.faces = faces
  return geometry
}

const drawFloor = (FloorId, points) => {
  const geometry = getGeometry(points, 0.5)
  //基础网格材质
  const material = new THREE.MeshBasicMaterial({
    color: 0xf0f4fa,
    side: THREE.DoubleSide,
  })
  const mesh = new THREE.Mesh(geometry, material)
  //   const lineMaterial = new THREE.LineBasicMaterial({ color: 0xdedede })
  //   const lineGeo = new THREE.EdgesGeometry(geometry)
  //   const lineMesh = new THREE.LineSegments(lineGeo, lineMaterial)
  //   mesh.add(lineMesh)

  return mesh
}

export const drawBuild = points => {
  // console.log(points)
  // build = [...points]
  const geometry = getGeometry(points, 10)
  const material = new THREE.MeshBasicMaterial({
    color: buildColors[Math.ceil(Math.random() * 2)],
    side: THREE.DoubleSide,
  })
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xdedede })
  const lineGeo = new THREE.EdgesGeometry(geometry)
  const lineMesh = new THREE.LineSegments(lineGeo, lineMaterial)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.add(lineMesh)
  return mesh
}

axiosInstance.get('/floor').then(response => {
  console.log('response')
  console.log('floor data', response.data)
  // B1层楼
  const coordinates = response.data[0].coordinate
  console.log('coordinates', coordinates)

  //   console.log('---sub----', THREE.Face3)
  const width = window.innerWidth
  const height = window.innerHeight
  const scene = new THREE.Scene()

  // 设置摄像机位置，并将其朝向场景
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  //设置三维坐标
  camera.position.set(0, 100, 0)
  //设置相机看上边的坐标
  // camera.lookAt(scene.position)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setClearColor(0x000000, 0)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // 场景控制器
  const orbit = new OrbitControls(camera, renderer.domElement)
  // orbit.enableRotate = false
  //设置相机的角度范围
  orbit.maxPolarAngle = Math.PI / 2
  //设置相机距离原点的距离
  orbit.maxDistance = 2000
  orbit.minDistance = 300
  // 设置控制器垂直旋转的角度
  orbit.maxPolarAngle = Math.PI * 2
  orbit.minPolarAngle = -Math.PI * 2
  orbit.mouseButtons = {
    LEFT: THREE.MOUSE.PAN,
    MIDDLE: THREE.MOUSE.DOLLY,
    RIGHT: THREE.MOUSE.ROTATE,
  }
  orbit.update()

  scene.add(new THREE.AxesHelper(10))
  const floorGroup = new THREE.Group()

  // 物体转换控制器
  const trans = new TransformControls(camera, renderer.domElement)
  trans.setMode('translate')
  // 默认关闭Y轴 (rotate才开启). scale translate 不允许Y轴上的变动
  // trans.showY = false
  scene.add(trans)

  // 画楼层和建筑
  const scale = 8
  const floorCordinates = coordinates[0].map(p => [
    p[0] / scale,
    0,
    p[1] / scale,
  ])
  console.log('floor cordinates', floorCordinates)

  floorGroup.add(drawFloor(1, floorCordinates))

  const end = coordinates.length

  for (let i = 1; i < end; i++) {
    const points = coordinates[i]
    console.log(`coordinates ${i}`, points)
    const g = new THREE.Group()
    floorGroup.add(g)
    g.add(drawBuild(points.map(p => [p[0] / scale, 0, p[1] / scale])))
  }

  scene.add(floorGroup)

  // renderer.render(scene, camera)
  const animate = () => {
    requestAnimationFrame(animate)

    // required if controls.enableDamping or controls.autoRotate are set to true
    orbit.update()

    renderer.render(scene, camera)
  }
  animate()
})
