import Tap           from 'tap';
import Net           from 'net';
import Server        from 'server';
import {ServerType}  from '@burninggarden/enums';
import NetworkMapper from '@burninggarden/network-mapper';

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

}

function getHttpPort(): number {
	const mapper = new NetworkMapper();
	const mapping = mapper.createLocalMappingForServerType(ServerType.API);

	return mapping.httpPort;
}

Tap.test('server creates http binding if necessary', async test => {
	const server = new MockHttpServer();

	const portInUse = await isPortInUse(getHttpPort());

	test.ok(portInUse);
	test.end();
});

Tap.test('server does not create http binding if unnecessary', test => {
});

Tap.test('server creates tcp binding if necessary', test => {
});

Tap.test('server does not create tcp binding if unnecessary', test => {
});

Tap.test('server creates https binding if necessary', test => {
});

Tap.test('server does not create https binding if unnecessary', test => {
});

Tap.test('server assigns local network mapping', test => {
});
