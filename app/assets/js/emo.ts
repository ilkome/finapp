const successEmo = ['🤟', '🤘', '🤙', '👌', '👍', '💪', '👏', '🤗', '🥰', '😍', '🤩']
const errorEmo = ['🤷‍♀️', '🤦‍♀️', '🤔', '😲']
const updateEmo = ['🤟', '💃', '✨', '🔥', '💥', '🎉', '🤘', '🤙']

function random(items: string[]) {
  return items[Math.floor(Math.random() * items.length)]
}

export {
  errorEmo,
  random,
  successEmo,
  updateEmo,
}