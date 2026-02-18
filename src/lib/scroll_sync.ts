let ignoreScrollEvents = false

let edit: HTMLElement | null
let view: HTMLElement | null

export const initScrollSync = () => {
  removeScrollListeners()
  edit = document.querySelector('#edit')
  view = document.querySelector('#view')
  addScrollListeners()
}

export const removeScrollSync = () => {
  removeScrollListeners()
}

const calcScroll = (element1: HTMLElement, element2: HTMLElement) => {
  const scroll_end = element2.scrollHeight - element2.clientHeight
  const percent = (element1.scrollTop / (element1.scrollHeight - element1.clientHeight)) * 100
  const percent_to_pos = scroll_end * (percent / 100)
  return percent_to_pos
}

export const removeScrollListeners = () => {
  edit?.removeEventListener('scroll', editScroll)
  view?.removeEventListener('scroll', viewScroll)
}

const editScroll = () => {
  const element2 = view!
  const element1 = edit!

  const percent_to_pos = calcScroll(element1, element2)

  const ignore = ignoreScrollEvents
  ignoreScrollEvents = false
  if (ignore) return
  ignoreScrollEvents = true
  element2.scrollTop = percent_to_pos
}

const viewScroll = () => {
  const element1 = view!
  const element2 = edit!

  const percent_to_pos = calcScroll(element1, element2)

  const ignore = ignoreScrollEvents
  ignoreScrollEvents = false
  if (ignore) return
  ignoreScrollEvents = true
  element2.scrollTop = percent_to_pos
}

const addScrollListeners = () => {
  if (view !== null && edit !== null) {
    edit.addEventListener('scroll', editScroll)
    view.addEventListener('scroll', viewScroll)
  }
}
