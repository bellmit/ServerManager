/**
 * ServerManager
 * Copyright (C) 2020 Amir Czwink (amir130@hotmail.de)
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
import { PowerApi } from "srvmgr-api";
import { ApiEndpoint, ApiRequest } from "../Api";
import { Injectable } from "../Injector";
import { CommandExecutor } from "../services/CommandExecutor";
import { PermissionsManager, POSIXAuthority } from "../services/PermissionsManager";

@Injectable
class Api
{
    constructor(private commandExecutor: CommandExecutor, private permissionsManager: PermissionsManager)
    {
    }

    @ApiEndpoint({ route: PowerApi.Reboot.message })
    public async Reboot(request: ApiRequest)
    {
        this.IssueShutdown(["-r"], request.session);
    }

    @ApiEndpoint({ route: PowerApi.Shutdown.message })
    public async Shutdown(request: ApiRequest)
    {
        this.IssueShutdown([], request.session);
    }

    //Private methods
    private IssueShutdown(additionalArgs: string[], authority: POSIXAuthority)
    {
        const sudo = this.permissionsManager.Sudo(authority.uid);
        setTimeout(() => this.commandExecutor.ExecuteCommand(["shutdown"].concat(additionalArgs).concat(["0"]), sudo), 5000);
    }
}

export default Api;