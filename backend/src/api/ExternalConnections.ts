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
import { Messages, ExternalConnectionSettings } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ConnectionManager } from "../services/ConnectionManager";
import { ApiEndpoint, ApiCall, ApiRequest } from "../Api";
import { ExternalConnectionManager } from "../services/ExternalConnectionManager";

@Injectable
class ExternalConnectionsApi
{
    constructor(private connectionManager: ConnectionManager, private externalConnectionManager: ExternalConnectionManager)
    {
        this.externalConnectionManager.connections.Subscribe( connections => this.connectionManager.Broadcast(Messages.EXTERNALCONNECTIONS_LIST, connections ));
    }

    @ApiEndpoint({ route: Messages.EXTERNALCONNECTIONS_DELETE })
    public DeleteConnection(call: ApiCall, connectionName: string)
    {
        this.externalConnectionManager.Delete(connectionName);
    }

    @ApiEndpoint({ route: Messages.EXTERNALCONNECTIONS_ISENCRYPTED })
    public IsConnectionEncrypted(request: ApiRequest, connectionName: string)
    {
        this.connectionManager.Respond(request, this.externalConnectionManager.IsEncrypted(connectionName));
    }

    @ApiEndpoint({ route: Messages.EXTERNALCONNECTIONS_LIST })
    public async ListConnections(call: ApiCall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.externalConnectionManager.connections.Get());
    }

    @ApiEndpoint({ route: Messages.EXTERNALCONNECTIONS_SET })
    public SetConnection(request: ApiRequest, data: ExternalConnectionSettings)
    {
        const result = this.externalConnectionManager.SetConnection(data.originalName, data.config, data.encrypt);
        this.connectionManager.Respond(request, result);
    }
}

export default ExternalConnectionsApi;