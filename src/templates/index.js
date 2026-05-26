import { renderVertex } from './vertex.js';
import { renderAtlas } from './atlas.js';
import { renderPulse } from './pulse.js';
import { renderClassic } from './classic.js';
import { renderExecutive } from './executive.js';
import { renderCreative } from './creative.js';
import { renderMinimal } from './minimal.js';

export const TEMPLATE_RENDERERS = {
  vertex: renderVertex,
  atlas: renderAtlas,
  pulse: renderPulse,
  classic: renderClassic,
  executive: renderExecutive,
  creative: renderCreative,
  minimal: renderMinimal,
};
