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
	let Arms = new Instance("Model")
	Arms.Parent = Workspace.CurrentCamera

	let LeftArm = create_arm(ArmSide.Left)
	LeftArm.Parent = Arms

	let RightArm = create_arm(ArmSide.Right)
	RightArm.Parent = Arms

	return Arms
}
