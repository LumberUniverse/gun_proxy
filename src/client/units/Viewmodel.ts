import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";

export function CreateArm(name: string) {
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

interface GunTypeTree extends Model {
	PrimaryPart: BasePart & {
		LeftArmAttach: Attachment,
		RightArmAttach: Attachment
	}
}

export function Viewmodel() {
	const gun = ReplicatedStorage.FindFirstChild("TestViewmodel")?.Clone() as GunTypeTree;
	const camera = Workspace.CurrentCamera;
	const leftArm = CreateArm("LeftArm");
	const rightArm = CreateArm("RightArm");
	const localPlayer = Players.LocalPlayer;
	const lastShot: any = undefined;
	let recoilCollected = 0;

	// MOVE TO GUN
	const recoilSpeed = 9;
	const recoilHeight = 0.7;
	const offset = new CFrame(0.5, -1.5, -2);

	RunService.RenderStepped.Connect(() => {
		const Character = localPlayer.Character;
		const Humanoid = Character?.FindFirstChildOfClass("Humanoid");

		if (!gun) return;

		if (Humanoid && camera && Humanoid.RootPart && Humanoid.MoveDirection.Magnitude <= 0) {
			const now = os.time();
			const amount = -(math.cos(now) / 5);

			const recoild_amount =
				(lastShot &&
					math.clamp(
						-recoilSpeed * (os.clock() - lastShot) + recoilHeight,
						-recoilCollected / recoilSpeed,
						recoilHeight,
					)) ||
				0;

			const Goal = camera.CFrame.mul(
				CFrame.Angles(
					math.rad(((recoild_amount <= 0 && recoilCollected <= 0 && amount) || 0) + recoild_amount),
					0,
					0,
				),
			);

			camera.CFrame = camera.CFrame.Lerp(Goal, 0.5);
			recoilCollected += recoild_amount;

			if (recoild_amount <= 0 && recoilCollected <= 0) {
				const X = math.cos(now * 9) / 5;
				const Y = math.abs(math.sin(now * 12)) / 5;
				const bobble = new Vector3(X, Y, 0).mul(
					math.min(1, Humanoid.RootPart.Velocity.Magnitude / Humanoid.WalkSpeed),
				);
				Humanoid.CameraOffset = Humanoid.CameraOffset.Lerp(bobble, 0.25);
			}
		} else if (Humanoid && camera && Humanoid.RootPart) {
			const recoild_amount =
				(lastShot &&
					math.clamp(
						-recoilSpeed * (os.clock() - lastShot) + recoilHeight,
						-recoilCollected / recoilSpeed,
						recoilHeight,
					)) ||
				0;
			camera.CFrame = camera.CFrame.Lerp(camera.CFrame.mul(CFrame.Angles(math.rad(recoild_amount), 0, 0)), 0.5);
			recoilCollected += recoild_amount;
		}

		if (gun && gun.PrimaryPart && camera && leftArm && rightArm) {
			gun.SetPrimaryPartCFrame(camera.CFrame.mul(offset));

			leftArm.CFrame = (gun.PrimaryPart.LeftArmAttach.WorldCFrame as CFrame)
				?.mul(CFrame.Angles(0, math.rad(180), 0))
				?.mul(new CFrame(leftArm.Size.X, 0, 0));

			rightArm.CFrame = (gun.PrimaryPart.RightArmAttach.WorldCFrame as CFrame)
				?.mul(CFrame.Angles(0, math.rad(180), 0))
				?.mul(new CFrame(rightArm.Size.X, 0, 0));
		}
	});
}
