import type { SecureHeadersVariables } from 'hono/secure-headers';
import type { TimingVariables } from 'hono/timing';
import type { ContainerSidecar } from '~do/index.mjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EnvVars extends Secrets, Bindings, Record<string, any> {
	CF_ACCOUNT_ID: string;
	GIT_HASH: string;
	ENVIRONMENT: 'production' | 'preview';
	NODE_ENV: 'production' | 'development';
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface Secrets {}

interface Bindings {
	CONTAINER_SIDECAR: DurableObjectNamespace<ContainerSidecar>;
}

export type HonoVariables = TimingVariables & SecureHeadersVariables;
