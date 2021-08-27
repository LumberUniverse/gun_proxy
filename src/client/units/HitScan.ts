import { ThisFabricUnit, UnitDefinition } from "@rbxts/fabric";
import { Workspace } from "@rbxts/services";

enum Mode {
	Semi,
	Auto,
}

interface ConfigurableSettings {
	fire_rate: number;
	recoil: number;
	max_distance: number;
	mode: Mode;
	damage: number;
}

interface TransmitData {
	target?: BasePart;
}

interface HitScan extends UnitDefinition<"HitScan"> {
	units: {
		Replicated: object;
	};

	defaults: {
		origin?: Vector3;
	};

	on_active_event?: (this: ThisFabricUnit<"HitScan">, ...parameters: Parameters<typeof ray_cast>) => void;

	onClientHit?: (this: ThisFabricUnit<"HitScan">, player: Player, transmit_data: TransmitData) => void;
}

interface ConfigurableSettings {
	max_distance: number;
}

function ray_cast(
	filter_list: Array<Instance>,
	origin_in_cframe: CFrame,
	end_position: Vector3,
	configurable_settings: ConfigurableSettings,
) {
	const ray_cast_parameters = new RaycastParams();
	ray_cast_parameters.FilterDescendantsInstances = filter_list;
	ray_cast_parameters.FilterType = Enum.RaycastFilterType.Blacklist;

	const direction = end_position.sub(origin_in_cframe.Position).Unit.mul(configurable_settings.max_distance);
	const ray_cast_result = Workspace.Raycast(origin_in_cframe.Position, direction, ray_cast_parameters);

	return function (ray_cast_builder: (cf: CFrame, instance?: Instance) => void) {
		return ray_cast_builder(origin_in_cframe, ray_cast_result?.Instance);
	};
}

export = identity<HitScan>({
	name: "HitScan",

	units: {
		Replicated: {},
	},

	defaults: {},

	on_active_event: function (this, ...parameters: Parameters<typeof ray_cast>) {
		ray_cast(...parameters)((origin, target_instance) => {
			this.getUnit("Transmitter")?.sendWithPredictiveLayer({ origin: origin }, "hit", {
				target: target_instance,
			});
		});
	},

	effects: [
		function (this) {
			this.get("origin");
		},
	],
});

declare global {
	interface FabricUnits {
		HitScan: HitScan;
	}
}
