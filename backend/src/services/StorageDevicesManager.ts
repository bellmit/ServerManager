import { CommandExecutor } from "./CommandExecutor";

interface PartitionInfo
{
    readonly path: string;
    readonly mountPoint: string;
}

export interface DeviceInfo
{
    readonly path: string;
    readonly vendor: string;
    readonly model: string;
    readonly partitions: Array<PartitionInfo>;
}

class PartitionInfoImpl implements PartitionInfo
{
    //Public members
    path: string;
    mountPoint: string;

    constructor(partInfo: any)
    {
        this.path = partInfo.name;
        this.mountPoint = partInfo.mountpoint;
    }
}

class DeviceInfoImpl implements DeviceInfo
{
    //Public properties
    path: string;
    vendor: string;
    model: string;
    partitions: PartitionInfo[];

    constructor(devInfo: any)
    {
        this.path = devInfo.name;
        this.vendor = devInfo.vendor;
        this.model = devInfo.model;

        this.partitions = [];
        this.Flatten(devInfo.children);
    }

    //Private methods
    Flatten(children: any)
    {
        for(var i = 0; i < children.length; i++)
        {
            const child = children[i];

            if((child.fstype != null) && (child.fstype != "swap"))
                this.partitions.push(new PartitionInfoImpl(child));
            if("children" in child)
                this.Flatten(child.children)
        }
    }
}

export class StorageDevicesManager
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    //Public methods
    public async QueryDevices(): Promise<Array<DeviceInfo>>
    {
        const json = await this.QueryData();

        var result = [];
        for(var i = 0; i < json.blockdevices.length; i++)
        {
            const devInfo = json.blockdevices[i];
        }
        return json.blockdevices.map( (devInfo: any) =>
            new DeviceInfoImpl(devInfo)
        );
    }

    //Private methods
    private async QueryData()
    {
        const { stdout } = await this.commandExecutor.ExecuteCommand("lsblk -bJOp");
        return JSON.parse(stdout);
    }
}