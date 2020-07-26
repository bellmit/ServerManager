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

import { Component, RenderNode, ProgressSpinner, JSX_CreateElement, Injectable, MatIcon, Switch, PopupManager } from "acfrontend";
import { SMBService } from "./SMBService";
import { SMB } from "srvmgr-api";
import { AddSMBUserComponent } from "./AddSMBUserComponent";

@Injectable
export class ListUsersComponent extends Component
{
    constructor(private smbService: SMBService, private popupManager: PopupManager)
    {
        super();

        this.data = null;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>SMB-Users</h1>
            <table>
                <tr>
                    <th>Name</th>
                    <th>Enabled</th>
                    <th>Actions</th>
                </tr>
                {this.data.map(this.RenderUser.bind(this))}
            </table>
            <div class="box">
                <button type="button" onclick={this.OnAddUserActivated.bind(this)}><MatIcon>add</MatIcon></button>
            </div>
        </fragment>;
    }

    //Private members
    private data: SMB.User[] | null;

    //Private methods
    private RenderUser(user: SMB.User)
    {
        return <tr>
            <td>{user.name}</td>
            <td><Switch checked={user.enabled} onChanged={this.OnChangeEnabledStatus.bind(this, user.name, !user.enabled)} /></td>
            <td>TODO</td>
        </tr>;
    }

    //Event handlers
    private OnAddUserActivated()
    {
        this.popupManager.OpenDialog(AddSMBUserComponent, { title: "Add user" });
    }

    public async OnInitiated()
    {
        this.data = await this.smbService.QueryUsers();
        this.data.sort((a, b) => a.name.localeCompare(b.name));
    }

    private OnChangeEnabledStatus(userName: string, enabled: boolean)
    {
        alert("NOT IMPLEMENTED");
    }
}