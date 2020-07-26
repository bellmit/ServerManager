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
import { Property, Subject } from "acts-util-core";

import { Commands } from "srvmgr-api";

import { WebSocketService } from "../../Services/WebSocketService";
import { ApiListener, ApiService } from "../../API/Api";

@ApiService
export class TerminalService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._commandData = new Subject<Commands.CommandData>();
        this._commands = new Property<Commands.CommandOverviewData[]>([]);

        this.webSocketService.SendMessage(Commands.Api.ListCommands.message);
    }

    //Properties
    public get commandData()
    {
        return this._commandData;
    }

    public get commands()
    {
        return this._commands;
    }

    //Public methods
    public SubscribeCommand(pid: number)
    {
        const promise = this.webSocketService.SendRequest<Commands.Api.SubscribeCommand.ResultData>(Commands.Api.SubscribeCommand.message, pid);
        promise.then(data => this._commandData.Next(data));
    }

    public UnsubscribeCommand(pid: number)
    {
        this.webSocketService.SendMessage(Commands.Api.UnsubscribeCommand.message, pid);
    }

    //Private members
    private _commandData: Subject<Commands.CommandData>;
    private _commands: Property<Commands.CommandOverviewData[]>;

    //Api Listeners
    @ApiListener({ route: Commands.Api.CommandData.message })
    private OnReceiveCommandData(data: Commands.Api.CommandData.BackendSendData)
    {
        this._commandData.Next(data);
    }

    @ApiListener({ route: Commands.Api.ListCommands.message })
    private OnReceiveCommandList(commands: Commands.Api.ListCommands.BackendSendData)
    {
        this._commands.Set(commands);
    }
}