import FabricLib from "@rbxts/fabric";
import { ReplicatedStorage, ServerScriptService } from "@rbxts/services";

const fabric = new FabricLib.Fabric("Game")

FabricLib.useReplication(fabric)
FabricLib.useTags(fabric);
FabricLib.useBatching(fabric);
const obj = ServerScriptService!.FindFirstChild("TS")!.FindFirstChild("units");
if (obj){
    fabric.registerUnitsIn(obj);
}

if (ReplicatedStorage.FindFirstChild("TestViewmodel")){
    const gun_model = ReplicatedStorage.FindFirstChild("TestViewmodel")!.Clone()

    const gun_unit = fabric.getOrCreateUnitByRef("Gun", gun_model as Tool & {
        Handle: BasePart & {
            LeftArmAttach: Attachment;
            RightArmAttach: Attachment;
        };
    })
    gun_unit.mergeBaseLayer({})
}