import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Earcut } from 'three/src/extras/Earcut'
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

// axiosInstance.get('/floor').then(response => {
//   console.log('response')
//   // 一层楼
//   const coordinates = response.data[0].coordinate
//   console.log(coordinates)

//   console.log('---sub----', THREE.Face3)
//   const width = 1920
//   const height = 700
//   const scene = new THREE.Scene()

//   // 设置摄像机位置，并将其朝向场景
//   const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 5000)
//   //设置三维坐标
//   camera.position.set(0, 100, 0)
//   //设置相机看上边的坐标
//   camera.lookAt(scene.position)

//   const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
//   renderer.setPixelRatio(window.devicePixelRatio)
//   renderer.setClearColor(0x000000, 0)
//   renderer.setSize(width, height)
//   document.body.appendChild(renderer.domElement)
//   scene.add(new THREE.AxesHelper(10))
//   const group = new THREE.Group()

//   const floorCordinates = coordinates[0].map(p => [p[0], 0, p[1]])
//   console.log(floorCordinates)

//   group.add(drawFloor(1, floorCordinates))
//   const building = coordinates
//     .slice(1)
//     .map(points => drawBuild(points.map(p => [p[0], 0, p[1]])))
//   console.log(building.length)
//   group.add(...building)
//   scene.add(group)

//   renderer.render(scene, camera)
//   //   requestAnimationFrame(renderer)
// })

const scene = new THREE.Scene()

// 设置摄像机位置，并将其朝向场景
const camera = new THREE.PerspectiveCamera(
  45,
  innerWidth / innerHeight,
  0.1,
  5000
)
//设置三维坐标
camera.position.set(0, 0, 0)
//设置相机看上边的坐标
camera.lookAt(scene.position)

const heatmapDiv = document.querySelector('.heatmap')
console.log(heatmapDiv)

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0x000000, 0)
renderer.setSize(innerWidth, innerHeight)

heatmapDiv.appendChild(renderer.domElement)

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

var gHeatmap = new THREE.Group()

var heatmapInstance = h337.create({
  container: document.querySelector('.heatmap'),
  width: 512, //这里一定要2的n次方倍数,否则控制台报警告（定死，与后面坐标系计算强关联）
  height: 256, //这里一定要2的n次方倍数,否则控制台报警告（定死，与后面坐标系计算强关联）
  blur: '.8',
  radius: 10, //辐射圈范围大小e
  alpha: true,
  // opacity: 0.5,//透明度
  // minOpacity: 0.1,
  // maxOpacity: 0.9,
  //色带配置（比例）
  gradient: { '.5': 'yellow', '.8': 'green', '.95': 'red' },
  backgroundColor: 'rgba(0,102,256,0)',
  //回调返回色带
  // onExtremaChange: function (res) {
  // console.log(res);
  // }
})

// now generate some random data
var points = []
var max = 0
var width = 840
var height = 400
var len = 300

while (len--) {
  var val = Math.floor(Math.random() * 100)
  // now also with custom radius
  var radius = Math.floor(Math.random() * 70)

  max = Math.max(max, val)
  var point = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * height),
    value: val,
    // radius configuration on point basis
    radius: radius,
  }
  points.push(point)
}
// heatmap data format
var data = {
  max: max,
  data: points,
}
// if you have a set of datapoints always use setData instead of addData
// for data initialization
heatmapInstance.setData(data)

console.log(heatmapInstance._renderer.canvas)

const texture = new THREE.Texture(heatmapInstance._renderer.canvas)
var material = new THREE.MeshLambertMaterial({
  map: texture,
  //   color: '0xf0f4fa',
  transparent: false,
  opacity: 0.4,
})

var mesh = new THREE.Mesh(new THREE.SphereGeometry(100, 50, 50), material)
gHeatmap.add(mesh)
scene.add(gHeatmap)

// 执行函数
function render() {
  let handle
  if (handle) {
    cancelAnimationFrame(handle)
  }
  //是否开启了热力图，如开启则开启热力图渲染
  if (texture) {
    texture.needsUpdate = true
  }
  renderer.clearDepth()
  //自转
  scene.rotation.y += 0.01
  renderer.render(scene, camera)
  orbit.update()
  handle = requestAnimationFrame(render)
}

render()
// renderer.render(scene, camera)
