/**
 * @module Integration
 *
 */
export default ((...[_Option = {}]: Parameters<Type>) => {
	Object.entries(_Option).forEach(([Key, Value]) =>
		Object.defineProperty(_Option, Key, {
			value:
				Value === true
					? Default[Key as keyof typeof Default]
					: _Option[Key as keyof typeof _Option],
		}),
	);

	const { Path, Cache, Logger, Exclude, Action, Biome } = Merge(
		Default,
		_Option,
	);

	const Paths = new Set<Path>();

	if (typeof Path !== "undefined") {
		if (Array.isArray(Path) || Path instanceof Set) {
			Path.forEach((Path) => Paths.add(Path));
		}
	}

	return {
		name: "astro-biome",
		hooks: {
			"astro:build:done": async ({ dir: Dir }) => {
				if (!Paths.size) {
					Paths.add(Dir);
				}

				const _Biome = await (
					await import("@biomejs/js-api")
				).Biome.create({
					distribution: (await import("@biomejs/js-api")).Distribution
						.NODE,
				});

				const _Action = Merge(Action, {
					Wrote: async (On) => {
						try {
							return _Biome.formatContent(On.Buffer.toString(), {
								filePath: (await import("path")).resolve(
									On.Input,
								),
							}).content;
						} catch (_Error) {
							return On.Buffer;
						}
					},
				} satisfies Action);

				try {
					if (typeof Biome === "object" && _Biome) {
						// @ts-ignore
						Biome["$schema"] = undefined;
						_Biome.applyConfiguration(Biome);
					}
				} catch (_Error) {
					console.log(_Error);
				}

				for (const Path of Paths) {
					await (
						await (
							await (
								await new (
									await import("files-pipe")
								).default(Cache, Logger).In(Path)
							).By("**/*.{js,mjs,cjs,ts,json}")
						).Not(Exclude)
					).Pipe(_Action);
				}
			},
		},
	};
}) satisfies Type as Type;

import type Type from "../Interface/Integration.js";

import type Action from "files-pipe/Target/Interface/Action.js";
import type Path from "files-pipe/Target/Type/Path.js";

export const { default: Default } = await import("../Variable/Option.js");

export const { default: Merge } = await import(
	"typescript-esbuild/Target/Function/Merge.js"
);
