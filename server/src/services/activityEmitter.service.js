const EventEmitter = require('events')

class ActivityEmitter extends EventEmitter {}

const emitter = new ActivityEmitter()
emitter.setMaxListeners(500) // support up to 500 concurrent SSE connections

const emitActivity = (event) => {
  emitter.emit('activity', {
    id:         Date.now(),
    type:       event.type,
    username:   event.username,
    offer_wall: event.offer_wall || null,
    amount:     event.amount     || null,
    country:    event.country    || 'Unknown',
    time:       new Date().toISOString(),
  })
}

const emitAdminEvent = (event) => {
  emitter.emit('admin', { id: Date.now(), time: new Date().toISOString(), ...event })
}

module.exports = { emitter, emitActivity, emitAdminEvent }
