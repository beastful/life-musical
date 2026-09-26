import EventLite from 'event-lite'
import * as Tone from "tone";
import './style.css'

const notes = [
  ['B#9', 'C#9', 'D#9', 'E#9', 'F#4', 'G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4'],
  ['G#8', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4', 'B#4', 'C#4'],
  ['E#4', 'F#4', 'G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4'],
  ['C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'B#4'],
  ['A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4'],
  ['F#4', 'G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'B#4', 'C#4', 'D#4', 'E#4'],
  ['D#4', 'E#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4', 'B#4', 'C#4'],
  ['B#4', 'C#4', 'D#4', 'E#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4'],
  ['G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4'],
  ['E1', 'F3', 'G3', 'A3', 'B3', 'C#4', 'D#4', 'E#4', 'F#4', 'G#4', 'A#4'],
  ['C3', 'D3', 'E3', 'F#1', 'G#4', 'A#4', 'B#4', 'C#4', 'D#4', 'E#4', 'F#4'],
]

function neighbours(state, i, j) {
  let c = 0
  for (let k = -1; k <= 1; k++) {
    for (let h = -1; h <= 1; h++) {
      if (state[i + k] != undefined && state[i + k][j + h] != undefined) {
        if (!(h == 0 && k == 0)) {
          c = c + state[i + k][j + h]
        }
      }
      if (i + k > state.length - 1) {
        if (state[0][j + h] != undefined) {
          c = c + state[0][j + h]
        }
      }
      if (i + k < 0) {
        if (state[state.length - 1][j + h] != undefined) {
          c = c + state[state.length - 1][j + h]
        }
      }
      if (j + h > state[i].length - 1) {
        if (state[i + k] != undefined && state[i + k][0] != undefined) {
          c += state[i + k][0]
        }
      }
      if (j + h < 0) {
        if (state[i + k] != undefined && state[i + k][state.length - 1] != undefined) {
          c += state[i + k][state.length - 1]
        }
      }
    }
  }
  return c
}

class Timer extends EventLite {
  constructor() {
    super()
    this.speed = 300
    this.state = 'paused' // 'paused' || 'playing'
  }

  play() {
    if (this.state == 'playing') return;
    this.state = 'playing'
    this.interval = setInterval(this.tick.bind(this), this.speed)
  }

  stop() {
    if (this.state == 'paused') return;
    this.state = 'paused'
    clearInterval(this.interval)
  }

  tick() {
    this.emit('tick')
  }
}

class Cell { }

class Field extends EventLite {
  constructor(mask) {
    super()
    this.size = 10
    this.oldstate = []
    this.state = []
    this.newstate = []
    this.mask = mask
    this.game = new Game()
    this.timer = this.game.timer
    this.init()
    this.timer.on('tick', this.tick.bind(this))
  }

  init() {
    this.oldstate = []
    this.state = []
    this.newstate = []
    for (let i = 0; i <= this.size; i++) {
      this.oldstate[i] = []
      this.state[i] = []
      this.newstate[i] = []
      for (let j = 0; j <= this.size; j++) {
        let n = Math.round(Math.random())
        this.oldstate[i][j] = 1
        this.state[i][j] = n
        this.newstate[i][j] = n
      }
    }
  }

  clear() {
    for (let i = 0; i <= this.size; i++) {
      for (let j = 0; j <= this.size; j++) {
        this.state[i][j] = 0
        this.newstate[i][j] = 0
      }
    }
  }

  randomize() {
    for (let i = 0; i <= this.size; i++) {
      for (let j = 0; j <= this.size; j++) {
        let n = Math.round(Math.random())
        this.oldstate[i][j] = 1
        this.state[i][j] = n
        this.newstate[i][j] = n
      }
    }
  }

  tick() {
    for (let i = 0; i <= this.state.length - 1; i++) {
      for (let j = 0; j <= this.state[i].length - 1; j++) {
        let n = neighbours(this.state, i, j)
        let l = this.state[i][j]
        if (l == 1 && n < 2) {
          this.newstate[i][j] = 0
        } else if (l == 1 && (n == 2 || n == 3)) {
          this.newstate[i][j] = 1
        } else if (l == 1 && n > 3) {
          this.newstate[i][j] = 0
        } else if (l == 0 && n == 3) {
          this.newstate[i][j] = 1
        }
      }
    }
    this.oldstate = JSON.parse(JSON.stringify(this.state))
    this.state = JSON.parse(JSON.stringify(this.newstate))
  }
}

function createRaw() {
  const raw = document.createElement("div")
  raw.style.display = 'flex'
  return raw
}

function createCell(i, j, self) {
  const cell = document.createElement("div")
  cell.innerHTML = notes[i][j]
  cell.className = 'gol-cell'
  const game = new Game()
  const field = game.field
  cell.addEventListener('click', () => {
    field.state[i][j] = 1
    self.tick()
  })
  return cell
}

class Canvas {
  constructor() {
    this.element = document.getElementById('gol-field')
    this.game = new Game()
    this.timer = this.game.timer
    this.field = this.game.field
    this.timer.on('tick', this.tick.bind(this))
    this.tick()
  }

  tick() {
    this.element.innerHTML = ''
    const state = this.field.state
    const oldstate = this.field.oldstate
    for (let i = 0; i <= state.length - 1; i++) {
      const raw = createRaw()
      for (let j = 0; j <= state[i].length - 1; j++) {
        const cell = createCell(i, j, this)
        if (state[i][j] == 0) {
          cell.className = 'gol-cell-dead'
          cell.classList.add('gol-cell')
        } else {
          if (oldstate[i][j] == 0) {
            cell.className = 'gol-cell-newborn'
            cell.classList.add('gol-cell')
          } else {
            cell.className = 'gol-cell-alive'
            cell.classList.add('gol-cell')
          }
        }
        raw.appendChild(cell)
      }
      this.element.appendChild(raw)
    }
  }
}

class Controls {
  constructor() {
    this.stop_element = document.getElementById('gol-stop')
    this.play_element = document.getElementById('gol-play')
    this.clear_element = document.getElementById('gol-clear')
    this.speed_element = document.getElementById('gol-speed')
    this.random_element = document.getElementById('gol-random')
    this.indicator_text_element = document.getElementById('gol-indicator-text')
    this.indicator_dot_element = document.getElementById('gol-indicator-dot')
    this.play_element.addEventListener('click', this.play.bind(this))
    this.stop_element.addEventListener('click', this.stop.bind(this))
    this.clear_element.addEventListener('click', this.clear.bind(this))
    this.speed_element.addEventListener('change', this.speed.bind(this))
    this.random_element.addEventListener('click', this.randomize.bind(this))
    this.game = new Game()
    this.timer = this.game.timer
    this.field = this.game.field
    this.canvas = this.game.canvas
    this.updateUI()
  }

  stop() {
    this.timer.stop()
    this.updateUI()
  }

  play() {
    this.timer.play()
    this.updateUI()
  }

  clear() {
    this.field.clear()
    this.canvas.tick()
    this.updateUI()
  }

  speed(event) {
    const speed = Number(event.target.value)
    this.timer.stop()
    this.timer.speed = speed
    this.timer.play()
    this.updateUI()
  }

  randomize() {
    this.field.randomize()
    this.canvas.tick()
    this.updateUI()
  }

  updateUI() {
    if (this.timer.state == 'paused') {
      this.stop_element.classList.add('gol-button-muted')
      this.play_element.classList.remove('gol-button-muted')
      this.indicator_text_element.innerHTML = 'Paused'
      this.indicator_dot_element.className = 'gol-indicator-dot-muted'
      this.indicator_dot_element.classList.add('gol-indicator-dot')
    }
    if (this.timer.state == 'playing') {
      this.play_element.classList.add('gol-button-muted')
      this.stop_element.classList.remove('gol-button-muted')
      this.indicator_text_element.innerHTML = 'Playing'
      this.indicator_dot_element.className = 'gol-indicator-dot-active'
      this.indicator_dot_element.classList.add('gol-indicator-dot')
    }
  }
}

class Music {
  constructor() {
    this.game = new Game()
    this.field = this.game.field
    this.timer = this.game.timer
    this.timer.on('tick', this.tick.bind(this))
    this.synth = new Tone.Synth().toDestination()
  }

  tick() {
    const state = this.field.state
    const oldstate = this.field.oldstate
    for (let i = 0; i <= state.length - 1; i++) {
      for (let j = 0; j <= state[i].length - 1; j++) {
        if (state[i][j] == 1 && oldstate[i][j] == 0) {
          this.synth.triggerAttackRelease(notes[i][j], '8n')
        }
      }
    }
  }
}

class Game {
  constructor() {
    if (!!Game.instance) {
      return Game.instance
    }
    Game.instance = this
    this.timer = new Timer()
    this.field = new Field()
    this.canvas = new Canvas()
    this.controls = new Controls()
    this.music = new Music()
  }
}

new Game()
