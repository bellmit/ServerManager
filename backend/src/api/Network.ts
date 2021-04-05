/**
 * ServerManager
 * Copyright (C) 2021 Amir Czwink (amir130@hotmail.de)
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
import fs from "fs";

import { Injectable } from "acts-util-node";
import { Network } from "srvmgr-api";
import { ApiRequest, WebSocketAPIEndpoint } from "../Api";
import { ConfigModel } from "../core/ConfigModel";
import { ConfigParser } from "../core/ConfigParser";
import { ConfigWriter } from "../core/ConfigWriter";
import { CommandExecutor } from "../services/CommandExecutor";

@Injectable
class API
{
    constructor(private commandExecutor: CommandExecutor)
    {
    }

    @WebSocketAPIEndpoint({ route: Network.API.QuerySettings.message })
    public async QuerySettings(request: ApiRequest, data: Network.API.QuerySettings.RequestData): Promise<Network.API.QuerySettings.ResultData>
    {
        const result = await this.commandExecutor.ExecuteCommand(["sysctl", "net.ipv4.ip_forward"], request.session);
        if(!result.stdout.startsWith("net.ipv4.ip_forward = "))
            throw new Error(result.stdout);
        const left = result.stdout.substr("net.ipv4.ip_forward = ".length);
        
        return {
            isIPForwardingEnabled: parseInt(left) === 1,
        }
    }

    @WebSocketAPIEndpoint({ route: Network.API.SaveSettings.message })
    public async SaveSettings(request: ApiRequest, data: Network.API.SaveSettings.RequestData): Promise<Network.API.SaveSettings.ResultData>
    {
        class SysCtlConfParser extends ConfigParser
        {
            protected FileNameMatchesIncludeDir(fileName: string): boolean
            {
                throw new Error("Method not implemented.");
            }

            protected ParseIncludeDir(line: string): string | undefined
            {
                return undefined;
            }
        }
        
        const parser = new SysCtlConfParser(["#"], {});
        const entries = await parser.Parse("/etc/sysctl.conf");
        const mdl = new ConfigModel(entries);

        mdl.SetProperty("", "net.ipv4.ip_forward", data.isIPForwardingEnabled ? 1 : 0);

        const cfgWriter = new ConfigWriter(x => x, "", "");
        cfgWriter.Write("/etc/sysctl.conf", entries);

        await fs.promises.writeFile("/proc/sys/net/ipv4/ip_forward", data.isIPForwardingEnabled ? "1" : "0", "utf-8");

        return {};
    }
}

export default API;