import { ThisFabricUnit, UnitDefinition } from "@rbxts/fabric";
import { Workspace } from "@rbxts/services";

export = identity<FabricUnits["HitScan"]>({
	name: "HitScan",

	units: {
		Replicated: {},
	},

	defaults: {},

	onClientHit: function (this, player, { target }) {},

	effects: [
		function (this) {
			this.get("target");
		},
	],
});
