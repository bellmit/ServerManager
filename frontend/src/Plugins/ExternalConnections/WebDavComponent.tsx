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
import { Injectable, Component, JSX_CreateElement, LineEdit } from "acfrontend";
import { Dictionary } from "acts-util-core";

@Injectable
export class WebDavComponent extends Component<{ options: Dictionary<string>; }>
{
    //Protected methods
    protected Render(): RenderValue
    {            
        return <fragment>
            <tr>
                <th>URL</th>
                <td><LineEdit value={this.input.options.url!} onChanged={newValue => this.input.options.url = newValue} /></td>
            </tr>
            <tr>
                <th>Username</th>
                <td><LineEdit value={this.input.options.userName!} onChanged={newValue => this.input.options.userName = newValue} /></td>
            </tr>
            <tr>
                <th>Password</th>
                <td><LineEdit password value={this.input.options.password!} onChanged={newValue => this.input.options.password = newValue} /></td>
            </tr>
            <tr>
                <th>Rootpath</th>
                <td><LineEdit value={this.input.options.root!} onChanged={newValue => this.input.options.root = newValue} /></td>
            </tr>
        </fragment>;
    }

    //Event handlers
    public OnInitiated()
    {
        if(this.input.options.url === undefined)
        {
            this.input.options.url = "";
            this.input.options.userName = "";
            this.input.options.password = "";
            this.input.options.root = "/";
        }
    }
}