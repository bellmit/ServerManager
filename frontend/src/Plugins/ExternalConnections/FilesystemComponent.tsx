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
import { Injectable, Component, RenderNode, JSX_CreateElement, LineEdit } from "acfrontend";
import { Dictionary } from "acts-util-core";

@Injectable
export class FilesystemComponent extends Component
{
    input!: {
        options: Dictionary<string>;
    }

    //Protected methods
    protected Render(): RenderNode
    {            
        return <fragment>
            <tr>
                <th>Rootpath</th>
                <td><LineEdit value={this.input.options.root!} onChanged={newValue => this.input.options.root = newValue} /></td>
            </tr>
        </fragment>;
    }

    //Event handlers
    public OnInitiated()
    {
        if(this.input.options.root === undefined)
        {
            this.input.options.root = "/";
        }
    }
}