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

import { Commands } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiCall } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { ProcessTracker } from "../services/ProcessTracker";

@Injectable
class CommandsApi
{
    constructor(private connectionManager: ConnectionManager, private processTracker: ProcessTracker)
    {
        this.commands = [];
        this.processTracker.processList.Subscribe(this.OnCommandsChanged.bind(this));
    }

    @ApiEndpoint({ route: Commands.Api.ListCommands.message })
    public async ListCommands(call: ApiCall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.commands);
    }

    //Private members
    private commands: Commands.CommandOverviewData[];

    //Event handlers
    private OnCommandsChanged(newCommands: Commands.CommandOverviewData[])
    {
        this.commands = newCommands;
        this.connectionManager.Broadcast(Commands.Api.ListCommands.message, newCommands);
    }
}

export default CommandsApi;