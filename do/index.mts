import { DurableObject } from 'cloudflare:workers';
import type { EnvVars } from '~/types.mjs';
import { proxyFetch, startAndWaitForPort } from './containerHelpers.mjs';

export class ContainerSidecar<E extends object = EnvVars> extends DurableObject<E> {
	public static OPEN_CONTAINER_PORT = 8080;

	constructor(ctx: ContainerSidecar<E>['ctx'], env: ContainerSidecar<E>['env']) {
		super(ctx, env);

		if (ctx.container) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			ctx.blockConcurrencyWhile(async () => {
				await startAndWaitForPort(ctx.container!, ContainerSidecar.OPEN_CONTAINER_PORT);
			});
		} else {
			throw new Error('Container context not available');
		}
	}

	override async fetch(request: Request) {
		if (this.ctx.container) {
			return await proxyFetch(this.ctx.container, request, ContainerSidecar.OPEN_CONTAINER_PORT);
		} else {
			return new Response('Container not available', {
				status: 503,
				headers: {
					'Content-Type': 'text/plain',
				},
			});
		}
	}
}
