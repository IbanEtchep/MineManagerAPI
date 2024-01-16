import DockerService from 'App/Services/DockerService'
import * as console from 'console'

export default class DockerController {
  async listContainers({ response }) {
    try {
      const dockerService = new DockerService();
      const containers = await dockerService.listAllContainers();
      return response.json(containers);
    } catch (err) {
      return response.status(500).send(err.message);
    }
  }

  async getContainer({ params, response }) {
    try {
      const dockerService = new DockerService();
      const container = await dockerService.getContainerDetails(params.id);
      return response.json(container);
    } catch (err) {
      return response.status(500).send(err.message);
    }
  }

  async startContainer({ params, response }) {
    try {
      const dockerService = new DockerService();
      await dockerService.startContainer(params.id);
      return response.send('OK');
    } catch (err) {
      console.log(err)
      return response.status(500).send(err.message);
    }
  }

  async stopContainer({ params, response }) {
    try {
      const dockerService = new DockerService();
      await dockerService.stopContainer(params.id);
      return response.send('OK');
    } catch (err) {
      console.log(err)
      return response.status(500).send(err.message);
    }
  }

  async restartContainer({ params, response }) {
    try {
      const dockerService = new DockerService();
      await dockerService.restartContainer(params.id);
      return response.send('OK');
    } catch (err) {
      console.log(err)
      return response.status(500).send(err.message);
    }
  }

  async killContainer({ params, response }) {
    try {
      const dockerService = new DockerService();
      await dockerService.killContainer(params.id);
      return response.send('OK');
    } catch (err) {
      console.log(err)
      return response.status(500).send(err.message);
    }
  }
}
