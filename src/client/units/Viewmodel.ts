import { Players, ReplicatedStorage, RunService, Workspace } from "@rbxts/services";

export function CreateArm(name: string) {
    var Camera = Workspace.CurrentCamera
    var Arm = new Instance("Model")
    Arm.Name = name
    Arm.Parent = Camera

    var ActionArm = new Instance("Part")
	ActionArm.Parent = Arm
	ActionArm.Name = name
	ActionArm.Anchored = true
	ActionArm.CanCollide = false
	ActionArm.CanTouch = false
	ActionArm.Material = Enum.Material.SmoothPlastic
	ActionArm.Color = Color3.fromRGB(204, 142, 105)
	ActionArm.Size = new Vector3(1.85, 0.75, 0.75)

    var Elbow = new Instance("Part")
    Elbow.Parent = Arm
    Elbow.Name = name
    Elbow.Anchored = false
    Elbow.CanCollide = false
    Elbow.CanTouch = false
    Elbow.Material = Enum.Material.SmoothPlastic
    Elbow.Color = Color3.fromRGB(204, 142, 105)
    Elbow.Size = new Vector3(2.25, 0.75, 0.75)
    
    var Joint = new Instance("Motor6D")
    Joint.Name = "Joint"
    Joint.Parent = ActionArm
    Joint.Part0 = ActionArm
    Joint.Part1 = Elbow
    Joint.C0 = new CFrame(ActionArm.Size.X/2 - 0.075, 0, 0)
        ?.mul(CFrame.Angles(0, 0, math.rad(22.5)))
        ?.mul(new CFrame(Elbow.Size.X/2-0.075, 0, 0))

    Arm.PrimaryPart = ActionArm

    return Arm
}

export function Viewmodel(gun: any) {
    var Gun: any = ReplicatedStorage.FindFirstChild("TestViewmodel")?.Clone()
    var Camera = Workspace.CurrentCamera
    var LeftArm = CreateArm("LeftArm")
    var RightArm = CreateArm("RightArm")
    var LocalPlayer = Players.LocalPlayer
    var LastShot: any = null
    var RecoilCollected = 0

    // MOVE TO GUN
    var RecoilSpeed = 9
    var RecoilHeight = 0.7
    var Offset = new CFrame(0.5, -1.5, -2)
    
    RunService.RenderStepped.Connect(() => {
        let Character = LocalPlayer.Character
        let Humanoid = Character?.FindFirstChildOfClass("Humanoid")

        if (!Gun) return

        if (Humanoid && Camera && Humanoid.RootPart && Humanoid.MoveDirection.Magnitude <= 0) {
            let now = os.time()
            let amount = - math.cos(now) / 5
            let recoild_amount = (LastShot && math.clamp(-RecoilSpeed * (os.clock()-LastShot) + RecoilHeight, -RecoilCollected/RecoilSpeed, RecoilHeight)) || 0
            let Goal = Camera.CFrame.mul(CFrame.Angles(math.rad((((recoild_amount <= 0 && RecoilCollected <= 0) && amount) || 0) + recoild_amount), 0, 0))

            Camera.CFrame = Camera.CFrame.Lerp(Goal, 0.5)
            RecoilCollected += recoild_amount
            
            if (recoild_amount <= 0 && RecoilCollected <= 0) {
                let X = math.cos(now * 9) / 5
                let Y = math.abs(math.sin(now * 12)) / 5
                let bobble = new Vector3(X, Y, 0).mul(math.min(1, Humanoid.RootPart.Velocity.Magnitude / Humanoid.WalkSpeed))
                Humanoid.CameraOffset = Humanoid.CameraOffset.Lerp(bobble, 0.25)
            }
        } else if (Humanoid && Camera && Humanoid.RootPart) {
            let recoild_amount = (LastShot && math.clamp(-RecoilSpeed * (os.clock()-LastShot) + RecoilHeight, -RecoilCollected/RecoilSpeed, RecoilHeight)) || 0
            Camera.CFrame = Camera.CFrame.Lerp(Camera.CFrame.mul(CFrame.Angles(math.rad(recoild_amount), 0, 0)), 0.5)
            RecoilCollected += recoild_amount
        }
        
        if (Gun && Gun.PrimaryPart && Camera && LeftArm && LeftArm.PrimaryPart && RightArm && RightArm.PrimaryPart) {
            Gun.SetPrimaryPartCFrame(Camera.CFrame.mul(Offset))

            LeftArm.PrimaryPart.CFrame = (Gun.PrimaryPart.LeftArmAttach.WorldCFrame as CFrame)
                ?.mul(CFrame.Angles(0, math.rad(180), 0))
                ?.mul(new CFrame(LeftArm.PrimaryPart.Size.X, 0, 0))

            RightArm.PrimaryPart.CFrame = (Gun.PrimaryPart.RightArmAttach.WorldCFrame as CFrame)
                ?.mul(CFrame.Angles(0, math.rad(180), 0))
                ?.mul(new CFrame(RightArm.PrimaryPart.Size.X, 0, 0))
        }
    })
}