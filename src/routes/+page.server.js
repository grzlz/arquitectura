import plugin from '../../plugins/art-vandeley/.claude-plugin/plugin.json';

// Read the crate version from the plugin itself so the cover never goes stale.
export const load = () => ({ version: plugin.version });
