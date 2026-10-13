import type { APIRoute, GetStaticPaths } from 'astro';
import { heavyCharts } from '../../lib/charts';

export const getStaticPaths: GetStaticPaths = () =>
  heavyCharts().map(({ file, svg }) => ({ params: { file }, props: { svg } }));

export const GET: APIRoute = ({ props }) =>
  new Response(props.svg as string, { headers: { 'Content-Type': 'image/svg+xml; charset=utf-8' } });
