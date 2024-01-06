import Docker from 'dockerode'

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default class DockerService {
  async listAllContainers() {
    const containers = await docker.listContainers({ all: true });
    return Promise.all(containers.map(async (container) => {
      return await this.getContainerDetails(container.Id);
    }));
  }

  async getContainerDetails(containerId: string) {
    const container = docker.getContainer(containerId);
    const details = await container.inspect();
    const stats = await container.stats({ stream: false });

    return {
      id: containerId,
      name: details.Name,
      image: details.Config.Image,
      state: details.State.Status,
      cpuUsage: stats.cpu_stats.cpu_usage.total_usage,
      memoryUsage: stats.memory_stats.usage,
    };
  }
}
