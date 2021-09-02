export enum GunSide {
	Right,
	Left,
}

export enum Mode {
	Auto,
	Burst,
	Semi,
}

export interface Config {
	fire_rate: number;
	recoil: number;
	max_distance: number;
	mode: Mode;
	damage: number;
	weight: number;
}
