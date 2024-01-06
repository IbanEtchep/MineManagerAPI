import { test } from '@japa/runner'
import User from 'App/Models/User'


test.group('Auth', (group) => {
  group.teardown(async () => {
      await User.query()
        .where('email', 'test@test.fr')
        .delete()
  })

  test('create account', async ({ client }) => {
    const response = await client.post('users').json({
      email: 'test@test.fr',
      username: 'test',
      password: 'test',
    }).send()

    response.assertStatus(201)
  })

  //login
  test('login', async ({ client }) => {
    const response = await client.post('sessions').json({
      email: 'test@test.fr',
      password: 'test',
    }).send()

    response.assertStatus(200)
  })

  test('get user details', async ({ client }) => {
    const user = await User.findBy('email', 'test@test.fr')

    if(!user) {
      return
    }

    const response = await client.get('/me')
      .loginAs(user)

    response.assertStatus(200)
  })

  test('update user details', async ({ client, assert }) => {
    const user = await User.findBy('email', 'test@test.fr')

    if(!user) {
      return
    }

    const response = await client.put('/users')
      .loginAs(user)
      .json({
        username: 'test2',
      })
      .send()

    response.assertStatus(200)

    const updatedUser = await User.find(user?.id)
    assert.equal(updatedUser?.username, 'test2')
  })

  test('logout', async ({ client }) => {
    const user = await User.findBy('email', 'test@test.fr')

    if(!user) {
      return
    }

    const response = await client.delete('/sessions')
      .loginAs(user)
      .send()

    response.assertStatus(204)
  })
})
