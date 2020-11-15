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
import { ObjectEditorComponent } from "../../ObjectEditorComponent";
import { MySQL } from "srvmgr-api";
import { MySQLService } from "./MySQLService";

@Injectable
export class EditMysqldSettingsComponent extends Component
{
    constructor(private mysqlService: MySQLService)
    {
        super();

        this.data = null;
    }

    protected Render(): RenderValue
    {
        if(this.data === null)
            return <ProgressSpinner />;

        return <fragment>
            <h1>MySQLd settings</h1>
            <form onsubmit={this.OnSave.bind(this)}>
                <ObjectEditorComponent object={this.data} />
                <button type="submit">Save</button>
            </form>
        </fragment>;
    }

    //Private members
    private data: MySQL.MysqldSettings | null;

    //Event handlers
    public async OnInitiated()
    {
        this.data = await this.mysqlService.QueryMysqldSettings();
    }

    private async OnSave(event: Event)
    {
        event.preventDefault();

        const data = this.data!;
        this.data = null;

        await this.mysqlService.SaveMysqldSettings(data);

        this.data = data;
    }
}