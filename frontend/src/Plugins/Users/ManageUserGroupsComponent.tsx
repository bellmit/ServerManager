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
import { Component, RenderNode, Injectable, ProgressSpinner, JSX_CreateElement, MatIcon, Select, DialogRef } from "acfrontend";
import { UsersService } from "./UsersService";
import { Group } from "srvmgr-api";

@Injectable
export class ManageUserGroupsComponent extends Component
{
    input!: {
        userName: string;
    }

    constructor(private usersService: UsersService, private dialogRef: DialogRef)
    {
        super();

        this.allGroups = null;
        this.initialUserGroups = null;
        this.userGroups = null;
        this.selectedGroup = null;
    }
    
    protected Render(): RenderNode
    {
        if( (this.userGroups === null) || (this.allGroups === null) )
            return <ProgressSpinner />;

        return <fragment>
            <table>
                <tr>
                    <th>Group name</th>
                    <th>Actions</th>
                </tr>
                {...this.userGroups.map(group => <tr>
                    <td>{group.name}</td>
                    <td>
                        <button type="button" class="danger" onclick={this.OnRemoveGroupActivated.bind(this, group)}><MatIcon>delete</MatIcon></button>
                    </td>
                </tr>)}
            </table>
            <div class="box">
                <Select onChanged={this.OnSelectedGroupChanged.bind(this)}>
                    {...this.ListChoices().map(group => <option selected={this.selectedGroup === group.name}>{group.name}</option>)}
                </Select>
                <button type="button" onclick={this.OnAddGroupActivated.bind(this)}><MatIcon>add</MatIcon></button>
            </div>
        </fragment>;
    }

    //Private members
    private allGroups: Group[] | null;
    private initialUserGroups: Group[] | null;
    private userGroups: Group[] | null;
    private selectedGroup: string | null;

    //Private methods
    private ListChoices()
    {
        const filtered = this.allGroups!.filter( group => this.userGroups!.find(userGroup => userGroup.gid === group.gid)  === undefined );
        const sorted = filtered.sort( (a, b) => a.name.localeCompare(b.name) );
        if(this.selectedGroup === null)
            this.selectedGroup = sorted[0].name;
        return sorted;
    }

    //Event handlers
    private async OnAccept()
    {
        const groupsToAdd = [];
        const groupsToDelete = [];

        this.dialogRef.waiting.Set(true);

        for (const group of this.userGroups!)
        {
            if(this.initialUserGroups!.find(gr => gr.name === group.name) === undefined)
            {
                groupsToAdd.push(group.name);
            }
        }

        for (const group of this.initialUserGroups!)
        {
            if(this.userGroups!.find(gr => gr.name === group.name) === undefined)
            {
                groupsToDelete.push(group.name);
            }
        }

        for (const groupName of groupsToAdd)
            this.usersService.AddUserToGroup(this.input.userName, groupName);
        for (const groupName of groupsToDelete)
            this.usersService.RemoveUserFromGroup(this.input.userName, groupName);

        this.dialogRef.Close();
    }

    private async OnAddGroupActivated()
    {
        this.userGroups!.push(this.allGroups!.find(gr => gr.name === this.selectedGroup)!);
        this.selectedGroup = null;
    }

    public async OnInitiated()
    {
        this.dialogRef.onAccept.Subscribe(this.OnAccept.bind(this));

        this.usersService.groups.Subscribe( newValue => this.allGroups = newValue );
        this.initialUserGroups = await this.usersService.FetchUserGroups(this.input.userName);
        this.userGroups = this.initialUserGroups.DeepClone();
    }

    private async OnRemoveGroupActivated(group: Group)
    {
        const index = this.userGroups!.findIndex(gr => gr.gid === group.gid);
        this.userGroups!.Remove(index);
        this.Update();
    }

    private async OnSelectedGroupChanged(selected: string[])
    {
        this.selectedGroup = selected[0];
    }
}