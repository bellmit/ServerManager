/**
 * ServerManager
 * Copyright (C) 2020-2021 Amir Czwink (amir130@hotmail.de)
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

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, APICall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { ProcessTracker, ProcessInfo } from "../services/ProcessTracker";
import { Dictionary } from "acts-util-core";

@Injectable
class CommandsApi
{
    constructor(private connectionManager: ConnectionManager, private processTracker: ProcessTracker)
    {
        this.commands = [];
        this.processTracker.processData.Subscribe({ next: this.OnNewCommandData.bind(this) });
        this.processTracker.processList.Subscribe(this.OnCommandsChanged.bind(this));
        this.subscribedConnectionIds = {};
    }

    @WebSocketAPIEndpoint({ route: Commands.Api.InputData.message })
    public async ReceiveInputData(call: APICall, data: Commands.Api.InputData.BackendExpectData)
    {
        this.processTracker.WriteInput(data.pid, data.data);
    }

    @WebSocketAPIEndpoint({ route: Commands.Api.ListCommands.message })
    public async ListCommands(call: APICall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.commands);
    }

    @WebSocketAPIEndpoint({ route: Commands.Api.SubscribeCommand.message })
    public async SubscribeCommand(request: ApiRequest, pid: Commands.Api.SubscribeCommand.RequestData): Promise<Commands.Api.SubscribeCommand.ResultData>
    {
        if(!(pid in this.subscribedConnectionIds))
            this.subscribedConnectionIds[pid] = [];
            
        this.subscribedConnectionIds[pid]!.push(request.senderConnectionId);

        const processInfo = this.processTracker.Get(pid)!;
        return { pid: processInfo.processId, stdout: processInfo.stdOutBuffered, stderr: processInfo.stdErrBuffered, exitCode: processInfo.exitCode };
    }

    @WebSocketAPIEndpoint({ route: Commands.Api.UnsubscribeCommand.message })
    public async UnsubscribeCommand(call: APICall, pid: Commands.Api.UnsubscribeCommand.BackendExpectData)
    {            
        const subscriptions = this.subscribedConnectionIds[pid]!;
        subscriptions.Remove(subscriptions.indexOf(call.senderConnectionId));
    }

    //Private members
    private commands: Commands.CommandOverviewData[];
    private subscribedConnectionIds: Dictionary<string[]>;

    //Event handlers
    private OnCommandsChanged(newCommands: Commands.CommandOverviewData[])
    {
        this.commands = newCommands;
        this.connectionManager.Broadcast(Commands.Api.ListCommands.message, newCommands);
    }

    private OnNewCommandData(processInfo: ProcessInfo)
    {
        const connectionIds = this.subscribedConnectionIds[processInfo.processId];
        if(connectionIds !== undefined)
        {
            const dataToSend: Commands.Api.CommandData.BackendSendData = { pid: processInfo.processId, stderr: processInfo.stdErrBuffered, stdout: processInfo.stdOutBuffered, exitCode: processInfo.exitCode };
            for (const connectionId of connectionIds)
            {
                this.connectionManager.Send(connectionId, Commands.Api.CommandData.message, dataToSend);
            }
        }
    }
}

export default CommandsApi;