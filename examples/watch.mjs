import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { glsl } from "esbuild-plugin-glsl";

let ctx = await esbuild.context({
	plugins: [sassPlugin({ type: "style" }), glsl({ minify: false })],
	entryPoints: ["example.ts", "scss/global.scss"],
	bundle: true,
	outdir: "public",
	define: {
		"window.IS_PRODUCTION": "false",
	},
});

await ctx.watch();

let { host, port } = await ctx.serve({
	servedir: "public",
	port: 1234,
	keyfile: "https.key",
	certfile: "https.cert",
});

console.log(`running on https://${host}:${port}`);
