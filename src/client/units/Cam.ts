import { ThisFabricUnit, UnitDefinition } from "@rbxts/fabric";
import { Option } from "@rbxts/rust-classes";
import { Players, RunService, TweenService, Workspace } from "@rbxts/services";
import { GunSide } from "shared/Types";

const apply_bobbing = (add: number, speed: number, modifier: number) => math.sin(os.clock() * add * speed) * modifier;
const lerp_number = (a: number, b: number, t: number) => a + (b - a) * t;

interface Cam extends UnitDefinition<"Cam"> {
	ref: Camera;
	localPlayer: Player;
	character: Model | undefined;
	humanoid: Humanoid | undefined;

	last_shot: Option<number>;
	recoil_collected: number;

	defaults: {
		recoil_speed: number;
		recoil_height: number;
		offset: CFrame;

		current_camera_cframe: CFrame;
		view_model?: Instance;
		camera_type: Enum.CameraType;
		right_handed: boolean;
	};

	offset?: CFrame;

	change_view_model: (this: ThisFabricUnit<"Cam">, view_model: Instance) => void;

	aim_down_sight: (this: ThisFabricUnit<"Cam">, sight_attachment: Attachment) => void;

	aim_up: (this: ThisFabricUnit<"Cam">) => void;

	// We need to make a settings to change gun side, call this function!
	change_gun_side: (this: ThisFabricUnit<"Cam">, gun_side: GunSide) => void;

	adjust_camera: (this: ThisFabricUnit<"Cam">) => void;
}

declare global {
	interface FabricUnits {
		Cam: Cam;
	}
}

export = identity<Cam>({
	name: "Cam",
	ref: Workspace.CurrentCamera!,
	localPlayer: Players.LocalPlayer,
	character: Players.LocalPlayer.Character,
	humanoid: Players.LocalPlayer.Character?.FindFirstChildOfClass("Humanoid"),
	
	last_shot: Option.none<number>(),
	recoil_collected: 0,

	defaults: {
		recoil_speed: 9,
		recoil_height: 0.7,
		offset: new CFrame(0.5, -1.5, -2),

		current_camera_cframe: new CFrame(),
		camera_type: Enum.CameraType.Custom,
		right_handed: true,
	},

	onInitialize: function (this) {
		Workspace.GetPropertyChangedSignal("CurrentCamera").Connect(() => {
			this.ref = Workspace.CurrentCamera!;
		});

		this.offset = this.defaults.offset;

		this.localPlayer.CharacterAdded.Connect((character) => {
			this.character = character;
			this.humanoid = character?.FindFirstChildOfClass("Humanoid");
		})
		
		this.localPlayer = Players.LocalPlayer;
		this.character = this.localPlayer.Character;
		this.humanoid = this.character?.FindFirstChildOfClass("Humanoid");

		this.last_shot = Option.none<number>();
		this.recoil_collected = 0;
	},

	change_view_model: function (this, view_model) {
		this.addLayer("ViewModel", { view_model });
	},

	aim_down_sight: function (this, s) {
		for (let i = 0; i < 60; i++) {
			this.offset = this.offset?.Lerp(s.CFrame, i/60);
		}
		
		this.addLayer("Camera", { current_camera_cframe: s.CFrame, camera_type: Enum.CameraType.Scriptable });
	},

	aim_up: function (this) {
		this.removeLayer("Camera");
	},

	change_gun_side: function (this, side) {
		this.addLayer("gun_side", { right_handed: side === GunSide.Right });
	},

	adjust_camera: function(this) {
		const gun = this.get("view_model");
		const Humanoid = this.humanoid;
		const recoil_speed = this.defaults.recoil_speed;
		const recoil_height = this.defaults.recoil_height;
		const offset = this.offset;

		if (!gun) return;

		if (Humanoid && this.ref && Humanoid.RootPart && Humanoid.MoveDirection.Magnitude <= 0) {
			const now = os.time();
			const amount = -(math.cos(now) / 5);

			const recoil_amount =
				math.clamp(
					-recoil_speed *
						(os.clock() -
							this.last_shot.match(
								(n) => n,
								() => os.clock(),
							)) +
						recoil_height,
					-this.recoil_collected / recoil_speed,
					recoil_height,
				) ?? 0;

			const Goal = this.ref.CFrame.mul(
				CFrame.Angles(
					math.rad((recoil_amount <= 0 && this.recoil_collected <= 0 ? amount : 0) + recoil_amount),
					0,
					0,
				),
			);

			this.ref.CFrame = this.ref.CFrame.Lerp(Goal, 0.5);
			this.recoil_collected += recoil_amount;

			if (recoil_amount <= 0 && this.recoil_collected <= 0) {
				const X = math.cos(now * 9) / 5;
				const Y = math.abs(math.sin(now * 12)) / 5;
				const bobble = new Vector3(X, Y, 0).mul(
					math.min(1, Humanoid.RootPart.Velocity.Magnitude / Humanoid.WalkSpeed),
				);
				Humanoid.CameraOffset = Humanoid.CameraOffset.Lerp(bobble, 0.25);
			}
		} else if (Humanoid && this.ref && Humanoid.RootPart) {
			const recoil_amount = this.last_shot
				? math.clamp(
						-recoil_speed * (os.clock() - this.last_shot.expect("no last shot")) + recoil_height,
						-this.recoil_collected / recoil_speed,
						recoil_height,
				)
				: 0;
			this.ref.CFrame = this.ref.CFrame.Lerp(this.ref.CFrame.mul(CFrame.Angles(math.rad(recoil_amount), 0, 0)), 0.5);
			this.recoil_collected += recoil_amount;
		}

		if (this.ref && gun.FindFirstChild("Handle")) {
			const handle = gun.FindFirstChild("Handle") as Part;

			if (!handle) return

			handle.CFrame = this.ref.CFrame.mul(this.offset || this.defaults.offset);

			const left_arm = gun.FindFirstChild('LeftArm') as Part;
			const right_arm = gun.FindFirstChild('RightArm') as Part;

			left_arm.CFrame = (handle?.FindFirstChild("LeftArmAttach") as Attachment).WorldCFrame?.mul(CFrame.Angles(0, math.rad(180), 0))?.mul(
				new CFrame(left_arm.Size.X, 0, 0),
			);

			right_arm.CFrame = (handle?.FindFirstChild("RightArmAttach") as Attachment).WorldCFrame?.mul(CFrame.Angles(0, math.rad(180), 0))?.mul(
				new CFrame(right_arm.Size.X, 0, 0),
			);
		}
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
