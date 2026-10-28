// Matches a Restirador diagram slug — /restirador/<slug>, and the legacy /<slug> redirects.
import { findDiagram } from '$lib/restirador/diagrams.js';

export const match = (param) => Boolean(findDiagram(param));
