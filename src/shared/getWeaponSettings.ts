import { Option } from "@rbxts/rust-classes";
import { Config, Mode } from "shared/Types";

const weaponsTable = identity<Record<string, Config>>({
	AK47: {
		fire_rate: 1,
		recoil: 1,
		max_distance: 100,
		mode: Mode.Auto,
		damage: 1,
		weight: 1,
	},
});

export const getWeaponSettings = (weaponName: keyof typeof weaponsTable) => Option.wrap(weaponsTable[weaponName]);
