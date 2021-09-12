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
import { Messages, User, Group, OperationStatus } from "srvmgr-api";
import { Injectable } from "acts-util-node";
import { WebSocketAPIEndpoint, APICall, ApiRequest } from "../Api";
import { ConnectionManager } from "../services/ConnectionManager";
import { UserDataProviderService } from "../services/UserDataProviderService";
import { UsersManager } from "../services/UsersManager";
import { UsersGroupsManager } from "../services/UserGroupsManager";
import { AuthenticationService } from "../services/AuthenticationService";

@Injectable
class UsersApi
{
    constructor(private connectionManager: ConnectionManager, private usersService: UserDataProviderService,
        private usersManager: UsersManager, private groupsManager: UsersGroupsManager, private authService: AuthenticationService)
    {
        this.groups = [];
        this.users = [];
        this.usersService.groups.Subscribe({ next: this.OnGroupsChanged.bind(this) });
        this.usersService.users.Subscribe({ next: this.OnUsersChanged.bind(this) });
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_ADD })
    public async AddUser(request: ApiRequest, data: any)
    {
        const result = await this.usersManager.CreateUser(data.userName, data.createHomeDir, request.session);
        this.connectionManager.Respond(request, result === undefined ? true : false);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_GROUPS_ADD })
    public async AddUserToGroup(request: ApiRequest, data: any)
    {
        const result = await this.groupsManager.AddUserToGroup(data.userName, data.groupName, request.session);
        this.connectionManager.Respond(request, result === undefined ? true : false);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_CHANGE_PASSWORD })
    public async ChangePassword(request: ApiRequest, data: any)
    {
        const result = await this.authService.ChangePassword(data.userName, data.oldPassword, data.newPassword, request.session);
        this.connectionManager.Respond(request, result);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_DELETE })
    public async DeleteUser(request: ApiRequest, userName: string)
    {
        let response: OperationStatus = { success: true };
        try
        {
            await this.usersManager.DeleteUser(userName, request.session)
        }
        catch(error)
        {
            response = { success: false, errorMessage: error.message };
        }
        this.connectionManager.Respond(request, response);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERGROUPS_LIST })
    public async ListGroups(call: APICall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.groups);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_GROUPS_LIST })
    public async ListUserGroups(request: ApiRequest, userName: string)
    {
        const user = this.users.find(user => user.name === userName);
        const groups = user === undefined ? [] : await this.usersManager.GetGroupsOf(user.name);
        this.connectionManager.Respond(request, groups || []);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_LIST })
    public async ListUsers(call: APICall)
    {
        this.connectionManager.Send(call.senderConnectionId, call.calledRoute, this.users);
    }

    @WebSocketAPIEndpoint({ route: Messages.USERS_GROUPS_REMOVE })
    public async RemoveUserFromGroup(request: ApiRequest, data: any)
    {
        const result = await this.groupsManager.RemoveUserFromGroup(data.userName, data.groupName, request.session);
        this.connectionManager.Respond(request, result === undefined ? true : false);
    }

    //Private members
    private groups: Group[];
    private users: User[];

    //Event handlers
    private OnGroupsChanged(newGroups: Group[])
    {
        this.groups = newGroups;
        this.connectionManager.Broadcast(Messages.USERGROUPS_LIST, newGroups);
    }
    
    private OnUsersChanged(newUsers: User[])
    {
        this.users = newUsers;
        this.connectionManager.Broadcast(Messages.USERS_LIST, newUsers);
    }
}

export default UsersApi;