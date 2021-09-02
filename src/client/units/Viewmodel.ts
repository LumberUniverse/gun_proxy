import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";

export function CreateArm(name: string) {
	const Camera = Workspace.CurrentCamera;

	const ActionArm = new Instance("Part");
	ActionArm.Parent = Camera;
	ActionArm.Name = name;
	ActionArm.Anchored = true;
	ActionArm.CanCollide = false;
	ActionArm.CanTouch = false;
	ActionArm.Material = Enum.Material.SmoothPlastic;
	ActionArm.Color = Color3.fromRGB(204, 142, 105);
	ActionArm.Size = new Vector3(1.85, 0.75, 0.75);

	return ActionArm;
}

export function Viewmodel(gun: any) {
	const Gun: any = ReplicatedStorage.FindFirstChild("TestViewmodel")?.Clone();
	const Camera = Workspace.CurrentCamera;
	const LeftArm = CreateArm("LeftArm");
	const RightArm = CreateArm("RightArm");
	const LocalPlayer = Players.LocalPlayer;
	const LastShot: any = undefined;
	let RecoilCollected = 0;

	// MOVE TO GUN
	const RecoilSpeed = 9;
	const RecoilHeight = 0.7;
	const Offset = new CFrame(0.5, -1.5, -2);

	RunService.RenderStepped.Connect(() => {
		const Character = LocalPlayer.Character;
		const Humanoid = Character?.FindFirstChildOfClass("Humanoid");

		if (!Gun) return;

		if (Humanoid && Camera && Humanoid.RootPart && Humanoid.MoveDirection.Magnitude <= 0) {
			const now = os.time();
			const amount = -math.cos(now) / 5;
			const recoild_amount =
				(LastShot &&
					math.clamp(
						-RecoilSpeed * (os.clock() - LastShot) + RecoilHeight,
						-RecoilCollected / RecoilSpeed,
						RecoilHeight,
					)) ||
				0;
			const Goal = Camera.CFrame.mul(
				CFrame.Angles(
					math.rad(((recoild_amount <= 0 && RecoilCollected <= 0 && amount) || 0) + recoild_amount),
					0,
					0,
				),
			);

			Camera.CFrame = Camera.CFrame.Lerp(Goal, 0.5);
			RecoilCollected += recoild_amount;

			if (recoild_amount <= 0 && RecoilCollected <= 0) {
				const X = math.cos(now * 9) / 5;
				const Y = math.abs(math.sin(now * 12)) / 5;
				const bobble = new Vector3(X, Y, 0).mul(
					math.min(1, Humanoid.RootPart.Velocity.Magnitude / Humanoid.WalkSpeed),
				);
				Humanoid.CameraOffset = Humanoid.CameraOffset.Lerp(bobble, 0.25);
			}
		} else if (Humanoid && Camera && Humanoid.RootPart) {
			const recoild_amount =
				(LastShot &&
					math.clamp(
						-RecoilSpeed * (os.clock() - LastShot) + RecoilHeight,
						-RecoilCollected / RecoilSpeed,
						RecoilHeight,
					)) ||
				0;
			Camera.CFrame = Camera.CFrame.Lerp(Camera.CFrame.mul(CFrame.Angles(math.rad(recoild_amount), 0, 0)), 0.5);
			RecoilCollected += recoild_amount;
		}

		if (Gun && Gun.PrimaryPart && Camera && LeftArm && RightArm) {
			Gun.SetPrimaryPartCFrame(Camera.CFrame.mul(Offset));

			LeftArm.CFrame = (Gun.PrimaryPart.LeftArmAttach.WorldCFrame as CFrame)
				?.mul(CFrame.Angles(0, math.rad(180), 0))
				?.mul(new CFrame(LeftArm.Size.X, 0, 0));

			RightArm.CFrame = (Gun.PrimaryPart.RightArmAttach.WorldCFrame as CFrame)
				?.mul(CFrame.Angles(0, math.rad(180), 0))
				?.mul(new CFrame(RightArm.Size.X, 0, 0));
		}
	});
}
