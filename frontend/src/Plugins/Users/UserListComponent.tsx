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
import { Injectable, Component, RenderNode, JSX_CreateElement, ProgressSpinner, CheckBox } from "acfrontend";
import { User } from "srvmgr-api";

import { UsersService } from "./UsersService";

@Injectable
export class UserListComponent extends Component
{
    constructor(private usersService: UsersService)
    {
        super();

        this.users = null;
        this.hideSystemUsers = false;
        this.usersService.users.Subscribe( (newUsers) => this.users = newUsers );
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.users === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Users</h1>

            <CheckBox value={this.hideSystemUsers} onChanged={newValue => this.hideSystemUsers = newValue} /> Hide system users
            <table>
                <tr>
                    <th>User Id</th>
                    <th>Username</th>
                    <th>Friendly name</th>
                    <th>Group Id</th>
                </tr>
                {this.RenderUsersList(this.users)}
            </table>
        </fragment>
    }

    //Private members
    private users: User[] | null;
    private hideSystemUsers: boolean;

    //Private methods
    private RenderUsersList(users: User[])
    {
        if(this.hideSystemUsers)
            users = users.filter( user => !user.isSystemUser );

        return users.map(user => <tr>
            <td>{user.uid}</td>
            <td>{user.name}</td>
            <td>{user.displayName}</td>
            <td>{user.gid}</td>
        </tr>);
    }
}