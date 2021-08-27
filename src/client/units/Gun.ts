import { UnitDefinition } from "@rbxts/fabric";
import { Players } from "@rbxts/services";

interface Gun extends UnitDefinition<"Gun"> {}

declare global {
	interface FabricUnits {
		Gun: Gun;
	}
}

const player = Players.LocalPlayer;

export = identity<Gun>({
	name: "Gun",

	units: {
		HitScan: {},
	},

	onInitialize: function (this) {
		player.GetMouse().Button1Down.Connect(() => {
			this.getUnit("HitScan")?.on_active_event();
		});
	},
});
