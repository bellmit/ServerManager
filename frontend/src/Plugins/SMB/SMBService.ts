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
import { WebSocketService } from "../../Services/WebSocketService";
import { SMB } from "srvmgr-api";

@Injectable
export class SMBService
{
    constructor(private websocketService: WebSocketService)
    {
    }

    //Public methods
    public AddUser(data: SMB.Api.AddUser.RequestData)
    {
        return this.websocketService.SendRequest<SMB.Api.AddUser.ResponseData>(SMB.Api.AddUser.message, data);
    }

    public QueryShares()
    {
        return this.websocketService.SendRequest<SMB.Api.ListShares.ResponseData>(SMB.Api.ListShares.message);
    }

    public QueryUsers()
    {
        return this.websocketService.SendRequest<SMB.Api.ListUsers.ResponseData>(SMB.Api.ListUsers.message);
    }

    public SetShare(data: SMB.Api.SetShare.RequestData)
    {
        return this.websocketService.SendRequest(SMB.Api.SetShare.message, data);
    }
}