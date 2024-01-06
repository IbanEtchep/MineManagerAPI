import DockerService from 'App/Services/DockerService'

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
}
