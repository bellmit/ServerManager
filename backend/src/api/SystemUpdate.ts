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
import { Injectable } from "../Injector";
import { ApiEndpoint, ApiRequest } from "../Api";
import { CommandExecutor } from "../services/CommandExecutor";
import { SystemUpdate } from "srvmgr-api";
import { PermissionsManager } from "../services/PermissionsManager";

@Injectable
class SystemUpdateApi
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    @ApiEndpoint({ route: SystemUpdate.Api.CheckForUpdates.message })
    public async CheckForUpdates(call: ApiRequest)
    {
        await this.commandExecutor.ExecuteCommand(["apt-get", "update"], this.permissionsManager.Sudo(call.session.uid));

        const res = await this.commandExecutor.ExecuteCommand(["apt", "list", "--upgradeable"], call.session);
        return res.stdout;
    }
}

export default SystemUpdateApi;