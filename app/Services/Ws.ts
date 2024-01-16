import { Server } from 'socket.io';
import AdonisServer from '@ioc:Adonis/Core/Server';
import Docker from 'dockerode';
import schedule from 'node-schedule';
import DockerService from 'App/Services/DockerService'


class Ws {
  public io: Server;
  private booted = false;
  private clientSubscriptions = new Map(); // Map to track client subscriptions
  private docker = new Docker(); // Docker instance
  private dockerService = new DockerService();

  public boot() {
    if (this.booted) {
      return;
    }

    this.booted = true;
    this.io = new Server(AdonisServer.instance!, {
      cors: {
        origin: '*',
      },
    });

    console.log('Websocket server started')

    this.startScheduler();

    this.io.on('connection', (socket) => {
      console.log(`Client ${socket.id} connected`);

      socket.on('subscribe', (data) => {
        const containerId = data.containerId;
        console.log(`Client ${socket.id} subscribed to ${containerId}`)
        this.subscribeClientToContainer(socket.id, containerId);
      });

      socket.on('disconnect', () => {
        console.log(`Client ${socket.id} disconnected`);
        this.clientSubscriptions.delete(socket.id);
      });
    });

    this.listenDockerEvents();
    //subscribe to a915fc2450a2bcc4670910d77c7d80c8dc246349f81ad3d0e8e38ddc8c35174c
    // this.subscribeClientToContainer('a915fc2450a2bcc4670910d77c7d80c8dc246349f81ad3d0e8e38ddc8c35174c', 'f92ee5dfd9d61b9b34a7cf88fc4085f161fb9cd443783d870c12aa0b348691c8');
  }

  private subscribeClientToContainer(clientId: string, containerId: string) {
    console.log(`Subscribing client ${clientId} to container ${containerId}`);
    if (!this.clientSubscriptions.has(clientId)) {
      this.clientSubscriptions.set(clientId, []);
    }
    this.clientSubscriptions.get(clientId).push(containerId);
    this.followContainerLogs(containerId, clientId, 30);
  }

  private listenDockerEvents() {
    this.docker.getEvents({}, (err, stream) => {
      if (err) {
        console.error(err);
        return;
      }

      if (!stream) {
        console.error('No stream');
        return;
      }

      stream.on('data', (data) => {
        const event = JSON.parse(data.toString('utf8'));
        if (event.Type === 'container') {
          this.handleContainerEvent(event);
        }
      });
    });
  }

  private handleContainerEvent(event) {
    const containerId = event.id;
    const state = event.status;

    this.clientSubscriptions.forEach((subscriptions, clientId) => {
      if (subscriptions.includes(containerId)) {
        if (state === 'start' || state === 'restart') {
          this.followContainerLogs(containerId, clientId);
        }
      }
    });
  }

  public startScheduler() {
    schedule.scheduleJob('* * * * * *', async () => {
      for (let [clientId, containerIds] of this.clientSubscriptions) {
        for (let containerId of containerIds) {
          const containerDetails = await this.dockerService.getContainerDetails(containerId);
          this.io.to(clientId).emit('container-info', containerDetails);
          console.log(`Sending container info to ${clientId} for container ${containerId}`);
        }
      }
    });
  }

  private followContainerLogs(containerId: string, clientId: string | string[], tail = 0) {
    const container = this.docker.getContainer(containerId);

    container.logs({
      follow: true,
      stdout: true,
      stderr: true,
      tail: tail,
    }, (err, stream) => {
      if (err) {
        console.error(err);
        return;
      }

      if (!stream) {
        console.error('No stream');
        return;
      }

      const onData = (line) => {
        const client = this.clientSubscriptions.get(clientId);
        if (!client) {
          return;
        }

        let cleanLine = line.toString().replace(/\uFFFD/g, ' ').replace(/\n/g, '').trim();
        if (client.includes(containerId)) {
          this.io.to(clientId).emit('log', { containerId, log: cleanLine });
        }
      };

      stream.on('data', onData);

      stream.on('end', () => {
        console.log('Stream ended');
      });
    });
  }

}

export default new Ws();
