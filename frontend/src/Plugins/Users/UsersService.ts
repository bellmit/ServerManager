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

import { Messages, User, Group, OperationStatus } from "srvmgr-api";

import { WebSocketService } from "../../Services/WebSocketService";
import { ApiListener, ApiService } from "../../API/Api";

@ApiService
export class UsersService
{
    constructor(private webSocketService: WebSocketService)
    {
        this._groups = new Property<Group[]>([]);
        this._users = new Property<User[]>([]);

        this.webSocketService.SendMessage(Messages.USERGROUPS_LIST);
        this.webSocketService.SendMessage(Messages.USERS_LIST);
    }

    //Properties
    public get groups()
    {
        return this._groups;
    }

    public get users()
    {
        return this._users;
    }

    //Public methods
    public AddUser(userName: string, createHomeDir: boolean)
    {
        return this.webSocketService.SendRequest<boolean>(Messages.USERS_ADD, { userName, createHomeDir });
    }

    public AddUserToGroup(userName: string, groupName: string)
    {
        return this.webSocketService.SendRequest<boolean>(Messages.USERS_GROUPS_ADD, { userName, groupName });
    }

    public ChangePassword(userName: string, oldPassword: string, newPassword: string)
    {
        return this.webSocketService.SendRequest<boolean>(Messages.USERS_CHANGE_PASSWORD, { userName, oldPassword, newPassword });
    }

    public DeleteUser(userName: string)
    {
        return this.webSocketService.SendRequest<OperationStatus>(Messages.USERS_DELETE, userName);
    }

    public FetchUserGroups(userName: string)
    {
        return this.webSocketService.SendRequest<Group[]>(Messages.USERS_GROUPS_LIST, userName);
    }

    public RemoveUserFromGroup(userName: string, groupName: string)
    {
        return this.webSocketService.SendRequest<boolean>(Messages.USERS_GROUPS_REMOVE, { userName, groupName });
    }

    //Private members
    private _groups: Property<Group[]>;
    private _users: Property<User[]>;

    //Api Listeners
    @ApiListener({ route: Messages.USERGROUPS_LIST })
    private OnReceiveGroupsList(groups: Group[])
    {
        this._groups.Set(groups);
    }

    @ApiListener({ route: Messages.USERS_LIST })
    private OnReceiveUsersList(users: User[])
    {
        this._users.Set(users);
    }
}