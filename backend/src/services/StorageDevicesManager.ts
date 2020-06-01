/**
 * ServerManager
 * Copyright (C) 2019-2020 Amir Czwink (amir130@hotmail.de)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * */
import { CommandExecutor } from "./CommandExecutor";
import { POSIXAuthority } from "./PermissionsManager";

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
    public async QueryDevices(session: POSIXAuthority): Promise<Array<DeviceInfo>>
    {
        const json = await this.QueryData(session);

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
    private async QueryData(session: POSIXAuthority)
    {
        const { stdout } = await this.commandExecutor.ExecuteCommand(["lsblk", "-bJOp"], session);
        return JSON.parse(stdout);
    }
}