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
import { Property } from "acts-util-core";

import { Messages, User } from "srvmgr-api";

import { WebSocketService } from "../../Services/WebSocketService";
import { ApiListener, ApiService } from "../../API/Api";

@ApiService
export class UsersService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._users = new Property<User[]>([]);

        this.webSocketService.SendMessage(Messages.USERS_LIST);
    }

    //Properties
    public get users()
    {
        return this._users;
    }

    //Private members
    private _users: Property<User[]>;

    //Api Listeners
    @ApiListener({ route: Messages.USERS_LIST })
    private OnReceiveUsersList(users: User[])
    {
        this._users.Set(users);
    }
}