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
import { Component, RenderNode, Injectable, JSX_CreateElement } from "acfrontend";
import { SMB } from "srvmgr-api";
import { ShareFormComponent } from "./ShareFormComponent";

@Injectable
export class AddShareComponent extends Component
{
    constructor()
    {
        super();

        this.share = SMB.CreateDefaultShare("");
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <h1>Create share</h1>
            <ShareFormComponent share={this.share} />
        </fragment>;
    }

    //Private members
    private share: SMB.Share;
}