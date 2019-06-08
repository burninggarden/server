import Net           from 'net';
import HTTP          from 'http';
import HTTPS         from 'https';
import NetworkMapper from '@burninggarden/network-mapper';
import PortAllocator from '@burninggarden/port-allocator';
import {ServerType}  from '@burninggarden/enums';

abstract class Server {

	private hostname      : string;
	private networkMapper : NetworkMapper;
	private httpPort      : number;
	private httpServer    : HTTP.Server;
	private httpsPort     : number;
	private httpsServer   : HTTPS.Server;
	private tcpPort       : number;
	private tcpServer     : Net.Server;

	public constructor() {
		this.assignHostname();
		this.assignPorts();
		this.assignNetworkMapping();

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

	private assignHostname(): void {
		if (!this.hasHostname()) {
			this.setHostname(this.getNetworkMapper().getHostname());
		}
	}

	private assignPorts(): void {
		const portAllocation = (new PortAllocator()).createPortAllocation();

		this.setHttpPort(portAllocation.getHttpPort());
		this.setTcpPort(portAllocation.getTcpPort());
	}

	private assignNetworkMapping(): void {
		this.getNetworkMapper().createLocalMapping({
			serverType: this.getServerType(),
			hostname:   this.getHostname(),
			httpPort:   this.getHttpPort(),
			tcpPort:    this.getTcpPort()
		});
	}

	protected requiresHttpServer(): boolean {
		return true;
	}

	protected requiresHttpsServer(): boolean {
		return false;
	}

	protected requiresTcpServer(): boolean {
		return false;
	}

	private initHttpServer(): void {
		const server = HTTP.createServer(this.handleHttpRequest.bind(this));

		this.setHttpServer(server);

		server.listen(
			this.getHttpPort(),
			this.handleHttpServerCreated.bind(this)
		);
	}

	protected initHttpsServer(): void {
		throw new Error('Must implement initHttpsServer() on child class');
	}

	private initTcpServer(): void {
		const server = Net.createServer(this.handleTcpConnection.bind(this));

		this.setTcpServer(server);

		server.listen(
			this.getTcpPort(),
			this.handleTcpServerCreated.bind(this)
		);
	}

	private handleHttpServerCreated(): void {
	}

	private handleHttpRequest(
		request: HTTP.IncomingMessage,
		response: HTTP.ServerResponse
	): void {
	}

	private handleTcpServerCreated(): void {
	}

	private handleTcpConnection(socket: Net.Socket): void {
	}

	private hasHostname() {
		return this.hostname !== undefined;
	}

	private getHostname(): string {
		return this.hostname;
	}

	private setHostname(hostname: string): this {
		this.hostname = hostname;
		return this;
	}

	private getHttpPort(): number {
		return this.httpPort;
	}

	private setHttpPort(port: number): this {
		this.httpPort = port;
		return this;
	}

	private getHttpsPort(): number {
		return this.httpsPort;
	}

	private setHttpsPort(port: number): this {
		this.httpsPort = port;
		return this;
	}

	private getTcpPort(): number {
		return this.tcpPort;
	}

	private setTcpPort(port: number) {
		this.tcpPort = port;
		return this;
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

	private getNetworkMapper(): NetworkMapper {
		if (!this.networkMapper) {
			this.networkMapper = new NetworkMapper();
		}

		return this.networkMapper;
	}

	protected abstract getServerType(): ServerType;

}

export default Server;
