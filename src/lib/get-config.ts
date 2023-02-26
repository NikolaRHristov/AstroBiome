import * as fs from "fs";
import { dirname, resolve } from "path";
import { cwd } from "process";
import { fileURLToPath } from "url";

export default async (file: string) => {
	const fileWorking = resolve(`${cwd()}/${file}`);

	let config = fs
		.readFileSync(
			resolve(
				`${dirname(fileURLToPath(import.meta.url))}/../config/${file}`
			),
			"utf-8"
		)
		.toString();

	try {
		await fs.promises.access(fileWorking, fs.constants.R_OK);
		config = fs.readFileSync(fileWorking, "utf-8").toString();
	} catch (_error) {
		console.log(_error);
	}

	return config;
};
