<template>
  <div>
    <h2>Jouer — {{ player.name }}</h2>
    <button @click="loadQuestions">Charger questions</button>

    <div v-if="questions.length">
      <div
        v-for="q in questions"
        :key="q.id"
        style="border: 1px solid #ddd; padding: 8px; margin: 8px 0"
      >
        <p>
          <b>{{ q.question }}</b>
        </p>
        <div v-for="c in q.choices" :key="c">
          <button @click="answer(q.id, c)">{{ c }}</button>
        </div>
      </div>
    </div>

    <p>Score: {{ score }}</p>
  </div>
</template>

<script>
import axios from 'axios'
import { io } from 'socket.io-client'
export default {
  props: ['player'],
  data() {
    return { questions: [], score: 0, socket: null }
  },
  methods: {
    async loadQuestions() {
      const res = await axios.get('http://localhost:3002/quiz').catch(() => null)
      if (res) this.questions = res.data
    },
    async answer(questionId, choice) {
      const res = await axios
        .post('http://localhost:3003/game/answer', {
          playerId: this.player.id,
          questionId,
          answer: choice,
        })
        .catch(() => null)
      if (res && res.data) {
        this.score = res.data.score ?? this.score
        if (res.data.correct) alert('Bonne réponse !')
        else alert('Mauvaise réponse. La bonne était: ' + res.data.correctAnswer)
      }
    },
  },
  created() {
    // connect socket
    this.socket = io('http://localhost:3003')
    this.socket.on('connect', () => console.log('ws connected', this.socket.id))
    this.socket.on('score:update', (payload) => {
      if (payload.playerId === this.player.id) this.score = payload.score
    })
    this.socket.on('leaderboard:update', (payload) => {
      // optional: update parent leaderboard via event
      this.$emit('leaderboard:update', payload)
    })
    // register to ws
    this.socket.emit('register', this.player.id)

    // fetch initial score
    axios
      .get(`http://localhost:3003/game/score/${this.player.id}`)
      .then((res) => {
        if (res.data) this.score = res.data.score || 0
      })
      .catch(() => {})
  },
  unmounted() {
    if (this.socket) this.socket.disconnect()
  },
}
</script>
