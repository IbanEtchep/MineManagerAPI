import Docker from 'dockerode'


const docker = new Docker({ socketPath: '/var/run/docker.sock' });

export default class DockerService {
  async listAllContainers() {
    const containers = await docker.listContainers({ all: true });
    return Promise.all(containers.map(async (container) => {
      return await this.getContainerFromContainerInfo(container);
    }));
  }

  async getContainerFromContainerInfo(containerInfo: Docker.ContainerInfo) {
    const container = docker.getContainer(containerInfo.Id);
    const stats = await container.stats({ stream: false });

    return {
      id: containerInfo.Id,
      name: containerInfo.Names[0],
      image: containerInfo.Image,
      state: containerInfo.State,
      cpuUsage: await this.getCpuUsageInPercent(stats),
      memoryUsage: stats.memory_stats.usage,
    };
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
      cpuUsage: await this.getCpuUsageInPercent(stats),
      memoryUsage: stats.memory_stats.usage,
    };
  }

  async startContainer(containerId: string) {
    const container = docker.getContainer(containerId);
    await container.start();
  }

  async stopContainer(containerId: string) {
    const container = docker.getContainer(containerId);
    await container.stop();
  }

  async restartContainer(containerId: string) {
    const container = docker.getContainer(containerId);
    await container.restart();
  }

  async killContainer(containerId: string) {
    const container = docker.getContainer(containerId);
    await container.kill();
  }

  async getCpuUsageInPercent(stats:  Docker.ContainerStats) {
    const perCpuUsage = stats.cpu_stats.cpu_usage.percpu_usage;
    const numberCpus = perCpuUsage ? perCpuUsage.length : stats.cpu_stats.online_cpus;

    const cpuDelta = Math.max(stats.cpu_stats.cpu_usage.total_usage - stats.precpu_stats.cpu_usage.total_usage, 0);
    const systemDelta = Math.max(stats.cpu_stats.system_cpu_usage - stats.precpu_stats.system_cpu_usage, 0);

    let cpuUsage = 0;
    if (systemDelta > 0 && cpuDelta > 0) {
      cpuUsage = (cpuDelta / systemDelta) * numberCpus * 100;
      cpuUsage = parseFloat(cpuUsage.toFixed(2));
    }

    return cpuUsage;
  }
}
