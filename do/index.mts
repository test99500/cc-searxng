import { DurableObject } from 'cloudflare:workers';
import type { EnvVars } from '~/types.mjs';
import { proxyFetch, startAndWaitForPort } from '~do/containerHelpers.mjs';

export class ContainerSidecar<E extends object = EnvVars> extends DurableObject<E> {
	public static OPEN_CONTAINER_PORT = 8080;
	private startupTime = 0;

	constructor(ctx: ContainerSidecar<E>['ctx'], env: ContainerSidecar<E>['env']) {
		super(ctx, env);

		if (ctx.container) {
			// eslint-disable-next-line @typescript-eslint/no-floating-promises
			ctx.blockConcurrencyWhile(async () => {
				const startTime = performance.now();
				await startAndWaitForPort(ctx.container!, ContainerSidecar.OPEN_CONTAINER_PORT);
				// Don't count the extra 300ms delay from `startAndWaitForPort`'s `setTimeout`
				this.startupTime = performance.now() - startTime - 300;
			});
		} else {
			throw new Error('Container context not available');
		}
	}

	private static buildServerTimingHeader(metrics: Record<string, number>): string {
		return Object.entries(metrics)
			.map(([name, dur]) => `${name};dur=${dur.toFixed(20).replace(/\.0*$/i, '')}`)
			.join(', ');
	}

	override async fetch(request: Request) {
		if (this.ctx.container) {
			const start = performance.now();
			const response = await proxyFetch(this.ctx.container, request, ContainerSidecar.OPEN_CONTAINER_PORT);
			const duration = performance.now() - start;

			// New response for mutable headers (no body manipulation)
			const newResponse = new Response(response.body, response);
			newResponse.headers.set('Server-Timing-CC', ContainerSidecar.buildServerTimingHeader({ startup: this.startupTime, proxy: duration }));

			return newResponse;
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
