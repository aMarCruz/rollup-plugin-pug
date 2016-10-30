import login from './login.pug'

export default function () {
  const html = login({ appName: 'My App' })

  assert(html.contains('password'))
}
