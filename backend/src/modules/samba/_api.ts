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

import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, ApiRequest } from "../../Api";
import { SMB } from "srvmgr-api";
import { SambaManager } from "./SambaManager";

@Injectable
class SambaApi
{
    constructor(private sambaManager: SambaManager)
    {
    }

    @WebSocketAPIEndpoint({ route: SMB.Api.AddUser.message })
    public async AddUser(request: ApiRequest, data: SMB.Api.AddUser.RequestData): Promise<SMB.Api.AddUser.ResponseData>
    {
        const result = await this.sambaManager.AddUser(data.userName, data.password, request.session);
        return result;
    }

    @WebSocketAPIEndpoint({ route: SMB.Api.DeleteShare.message })
    public async DeleteShare(request: ApiRequest, data: SMB.Api.DeleteShare.RequestData)
    {
        this.sambaManager.DeleteShare(data.shareName, request.session);
    }

    @WebSocketAPIEndpoint({ route: SMB.Api.ListShares.message })
    public async ListShares(request: ApiRequest)
    {
        const result = await this.sambaManager.QuerySettings();
        return result.shares;
    }

    @WebSocketAPIEndpoint({ route: SMB.Api.ListUsers.message })
    public async ListUsers(request: ApiRequest): Promise<SMB.Api.ListUsers.ResponseData>
    {
        const result = await this.sambaManager.QueryUsers(request.session);
        return result;
    }

    @WebSocketAPIEndpoint({ route: SMB.Api.SetShare.message })
    public async SetShare(request: ApiRequest, data: SMB.Api.SetShare.RequestData)
    {
        if(data.oldShareName === undefined)
            await this.sambaManager.AddShare(data.share, request.session);
        else
            await this.sambaManager.SetShare(data.oldShareName, data.share, request.session);
    }
}

export default SambaApi;