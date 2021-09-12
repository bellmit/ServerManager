/**
 * ServerManager
 * Copyright (C) 2019-2021 Amir Czwink (amir130@hotmail.de)
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
import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../Api";
import { CommandExecutor } from "../services/CommandExecutor";
import { SystemUpdate } from "srvmgr-api";
import { PermissionsManager } from "../services/PermissionsManager";
import { POSIXAuthority } from "../services/POSIXAuthority";
import { ConfigParser, KeyValueEntry } from "../core/ConfigParser";
import { ConfigWriter } from "../core/ConfigWriter";
import { ConfigModel } from "../core/ConfigModel";

class AutoUpgradeFileParser extends ConfigParser
{
    protected FileNameMatchesIncludeDir(fileName: string): boolean
    {
        return false;
    }

    protected ParseIncludeDir(line: string): string | undefined
    {
        return undefined;
    }

    protected ParseKeyValue(line: string): KeyValueEntry
    {
        const parts = line.TrimRight(";").split(" ");
        return {
            type: "KeyValue",
            key: parts[0],
            value: parts[1].TrimLeft('"').TrimRight('"')
        };
    }
}

class AutoUpgradeFileWriter extends ConfigWriter
{
    protected KeyValueEntryToString(entry: KeyValueEntry)
    {
        return entry.key + " " + entry.value + ";";
    }
}

const autoUpgradeFilePath = "/etc/apt/apt.conf.d/20auto-upgrades";

@Injectable
class SystemUpdateApi
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    @WebSocketAPIEndpoint({ route: SystemUpdate.Api.CheckForUpdates.message })
    public async CheckForUpdates(call: ApiRequest)
    {
        await this.commandExecutor.ExecuteCommand(["apt-get", "update"], this.permissionsManager.Sudo(call.session.uid));

        const res = await this.commandExecutor.ExecuteCommand(["apt", "list", "--upgradeable"], call.session);
        return res.stdout;
    }

    @WebSocketAPIEndpoint({ route: SystemUpdate.Api.QueryUnattendedUpgradeConfig.message })
    public async QueryUnattendedUpgradeConfig(request: ApiRequest, data: SystemUpdate.Api.QueryUnattendedUpgradeConfig.RequestData): Promise<SystemUpdate.Api.QueryUnattendedUpgradeConfig.ResultData>
    {
        const cfgEntries = await this.ReadConfig(request.session);
        const cfgModel = new ConfigModel(cfgEntries);

        return {
            config: {
                unattendedUpgrades: parseInt(cfgModel.WithoutSectionAsDictionary()["APT::Periodic::Unattended-Upgrade"] as string) === 1,
                updatePackageLists: parseInt(cfgModel.WithoutSectionAsDictionary()["APT::Periodic::Update-Package-Lists"] as string) === 1,
            }
        };
    }

    @WebSocketAPIEndpoint({ route: SystemUpdate.Api.SetUnattendedUpgradeConfig.message })
    public async SetUnattendedUpgradeConfig(request: ApiRequest, data: SystemUpdate.Api.SetUnattendedUpgradeConfig.RequestData): Promise<SystemUpdate.Api.SetUnattendedUpgradeConfig.ResultData>
    {
        const cfgEntries = await this.ReadConfig(request.session);
        const cfgModel = new ConfigModel(cfgEntries);

        cfgModel.SetProperty("", "APT::Periodic::Unattended-Upgrade", this.BoolToNumberString(data.config.unattendedUpgrades));
        cfgModel.SetProperty("", "APT::Periodic::Update-Package-Lists", this.BoolToNumberString(data.config.updatePackageLists));

        const configWriter = new AutoUpgradeFileWriter(() => "", "", "");
        await configWriter.Write(autoUpgradeFilePath, cfgEntries);

        return {};
    }

    //Private methods
    private BoolToNumberString(b: boolean)
    {
        const n = b ? 1 : 0;

        return '"' + n + '"';
    }

    private async ReadConfig(session: POSIXAuthority)
    {
        const parser = new AutoUpgradeFileParser([], {});

        return await parser.Parse(autoUpgradeFilePath);
    }
}

export default SystemUpdateApi;