const successEmo = ['🤟', '🤘', '🤙', '👌', '👍', '💪', '👏', '🤗', '🥰', '😍', '🤩']
const errorEmo = ['🤷‍♀️', '🤦‍♀️', '🤔', '😲']

function random<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!
}

export {
  errorEmo,
  random,
  successEmo,
}
