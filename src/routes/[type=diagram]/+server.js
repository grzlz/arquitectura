import { redirect } from '@sveltejs/kit';

// The editors lived at /<type> before the Restirador gathered them under one roof.
export function GET({ params }) {
	redirect(301, `/restirador/${params.type}`);
}
