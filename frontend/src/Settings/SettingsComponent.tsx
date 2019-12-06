/**
 * ServerManager
 * Copyright (C) 2019 Amir Czwink (amir130@hotmail.de)
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
import {Component, Injectable, RenderNode, JSX_CreateElement, MatIcon, Anchor} from "acfrontend";

@Injectable
export class SettingsComponent extends Component
{
    //Protected methods
    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Settings</h1>

            <h2>Core</h2>
            <div class="row">
                <MatIcon>system_update_alt</MatIcon>
                <Anchor route="/modules">Modules</Anchor>
                <Anchor route="/systemupdate">System update</Anchor>
            </div>
            <hr />
            
            <h2>Network services</h2>
            <div class="row">
            <MatIcon>folder_shared</MatIcon>
                <Anchor route="smb">SMB</Anchor>
            </div>
        </fragment>;
    }
}