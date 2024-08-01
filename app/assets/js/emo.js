const successEmo = ['🤟', '🤘', '🤙', '👌', '👍', '💪', '👏', '🤗', '🥰', '😍']
const errorEmo = ['🤷‍♀️', '🤦‍♀️', '🤔', '😲']
const updateEmo = ['🤟', '💃', '✨', '🔥', '💥', '🎉', '🤘', '🤙']

function random(icons) {
  return icons[Math.floor(Math.random() * icons.length)]
}

export {
  errorEmo,
  random,
  successEmo,
  updateEmo,
}
