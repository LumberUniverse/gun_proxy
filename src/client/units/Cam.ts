import { ThisFabricUnit, UnitDefinition } from "@rbxts/fabric";
import { TweenService, Workspace } from "@rbxts/services";
import { GunSide } from "shared/Types";

const apply_bobbing = (add: number, speed: number, modifier: number) => math.sin(os.clock() * add * speed) * modifier;
const lerp_number = (a: number, b: number, t: number) => a + (b - a) * t;

interface Cam extends UnitDefinition<"Cam"> {
	ref: Camera;

	defaults: {
		current_camera_cframe: CFrame;
		view_model?: Instance;
		camera_type: Enum.CameraType;
		right_handed: boolean;
	};

	change_view_model: (this: ThisFabricUnit<"Cam">, view_model: Instance) => void;

	aim_down_sight: (this: ThisFabricUnit<"Cam">, sight_attachment: Attachment) => void;

	aim_up: (this: ThisFabricUnit<"Cam">) => void;

	// We need to make a settings to change gun side, call this function!
	change_gun_side: (this: ThisFabricUnit<"Cam">, gun_side: GunSide) => void;
}

declare global {
	interface FabricUnits {
		Cam: Cam;
	}
}

export = identity<Cam>({
	name: "Cam",
	ref: Workspace.CurrentCamera!,

	defaults: {
		current_camera_cframe: new CFrame(),
		camera_type: Enum.CameraType.Custom,
		right_handed: true,
	},

	onInitialize: function (this) {
		Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
			this.ref = Workspace.CurrentCamera!;
		});
	},

	change_view_model: function (this, view_model) {
		this.addLayer("ViewModel", { view_model });
	},

	aim_down_sight: function (this, s) {
		this.addLayer("Camera", { current_camera_cframe: s.CFrame, camera_type: Enum.CameraType.Scriptable });
	},

	aim_up: function (this) {
		this.removeLayer("Camera");
	},

	change_gun_side: function (this, side) {
		this.addLayer("gun_side", { right_handed: side === GunSide.Right });
	},

	effects: [
		function (this) {
			this.ref.CFrame = this.get("current_camera_cframe");
			this.ref.CameraType = this.get("camera_type");
		},
		function (this) {
			const view_model = this.get("view_model");

			if (view_model) view_model.Parent = this.ref;
		},
	],
});
