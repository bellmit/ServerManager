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
import { Injectable, Component, RenderNode, JSX_CreateElement, ProgressSpinner, MatIcon, PopupManager } from "acfrontend";
import { User } from "srvmgr-api";

import { UsersService } from "./UsersService";
import { AddUserComponent } from "./AddUserComponent";
import { ManageUserGroupsComponent } from "./ManageUserGroupsComponent";
import { ChangePasswordComponent } from "./ChangePasswordComponent";

@Injectable
export class UserListComponent extends Component<{ showSystemUsers: boolean; }>
{
    constructor(private usersService: UsersService, private popupManager: PopupManager)
    {
        super();

        this.users = null;
        this.usersService.users.Subscribe( (newUsers) => this.users = newUsers );
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.users === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>{this.input.showSystemUsers ? "System users" : "Users"}</h1>
            {this.RenderUsersTable()}
            <div class="box">
                <button type="button" onclick={this.OnAddUserActivated.bind(this)}><MatIcon>add</MatIcon></button>
            </div>
        </fragment>
    }

    //Private members
    private users: User[] | null;

    //Private methods
    private RenderUsersList()
    {
        const users = this.users!.filter( user => user.isSystemUser === this.input.showSystemUsers );

        return users.map(user => <tr>
            <td>{user.uid}</td>
            <td>{user.name}</td>
            <td>{user.displayName}</td>
            <td>{user.gid}</td>
            <td>
                <button type="button" onclick={this.OnChangePasswordActivated.bind(this, user.name)}><MatIcon>vpn_key</MatIcon></button>
                <button type="button" onclick={this.OnManageGroupsActivated.bind(this, user.name)}><MatIcon>group</MatIcon></button>
                <button type="button" class="danger" onclick={this.OnDeleteActivated.bind(this, user.name)}><MatIcon>delete_forever</MatIcon></button>
            </td>
        </tr>);
    }

    private RenderUsersTable()
    {
        return <table>
            <tr>
                <th>User Id</th>
                <th>Username</th>
                <th>Friendly name</th>
                <th>Group Id</th>
                <th>Actions</th>
            </tr>
            {this.RenderUsersList()}
        </table>;
    }

    //Event handlers
    private OnAddUserActivated()
    {
        this.popupManager.OpenDialog(AddUserComponent, { title: "Add user" });
    }

    private OnChangePasswordActivated(userName: string)
    {
        this.popupManager.OpenDialog(ChangePasswordComponent, { title: "Change password", input: { userName } });
    }

    private OnManageGroupsActivated(userName: string)
    {
        this.popupManager.OpenDialog(ManageUserGroupsComponent, { title: "Manage groups", input: { userName } });
    }

    private async OnDeleteActivated(userName: string)
    {
        if(confirm("Are you sure that you PERMANENTLY want to delete user '" + userName + "' including all his data?"))
        {
            const oldUsers = this.users;
            this.users = null;
            
            const result = await this.usersService.DeleteUser(userName);
            if(result.success === false)
            {
                alert("Failed to delete user.\n" + result.errorMessage);
                this.users = oldUsers;
            }
        }
    }
}