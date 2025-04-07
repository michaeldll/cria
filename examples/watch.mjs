import * as esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { glsl } from "esbuild-plugin-glsl";
import { detect } from 'detect-port';

let ctx = await esbuild.context({
	plugins: [sassPlugin({ type: "style" }), glsl({ minify: false })],
	entryPoints: ["example.ts"], // add "scss/global.scss" here if using SCSS
	bundle: true,
	outdir: "public",
	define: {
		"window.IS_PRODUCTION": "false",
	},
});

await ctx.watch();

let targetPort = 1234;

try {
	let realPort = await detect(targetPort);
	console.log(realPort);

	if (targetPort !== realPort) {
		console.log(`port: ${targetPort} was occupied, trying port: ${realPort}`);
		targetPort = realPort;
	}

	let { host, port } = await ctx.serve({
		servedir: "public",
		port: targetPort,
		keyfile: "https.key",
		certfile: "https.cert",
	});

	console.log(`running on https://${host}:${port}`);
} catch (err) {
	console.log(err);
}
