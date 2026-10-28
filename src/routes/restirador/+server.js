import { redirect } from '@sveltejs/kit';

// The Restirador opens on its first sheet; the selector up top switches type.
export function GET() {
	redirect(307, '/restirador/flowchart');
}
