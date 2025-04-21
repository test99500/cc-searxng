import type { DurableObject } from 'cloudflare:workers';

export async function startAndWaitForPort(container: Container, portToAwait: number, maxTries = 10) {
	const port = container.getTcpPort(portToAwait);
	// promise to make sure the container does not exit
	let monitor;

	for (let i = 0; i < maxTries; i++) {
		try {
			if (!container.running) {
				container.start();

				// force DO to keep track of running state
				monitor = container.monitor();
			}

			await (await port.fetch('http://ping')).text();
			return;
		} catch (err: Error) {
			console.error('Error connecting to the container on', i, 'try', err);

			if (err.message.includes('listening')) {
				await new Promise((res) => setTimeout(res, 300));
				continue;
			}

			// no container yet
			if (err.message.includes('there is no container instance that can be provided')) {
				await new Promise((res) => setTimeout(res, 300));
				continue;
			}

			throw err;
		}
	}

	throw new Error(`could not check container healthiness after ${maxTries} tries`);
}

export function proxyFetch(container: Container, request: Request, portNumber: number) {
	return container.getTcpPort(portNumber).fetch(request.url.replace('https://', 'http://'), request.clone());
}

export function loadBalance<DO extends DurableObject>(containerBinding: DurableObjectNamespace<DO>, count: number) {
	const randomID = Math.floor(Math.random() * count);
	const id = containerBinding.idFromName('lb-' + randomID);
	return containerBinding.get(id);
}
