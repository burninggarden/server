import Net            from 'net';
import HTTP           from 'http';
import HTTPS          from 'https';
import Config         from '@burninggarden/config';
import PromiseWrapper from '@burninggarden/promise-wrapper';
import {
	ServerType,
	ServerStatus
} from '@burninggarden/enums';
import NetworkMapper, {
	NetworkMapping
} from '@burninggarden/network-mapper';

abstract class Server {

	private networkMapper     : NetworkMapper;
	private networkMapping    : NetworkMapping;
	private httpServer        : HTTP.Server;
	private tcpServer         : Net.Server;
	private httpsServer       : HTTPS.Server;
	private httpServerStatus  : ServerStatus = ServerStatus.NOT_STARTED;
	private tcpServerStatus   : ServerStatus = ServerStatus.NOT_STARTED;
	private httpsServerStatus : ServerStatus = ServerStatus.NOT_STARTED;

	public constructor() {
		this.createNetworkMapping();

		if (this.requiresHttpServer()) {
			this.initHttpServer();
		}

		if (this.requiresHttpsServer()) {
			this.initHttpsServer();
		}

		if (this.requiresTcpServer()) {
			this.initTcpServer();
		}
	}

	public getHttpPort(): number {
		return this.getNetworkMapping().httpPort;
	}

	public getHttpsPort(): number {
		return (new Config()).getHttpsPort();
	}

	public getTcpPort(): number {
		return this.getNetworkMapping().tcpPort;
	}

	public getHostname(): string {
		return this.getNetworkMapping().hostname;
	}

	public shutdown(): Promise<any> {
		const promises = [];

		if (this.requiresHttpServer()) {
			promises.push(this.shutdownHttpServer());
		}

		if (this.requiresTcpServer()) {
			promises.push(this.shutdownTcpServer());
		}

		if (this.requiresHttpsServer()) {
			promises.push(this.shutdownHttpsServer());
		}

		return Promise.all(promises);
	}

	protected requiresHttpServer(): boolean {
		return true;
	}

	protected requiresTcpServer(): boolean {
		return false;
	}

	protected requiresHttpsServer(): boolean {
		return false;
	}

	protected initHttpsServer(): void {
		throw new Error('Must implement initHttpsServer() on child class');
	}

	private createNetworkMapping(): void {
		const
			mapper     = this.getNetworkMapper(),
			serverType = this.getServerType();

		this.networkMapping = mapper.createLocalMappingForServerType(serverType);
	}

	private initHttpServer(): void {
		const server = HTTP.createServer(this.handleHttpRequest.bind(this));

		this.setHttpServer(server);
		this.setHttpServerStatus(ServerStatus.STARTING);

		server.listen(
			this.getHttpPort(),
			this.handleHttpServerCreated.bind(this)
		);
	}

	private handleHttpServerCreated(): void {
		this.setHttpServerStatus(ServerStatus.LISTENING);
	}

	private handleHttpRequest(
		request: HTTP.IncomingMessage,
		response: HTTP.ServerResponse
	): void {
	}

	private shutdownHttpServer(): Promise<any> {
		this.setHttpServerStatus(ServerStatus.STOPPING);

		const promiseWrapper = new PromiseWrapper();
		const httpServer = this.getHttpServer();

		httpServer.close(error => {
			if (error) {
				this.setHttpServerStatus(ServerStatus.CRASHED);
				promiseWrapper.reject(error);
			} else {
				this.setHttpServerStatus(ServerStatus.STOPPED);
				promiseWrapper.resolve(undefined);
			}
		});

		return promiseWrapper.getPromise();
	}

	private getHttpServer(): HTTP.Server {
		if (!this.httpServer) {
			throw new Error('Tried to access HTTP server, but it was not set');
		}

		return this.httpServer;
	}

	private setHttpServer(httpServer: HTTP.Server): this {
		this.httpServer = httpServer;
		return this;
	}

	private setHttpServerStatus(serverStatus: ServerStatus): this {
		this.httpServerStatus = serverStatus;
		return this;
	}

	private initTcpServer(): void {
		const server = Net.createServer(this.handleTcpConnection.bind(this));

		this.setTcpServer(server);
		this.setTcpServerStatus(ServerStatus.STARTING);

		server.listen(
			this.getTcpPort(),
			this.handleTcpServerCreated.bind(this)
		);
	}

	private handleTcpServerCreated(): void {
		this.setTcpServerStatus(ServerStatus.LISTENING);
	}

	private handleTcpConnection(socket: Net.Socket): void {
	}

	private shutdownTcpServer(): Promise<any> {
		this.setTcpServerStatus(ServerStatus.STOPPING);

		const promiseWrapper = new PromiseWrapper();
		const tcpServer = this.getTcpServer();

		tcpServer.close(error => {
			if (error) {
				this.setTcpServerStatus(ServerStatus.CRASHED);
				promiseWrapper.reject(error);
			} else {
				this.setTcpServerStatus(ServerStatus.STOPPED);
				promiseWrapper.resolve(undefined);
			}
		});

		return promiseWrapper.getPromise();
	}

	private getTcpServer(): Net.Server {
		if (!this.tcpServer) {
			throw new Error('Tried to access TCP server, but it was not set');
		}

		return this.tcpServer;
	}

	private setTcpServer(tcpServer: Net.Server): this {
		this.tcpServer = tcpServer;
		return this;
	}

	private setTcpServerStatus(serverStatus: ServerStatus): this {
		this.tcpServerStatus = serverStatus;
		return this;
	}

	private shutdownHttpsServer(): Promise<any> {
		this.setHttpsServerStatus(ServerStatus.STOPPING);

		const promiseWrapper = new PromiseWrapper();
		const httpsServer = this.getHttpsServer();

		httpsServer.close(error => {
			if (error) {
				this.setHttpsServerStatus(ServerStatus.CRASHED);
				promiseWrapper.reject(error);
			} else {
				this.setHttpsServerStatus(ServerStatus.STOPPED);
				promiseWrapper.resolve(undefined);
			}
		});

		return promiseWrapper.getPromise();
	}

	private getHttpsServer(): HTTPS.Server {
		if (!this.httpsServer) {
			throw new Error('Tried to access HTTPS server, but it was not set');
		}

		return this.httpsServer;
	}

	private setHttpsServer(httpsServer: HTTPS.Server): this {
		this.httpsServer = httpsServer;
		return this;
	}

	private setHttpsServerStatus(serverStatus: ServerStatus): this {
		this.httpsServerStatus = serverStatus;
		return this;
	}

	private getNetworkMapper(): NetworkMapper {
		if (!this.networkMapper) {
			this.networkMapper = NetworkMapper.getInstance();
		}

		return this.networkMapper;
	}

	private getNetworkMapping(): NetworkMapping {
		return this.networkMapping;
	}

	protected abstract getServerType(): ServerType;

}

export default Server;
