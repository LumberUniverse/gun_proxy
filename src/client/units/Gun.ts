import { UnitDefinition } from "@rbxts/fabric";
import { match } from "@rbxts/rbxts-pattern";
import { Option } from "@rbxts/rust-classes";
import { Players, RunService, UserInputService } from "@rbxts/services";
import { interval, noYield } from "@rbxts/yessir";
import { Config, Mode } from "shared/Types";
import { create_view_model } from "../create_view_model";

const player = Players.LocalPlayer;
const mouse = player.GetMouse();

interface Gun extends UnitDefinition<"Gun"> {
	ref?: Tool & {
		Handle: BasePart & {
			LeftArmAttach: Attachment;
			RightArmAttach: Attachment;
		};
	};

	units: {
		Cam: {
			current_camera_cframe: CFrame;
			camera_type: Enum.CameraType;
			right_handed: boolean;
		};
		HitScan: {};
	};

	defaults?: Config;
}

declare global {
	interface FabricUnits {
		Gun: Gun;
	}
}

export = identity<Gun>({
	name: "Gun",

	units: {
		Cam: {
			current_camera_cframe: new CFrame(),
			camera_type: Enum.CameraType.Custom,
			right_handed: true,
		},
		HitScan: {},
	},

	defaults: {
		fire_rate: 1,
		recoil: 1,
		max_distance: 1,
		mode: Mode.Burst,
		damage: 1,
		weight: 1,
	},

	onInitialize: function (this) {
		let Camera = this.getUnit("Cam")
		
		if (!this.ref || !Camera) return;

		const equipped = false;

		UserInputService.InputBegan.Connect(({ UserInputType }) => {
			if (UserInputType !== Enum.UserInputType.MouseButton1 && !equipped) return;

			const character = player.Character;
			if (character) {
				const ray_cast = (active_recoil?: number) => {
					this.getUnit("HitScan")?.hit?.([character], this.getUnit("Cam")!.ref.CFrame, mouse.Hit.Position, {
						...this.data!,
						recoil: active_recoil ?? this.defaults!.recoil,
					});
				};
				
				if (Camera) {
					Camera.last_shot = Option.some<number>(os.clock());
				}

				match(this.get("mode"))
					.with(Mode.Auto, () => {
						const { event, callback } = interval(1 / this.get("fire_rate"), ray_cast);

						const connection = event.connect(() => callback(os.clock()));

						UserInputService.InputEnded.Connect(({ UserInputType }) => {
							return UserInputType === Enum.UserInputType.MouseButton1
								? connection.disconnect()
								: undefined;
						});
					})
					.with(Mode.Burst, () => {})
					.with(Mode.Semi, () => ray_cast())
					.run();
			}
		});

		Camera.change_view_model(create_view_model(this));

		RunService.RenderStepped.Connect(() => {
			if (!Camera) return;
			Camera.adjust_camera()
		});
	},

	effects: [
		function (this) {
			const humanoid = player.Character?.FindFirstChildOfClass("Humanoid");

			if (humanoid) {
				humanoid.WalkSpeed -= this.get("weight");
			}
		},
	],
});
