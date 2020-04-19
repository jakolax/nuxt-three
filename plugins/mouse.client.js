import Events from 'events'
import gsap from 'gsap'
import Vue from 'vue'
import viewport from '@/plugins/viewport.client'
import useRAF from '@/hooks/use-raf'

/* eslint-disable nuxt/no-env-in-hooks */

const mouse = new Vue({
  data() {
    return {
      hasMove: false,
      lerped: new THREE.Vector2(-1000, -1000),
      position: new THREE.Vector2(-1000, -1000),
      velocity: new THREE.Vector2(0, 0)
    }
  },
  computed: {
    normalized() {
      return new THREE.Vector2(
        (this.position.x / viewport.width) * 2 - 1,
        -(this.position.y / viewport.height) * 2 + 1
      )
    },
    lerpedNormalized() {
      return new THREE.Vector2(
        (this.lerped.x / viewport.width) * 2 - 1,
        -(this.lerped.y / viewport.height) * 2 + 1
      )
    }
  },
  created() {
    if (!process.client) return

    this.events = new Events()

    window.addEventListener('touchstart', this.onMouseMove, false)
    window.addEventListener('touchmove', this.onMouseMove, false)
    window.addEventListener('mousemove', this.onMouseMove, false)

    const RAF = useRAF()
    RAF.add('mouse', this.loop, 0)
  },
  beforeDestroy() {
    if (!process.client) return

    window.removeEventListener('touchstart', this.onMouseMove, false)
    window.removeEventListener('touchmove', this.onMouseMove, false)
    window.removeEventListener('mousemove', this.onMouseMove, false)

    RAF.add('mouse')
  },
  methods: {
    loop() {
      // const velocity = this.velocity.clone()
      // if (!velocity.needsUpdate) {
      //   velocity.set(0, 0)
      // }
      // velocity.needsUpdate = false
      // this.velocity.lerp(velocity, this.hasMove ? 0.5 : 0.1)
    },
    onMouseMove(e) {
      const event = e

      this.hasMove = true

      const evt = e.targetTouches ? e.targetTouches[0] : e

      this.position.set(evt.x, evt.y)

      gsap.to(this.lerped, !this.lastTime ? 0 : 0.6, {
        x: evt.x,
        y: evt.y,
        ease: 'power4.out'
      })

      if (!this.lastTime) {
        this.lastTime = performance.now()
        if (!this.lastPosition) this.lastPosition = new THREE.Vector2()
        this.lastPosition.set(evt.x, evt.y)
      }

      // const deltaX = evt.x - this.lastPosition.x
      // const deltaY = evt.y - this.lastPosition.y

      // this.lastPosition.set(evt.x, evt.y)

      // const time = performance.now()

      // const delta = Math.max(14, time - this.lastTime)
      // this.lastTime = time

      // this.velocity.x = deltaX / delta
      // this.velocity.y = deltaY / delta

      // this.velocity.needsUpdate = true

      this.events.emit('mousemove', {
        ...this.$data,
        ...this.computed,
        event
      })
    }
  }
})

Vue.prototype.$mouse = mouse

export default mouse
