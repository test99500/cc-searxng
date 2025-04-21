import { WorkerEntrypoint } from 'cloudflare:workers';
import type { EnvVars } from './types.mjs';

export { ContainerSidecar } from '~do/index.mjs';

export default class extends WorkerEntrypoint<EnvVars> {}
