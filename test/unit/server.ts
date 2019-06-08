import Tap           from 'tap';
import Net           from 'net';
import Server        from 'server';
import Config        from '@burninggarden/config';
import {ServerType}  from '@burninggarden/enums';
import NetworkMapper from '@burninggarden/network-mapper';
import PortChecker   from '@burninggarden/port-checker';

class MockHttpServer extends Server {

	protected getServerType(): ServerType {
		return ServerType.API;
	}

	protected requiresHttpServer(): boolean {
		return true;
	}

	protected requiresTcpServer(): boolean {
		return false;
	}

}

class MockTcpServer extends Server {

	protected getServerType(): ServerType {
		return ServerType.GAME;
	}

	protected requiresHttpServer(): boolean {
		return false;
	}

	protected requiresTcpServer(): boolean {
		return true;
	}

	protected handleTcpConnection(socket: Net.Socket): void {
		// Overriding this method with a noop to prevent
		// the parent class's implementation from throwing
		// when we try to access the server's TCP port.
	}

}

Tap.test('server creates http binding if necessary', async test => {
	const server = new MockHttpServer();
	const port = server.getHttpPort();
	const portChecker = new PortChecker(port);

	const portInUse = await portChecker.isPortInUse();

	test.ok(portInUse);

	server.shutdown().then(test.end);
});

Tap.test('server does not create http binding if unnecessary', async test => {
	const server = new MockTcpServer();
	const port = server.getHttpPort();
	const portChecker = new PortChecker(port);

	const portInUse = await portChecker.isPortInUse();

	test.notOk(portInUse);

	server.shutdown().then(test.end);
});

Tap.test('server creates tcp binding if necessary', async test => {
	const server = new MockTcpServer();
	const port = server.getTcpPort();
	const portChecker = new PortChecker(port);

	const portInUse = await portChecker.isPortInUse();

	test.ok(portInUse);

	server.shutdown().then(test.end);
});

Tap.test('server does not create tcp binding if unnecessary', async test => {
	const server = new MockHttpServer();
	const port = server.getTcpPort();
	const portChecker = new PortChecker(port);

	const portInUse = await portChecker.isPortInUse();

	test.notOk(portInUse);

	server.shutdown().then(test.end);
});

/*
Tap.test('server creates https binding if necessary', test => {
	test.end();
});

Tap.test('server does not create https binding if unnecessary', test => {
	test.end();
});
*/

Tap.test('server assigns local network mapping', test => {
	const server = new MockHttpServer();
	const networkMapper = NetworkMapper.getInstance();
	const mapping = networkMapper.getMappingForServerType(ServerType.API);

	test.deepEqual(mapping, {
		serverType: ServerType.API,
		hostname:   server.getHostname(),
		httpPort:   server.getHttpPort(),
		tcpPort:    server.getTcpPort()
	});

	server.shutdown().then(test.end);
});

Tap.test('.getHttpPort() returns expected value, even if http server was not created', test => {
	const server = new MockTcpServer();

	test.equal(typeof server.getHttpPort(), 'number');
	server.shutdown().then(test.end);
});

Tap.test('.getTcpPort() returns expected value, even if tcp server was not created', test => {
	const server = new MockHttpServer();

	test.equal(typeof server.getTcpPort(), 'number');
	server.shutdown().then(test.end);
});

Tap.test('.getHttpsPort() returns expected value, even if https server was not created', test => {
	const server = new MockTcpServer();

	test.equal(server.getHttpsPort(), Config.getHttpsPort());
	server.shutdown().then(test.end);
});
