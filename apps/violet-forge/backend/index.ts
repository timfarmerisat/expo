import { router } from '@appdeploy/sdk';
import { routes } from './app';
import { systemRegistryRoutes } from './system-registry';

export const handler = router({ ...routes, ...systemRegistryRoutes });
