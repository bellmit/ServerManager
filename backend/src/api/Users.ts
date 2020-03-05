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
import { Messages, User } from "srvmgr-api";

import { Injectable } from "../Injector";
import { ApiEndpoint, ApiCall } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { UsersService } from "../services/UsersService";

@Injectable
class UsersApi
{
    constructor(private connectionManager: ConnectionManager, private usersService: UsersService)
    {
        this.users = [];
        this.usersService.users.Subscribe({ next: this.OnUsersChanged.bind(this) });
    }

    @ApiEndpoint({ route: Messages.USERS_LIST })
    public async ListBackups(call: ApiCall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.users);
    }

    //Private members
    private users: User[];

    //Event handlers
    private OnUsersChanged(newUsers: User[])
    {
        this.users = newUsers;
        this.connectionManager.Broadcast(Messages.USERS_LIST, this.users);
    }
}

export default UsersApi;