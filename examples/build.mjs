import esbuild from "esbuild";
import { sassPlugin } from "esbuild-sass-plugin";
import { glsl } from "esbuild-plugin-glsl";

esbuild.build({
	plugins: [sassPlugin({ type: "style" }), glsl({ minify: true })],
	entryPoints: ["example.ts", "scss/global.scss"],
	bundle: true,
	outdir: "public",
	define: {
		"window.IS_PRODUCTION": "true",
	},
	minify: true,
});

console.log("build complete");
