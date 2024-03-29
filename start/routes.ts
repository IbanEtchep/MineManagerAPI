/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return { hello: 'world' }
})

Route.post('users', 'AuthController.register')
Route.post('sessions', 'AuthController.login')
Route.delete('sessions', 'AuthController.logout').middleware('auth')
Route.get('me', 'AuthController.me').middleware('auth')
Route.put('users', 'AuthController.update').middleware('auth')

Route.get('docker/containers', 'DockerController.listContainers').middleware('auth')
Route.get('docker/containers/:id', 'DockerController.getContainer').middleware('auth')
Route.post('docker/containers/:id/start', 'DockerController.startContainer').middleware('auth')
Route.post('docker/containers/:id/stop', 'DockerController.stopContainer').middleware('auth')
Route.post('docker/containers/:id/restart', 'DockerController.restartContainer').middleware('auth')
Route.post('docker/containers/:id/kill', 'DockerController.killContainer').middleware('auth')
Route.post('docker/containers/:id/command', 'DockerController.commandContainer').middleware('auth')
