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
import { Messages } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { CommandExecutor } from "../services/CommandExecutor";

@Injectable
class MySQLApi
{
    constructor(private connectionManager: ConnectionManager, private commandExecutor: CommandExecutor)
    {
    }

    //Api Endpoints
    @ApiEndpoint({ route: Messages.MYSQL_SHOW_STATUS })
    public async ShowStatus(request: ApiRequest)
    {
        const result1 = await this.commandExecutor.ExecuteCommand("mysql -u root -e \"SELECT @@warning_count;\"", request.session);
        const result2 = await this.commandExecutor.ExecuteCommand("mysql -u root -e \"SELECT @@error_count;\"", request.session);
        this.connectionManager.Respond(request, result1.stderr + result1.stdout + result2.stderr + result2.stdout);
    }
}

export default MySQLApi;