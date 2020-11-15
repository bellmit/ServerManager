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
import { Component, ProgressSpinner, JSX_CreateElement, Injectable } from "acfrontend";
import { UsersService } from "./UsersService";
import { Group } from "srvmgr-api";

@Injectable
export class GroupListComponent extends Component
{
    constructor(private usersService: UsersService)
    {
        super();

        this.groups = null;
        this.usersService.groups.Subscribe( (newGroups) => this.groups = newGroups );
    }
    
    //Protected methods
    protected Render(): RenderValue
    {
        if(this.groups === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>Groups</h1>
            <table>
                <tr>
                    <th>Group id</th>
                    <th>Group name</th>
                </tr>
                {this.RenderGroupsList()}
            </table>
        </fragment>
    }

    //Private members
    private groups: Group[] | null;

    //Private methods
    private RenderGroupsList()
    {
        return this.groups!.map(group => <tr>
            <td>{group.gid}</td>
            <td>{group.name}</td>
        </tr>);
    }
}