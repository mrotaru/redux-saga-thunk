import {
  isThunkAction,
  getThunkMeta,
  getThunkName,
  createThunkAction,
  generateThunkKey,
  hasKey,
} from './utils'

const middleware = () => {
  const responses = {}

  return next => (action) => {
    const { error, payload } = action
    if (isThunkAction(action)) {
      if (!hasKey(action)) {
        const key = generateThunkKey(action)
        return new Promise((resolve, reject) => {
          responses[key] = (err, response) => (err ? reject(response) : resolve(response))
          next(createThunkAction(action, key))
        })
      }
      const key = getThunkMeta(action)

      if (!responses[key]) {
        throw new Error(`[redux-saga-thunk] ${getThunkName(action)} should be dispatched before ${action.type}`)
      }

      responses[key](error, payload)
      delete responses[key]
      return next(createThunkAction(action, generateThunkKey(action)))
    }
    return next(action)
  }
}

export default middleware
