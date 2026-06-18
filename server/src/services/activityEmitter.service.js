/**
 * activityEmitter.service.js
 *
 * In-process event bus for real-time live activity.
 * Any part of the server emits an event here.
 * The SSE controller subscribes and pushes to all connected clients instantly.
 *
 * Usage:
 *   const { emitActivity } = require('./activityEmitter.service')
 *   emitActivity({ type: 'survey_completed', username: 'jo***', ... })
 */

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

module.exports = { emitter, emitActivity }
