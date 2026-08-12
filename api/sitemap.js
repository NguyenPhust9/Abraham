export default async function handler(req, res) {
	const SUPABASE_URL = "https://bqowjqqnpeiwoaaczybg.supabase.co";
	const SUPABASE_KEY = "sb_publishable_xqesJg10fSssMRE6xyc3-A_J0y94QtK";

	const [productsRes, postsRes] = await Promise.all([
		fetch(`${SUPABASE_URL}/rest/v1/products?select=id,updated_at&is_active=eq.true`, {
			headers: { apikey: SUPABASE_KEY }
		}),
		fetch(`${SUPABASE_URL}/rest/v1/posts?select=slug,updated_at&is_published=eq.true`, {
			headers: { apikey: SUPABASE_KEY }
		})
	]);

	const products = await productsRes.json();
	const posts = await postsRes.json();

	const baseUrl = "https://abrahambike.vn"; // đổi thành domain thật của bạn

	const staticPages = ["", "shop", "about", "services", "blog", "contact"];

	const urls = [
		...staticPages.map(p => `
			<url>
				<loc>${baseUrl}/${p}</loc>
				<changefreq>weekly</changefreq>
			</url>`),
		...products.map(p => `
			<url>
				<loc>${baseUrl}/product-detail?id=${p.id}</loc>
				<lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
				<changefreq>weekly</changefreq>
			</url>`),
		...posts.map(p => `
			<url>
				<loc>${baseUrl}/blog-post?slug=${p.slug}</loc>
				<lastmod>${new Date(p.updated_at).toISOString()}</lastmod>
				<changefreq>monthly</changefreq>
			</url>`)
	].join("");

	const xml = `<?xml version="1.0" encoding="UTF-8"?>
		<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
			${urls}
		</urlset>`;

	res.setHeader("Content-Type", "application/xml");
	res.status(200).send(xml);
}