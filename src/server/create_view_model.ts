import Unit from "@rbxts/fabric/src/FabricLib/Fabric/Unit";
import { Option } from "@rbxts/rust-classes";
import { Players, RunService, Workspace } from "@rbxts/services";

enum ArmSide {
	Right = "Right",
	Left = "Left",
}

function create_arm(name: ArmSide) {
	const Camera = Workspace.CurrentCamera;

	const actionArm = new Instance("Part");
	actionArm.Parent = Camera;
	actionArm.Name = name;
	actionArm.Anchored = true;
	actionArm.CanCollide = false;
	actionArm.CanTouch = false;
	actionArm.Material = Enum.Material.SmoothPlastic;
	actionArm.Color = Color3.fromRGB(204, 142, 105);
	actionArm.Size = new Vector3(1.85, 0.75, 0.75);

	return actionArm;
}

export function create_view_model(gun: Unit<"Gun">) {
	const camera = Workspace.CurrentCamera;
	const left_arm = create_arm(ArmSide.Left);
	const right_arm = create_arm(ArmSide.Right);
	const localPlayer = Players.LocalPlayer;

	// MOVE TO GUN
	const recoil_speed = 9;
	const recoil_height = 0.7;
	const offset = new CFrame(0.5, -1.5, -2);

	let last_shot = Option.none<number>();

	let recoil_collected = 0;

	gun.getUnit("HitScan")?.on_active_event?.setup(() => {
		last_shot = Option.some(os.clock());
	});

	RunService.RenderStepped.Connect(() => {
		const Character = localPlayer.Character;
		const Humanoid = Character?.FindFirstChildOfClass("Humanoid");

		if (!gun) return;

		if (Humanoid && camera && Humanoid.RootPart && Humanoid.MoveDirection.Magnitude <= 0) {
			const now = os.time();
			const amount = -(math.cos(now) / 5);

			const recoil_amount =
				math.clamp(
					-recoil_speed *
						(os.clock() -
							last_shot.match(
								(n) => n,
								() => os.clock(),
							)) +
						recoil_height,
					-recoil_collected / recoil_speed,
					recoil_height,
				) ?? 0;

			const Goal = camera.CFrame.mul(
				CFrame.Angles(
					math.rad((recoil_amount <= 0 && recoil_collected <= 0 ? amount : 0) + recoil_amount),
					0,
					0,
				),
			);

			camera.CFrame = camera.CFrame.Lerp(Goal, 0.5);
			recoil_collected += recoil_amount;

			if (recoil_amount <= 0 && recoil_collected <= 0) {
				const X = math.cos(now * 9) / 5;
				const Y = math.abs(math.sin(now * 12)) / 5;
				const bobble = new Vector3(X, Y, 0).mul(
					math.min(1, Humanoid.RootPart.Velocity.Magnitude / Humanoid.WalkSpeed),
				);
				Humanoid.CameraOffset = Humanoid.CameraOffset.Lerp(bobble, 0.25);
			}
		} else if (Humanoid && camera && Humanoid.RootPart) {
			const recoil_amount = last_shot
				? math.clamp(
						-recoil_speed * (os.clock() - last_shot.expect("no last shot")) + recoil_height,
						-recoil_collected / recoil_speed,
						recoil_height,
				  )
				: 0;
			camera.CFrame = camera.CFrame.Lerp(camera.CFrame.mul(CFrame.Angles(math.rad(recoil_amount), 0, 0)), 0.5);
			recoil_collected += recoil_amount;
		}

		if (camera) {
			gun.ref.Handle.CFrame = camera.CFrame.mul(offset);

			left_arm.CFrame = gun.ref.Handle.LeftArmAttach.WorldCFrame?.mul(CFrame.Angles(0, math.rad(180), 0))?.mul(
				new CFrame(left_arm.Size.X, 0, 0),
			);

			right_arm.CFrame = gun.ref.Handle.RightArmAttach.WorldCFrame?.mul(CFrame.Angles(0, math.rad(180), 0))?.mul(
				new CFrame(right_arm.Size.X, 0, 0),
			);
		}
	});
}
