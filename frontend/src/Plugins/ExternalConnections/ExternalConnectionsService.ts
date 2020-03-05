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
import { Injectable } from "acfrontend";

import { ExternalConnectionConfig, Messages, ExternalConnectionSettings } from "srvmgr-api";

import { ApiObservable } from "../../API/ApiObservable";
import { WebSocketService } from "../../Services/WebSocketService";

@Injectable
export class ExternalConnectionsService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._connections = new ApiObservable<ExternalConnectionConfig[]>([], Messages.EXTERNALCONNECTIONS_LIST);
    }

    //Properties
    public get connections()
    {
        return this._connections;
    }

    //Public methods
    public DeleteConnection(connectionName: string)
    {
        this.webSocketService.SendMessage(Messages.EXTERNALCONNECTIONS_DELETE, connectionName);
    }

    public IsEncrypted(connectionName: string)
    {
        return this.webSocketService.SendRequest<boolean>(Messages.EXTERNALCONNECTIONS_ISENCRYPTED, connectionName);
    }

    public SetConnection(connectionName: string | undefined, connection: ExternalConnectionConfig, encrypt: boolean)
    {
        const data: ExternalConnectionSettings = {
            config: connection,
            encrypt: encrypt,
            originalName: connectionName
        };
        return this.webSocketService.SendRequest<boolean>(Messages.EXTERNALCONNECTIONS_SET, data);
    }

    //Private members
    private _connections: ApiObservable<ExternalConnectionConfig[]>;
}