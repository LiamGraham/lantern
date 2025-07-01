import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [index('routes/dashboard.tsx'), route('playground', 'routes/playground.tsx')] satisfies RouteConfig;
