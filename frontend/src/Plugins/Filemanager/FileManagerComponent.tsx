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

import { Component, JSX_CreateElement, MatIcon, Switch } from "acfrontend";
import { DirectoryViewComponent } from "./DirectoryViewComponent";

export class FileManagerComponent extends Component
{
    constructor()
    {
        super();

        this.showTwoColumns = false;
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            <div class="row evenly-spaced">
                <div class="column">
                    <Switch checked={this.showTwoColumns} onChanged={newValue => this.showTwoColumns = newValue} />
                    <MatIcon>view_week</MatIcon>
                </div>
            </div>

            <div class="row evenly-spaced">
                <div class="column"><DirectoryViewComponent /></div>
                {this.showTwoColumns ? <div class="column"><DirectoryViewComponent /></div> : null}
            </div>
        </fragment>;
    }

    //Private methods
    private showTwoColumns: boolean;
}