import Stats from 'stats.js'

import viewport from '@/plugins/viewport'
// import useRAF from '@/hooks/use-raf.js'
import useFrame from '@/hooks/use-frame'

let webgl

class WebGL {
  constructor() {
    const frame = useFrame()

    // clock
    this.clock = new THREE.Clock()

    // scene
    this.scene = new THREE.Scene()
    this.DOMScene = new THREE.Group()
    this.scene.add(this.DOMScene)

    // camera
    this.camera = new THREE.OrthographicCamera(
      viewport.width / -2,
      viewport.width / 2,
      viewport.height / 2,
      viewport.height / -2,
      -10000,
      10000
    )

    this.camera.position.set(0, 0, 500)

    // camera controls
    // const {
    //   OrbitControls
    // } = require('three/examples/jsm/controls/OrbitControls.js')
    // this.cameraControls = new OrbitControls(
    //   this.camera,
    //   document.getElementById('__nuxt')
    // )

    // renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      powerPreference: 'high-performance',
      stencil: false,
      depth: false,
      antialias: false,
      precision: 'highp'
    })
    this.renderer.setSize(viewport.width, viewport.height)
    this.renderer.setPixelRatio(1)

    // composer
    const Composer = require('@/webgl/composer').default
    this.composer = new Composer({
      camera: this.camera,
      renderer: this.renderer,
      scene: this.scene
    })

    // stats
    if (process.env.NODE_ENV === 'development') {
      this.stats = new Stats()
      document.body.appendChild(this.stats.dom)
      frame.on('statsBegin', this.stats.begin)
      frame.on('statsEnd', this.stats.end)
      // RAF.add('stats-begin', this.stats.begin, -1000)
      // RAF.add('stats-end', this.stats.end, 1000)
    }

    // raycaster
    const Raycaster = require('@/webgl/raycaster').default
    this.raycaster = new Raycaster(this.camera)

    // events
    viewport.events.on('resize', this.onWindowResize)

    // raf
    // RAF.add('use-webgl', this.loop, 10)
    frame.on('render', this.loop)
  }

  loop = ({ time, deltaTime, frameIndex }) => {
    this.renderer.setSize(viewport.width, viewport.height)
    // this.renderer.render(this.scene, this.camera)
    this.composer.render(time)
    this.renderer.renderLists.dispose()
  }

  get viewsize() {
    let width, height
    if (this.camera.type === 'PerspectiveCamera') {
      const distance = this.camera.position.z
      const vFov = (this.camera.fov * Math.PI) / 180
      height = 2 * Math.tan(vFov / 2) * distance
      width = height * viewport.ratio
    } else if (this.camera.type === 'OrthographicCamera') {
      width = viewport.width
      height = viewport.height
    }

    return { width, height }
  }

  onWindowResize = () => {
    if (this.camera.type === 'OrthographicCamera') {
      this.camera.left = viewport.width / -2
      this.camera.right = viewport.width / 2
      this.camera.top = viewport.height / 2
      this.camera.bottom = viewport.height / -2
    }
    this.camera.updateProjectionMatrix()
  }

  destroy() {
    // const RAF = useRAF()
    // RAF.remove('stats-begin')
    // RAF.remove('stats-end')
    // RAF.remove('use-webgl')

    frame.off('statsBegin', this.stats.begin)
    frame.off('statsEnd', this.stats.end)
    frame.off('render', this.loop)
  }
}

const useWebGL = () => {
  return webgl || (webgl = new WebGL())
}

export default useWebGL
