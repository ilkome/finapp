const successEmo = ['🤟', '🤘', '🤙', '👌', '👍', '💪', '👏', '🤗', '🥰', '😍']
const errorEmo = ['🤷‍♀️', '🤦‍♀️', '🤔', '😲']
const greetEmo = ['🤟', '🤘', '🤙', '✌️', '🖖', '🤗', '😘', '😜', '🤪']

function random (icons) {
  return icons[Math.floor(Math.random() * icons.length)]
}

export {
  successEmo,
  errorEmo,
  greetEmo,
  random
}
