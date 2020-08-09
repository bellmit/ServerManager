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
import { Injectable, Component, RenderNode, JSX_CreateElement, Router, ProgressSpinner, CheckBox, LineEdit, IntegerSpinner, Select } from "acfrontend";
import { BackupTask, ExternalConnectionConfig } from "srvmgr-api";

import { BackupService } from "./BackupService";
import { ModuleService } from "../../Services/ModuleService";
import { ExternalConnectionsService } from "../ExternalConnections/ExternalConnectionsService";

@Injectable
export class BackupFormComponent extends Component<{ backupName?: string; }>
{
    constructor(private backupService: BackupService, private router: Router, private moduleService: ModuleService,
        private externalConnectionService: ExternalConnectionsService)
    {
        super();

        this.waiting = true;
        this.backup = undefined;
        this.externalConnections = undefined;
        this.maxBackupsEnabled = false;
        this.maxBackupLimit = 10;
    }

    //Protected methods
    protected Render(): RenderNode
    {
        if( this.waiting )
            return <ProgressSpinner />;

        if(this.externalConnections!.IsEmpty())
            return "You need to set up an external connection first where the backup files can be stored."

        return <fragment>
            <div class="evenlySpacedRow">
                <div class="column">
                    <h2>General</h2>
                    <table class="keyValue">
                        <tr>
                            <th>Enabled</th>
                            <td><CheckBox value={this.backup!.enabled} onChanged={newValue => this.backup!.enabled = newValue} /></td>
                        </tr>
                        <tr>
                            <th>Name</th>
                            <td><LineEdit value={this.backup!.name} onChanged={newValue => this.backup!.name = newValue} /></td>
                        </tr>
                        <tr>
                            <th>Interval (in seconds)</th>
                            <td><IntegerSpinner value={this.backup!.interval} onChanged={newValue => this.backup!.interval = newValue} /></td>
                        </tr>
                        <tr>
                            <th>Connection</th>
                            <td>
                                <Select onChanged={newSelection => this.backup!.connectionName = newSelection[0]}>{this.RenderConnections()}</Select>
                            </td>
                        </tr>
                        <tr>
                            <th>Path</th>
                            <td><LineEdit value={this.backup!.path} onChanged={newValue => this.backup!.path = newValue} /></td>
                        </tr>
                        <tr>
                            <th>Limit number of backups</th>
                            <td>
                                <CheckBox value={this.maxBackupsEnabled} onChanged={newValue => this.maxBackupsEnabled = newValue} />
                                {this.RenderMaxBackupLimitControl()}
                            </td>
                        </tr>
                    </table>
                </div>
                <div class="column">
                    <h2>Scope of this backup</h2>
                    <table class="keyValue">
                        {this.RenderScope()}
                    </table>
                </div>
            </div>
            <div class="evenlySpacedRow">
                <button type="button" onclick={this.OnSave.bind(this)}>Save</button>
            </div>
        </fragment>;
    }

    //Private members
    private waiting: boolean;
    private backup: BackupTask | undefined;
    private externalConnections: ExternalConnectionConfig[] | undefined;
    private maxBackupsEnabled: boolean;
    private maxBackupLimit: number;

    //Private methods
    private CheckForEndOfInitialization()
    {
        if((this.backup === undefined) || (this.externalConnections === undefined) || (this.moduleService.modules.WaitingForValue()))
            return; //still waiting

        if(this.backup !== undefined)
        {
            this.maxBackupsEnabled = this.backup!.numberOfBackupsLimit !== undefined;
            if(this.maxBackupsEnabled)
                this.maxBackupLimit = this.backup!.numberOfBackupsLimit!;
        }

        if(this.externalConnections.find(connection => connection.name === this.backup!.connectionName) === undefined)
        {
            if(!this.externalConnections.IsEmpty())
                this.backup.connectionName = this.externalConnections[0].name;
        }

        this.waiting = false;
    }

    private RenderConnections()
    {
        return this.externalConnections!.map( externalConnection =>
            <option selected={externalConnection.name === this.backup!.connectionName}>{externalConnection.name}</option> );
    }

    private RenderMaxBackupLimitControl()
    {
        if(this.maxBackupsEnabled)
            return <fragment>
                Keep only the newest <IntegerSpinner value={this.maxBackupLimit} onChanged={newValue => this.maxBackupLimit = newValue} /> backup files
            </fragment>;

        return "Don't automatically delete old backup files";
    }

    private RenderScope()
    {
        if(this.moduleService.IsModuleInstalled("mariadb"))
        {
            const onMysqlChanged = (newValue: boolean) => {
                if(newValue)
                    this.backup!.scope.mysql = {};
                else
                    delete this.backup!.scope["mysql"];
            };
            return <tr>
                <th>Mysql</th>
                <td><CheckBox value={"mysql" in this.backup!.scope} onChanged={onMysqlChanged} /></td>
            </tr>;
        }
    }

    //Eventhandlers
    public OnInitiated()
    {
        if(this.input.backupName === undefined)
        {
            this.backup = {
                enabled: false,
                name: "",
                lastBackupTime: new Date(1900, 1, 1),
                interval: 0,
                scope: {},
                connectionName: "",
                path: "/"
            };
        }
        else
        {
            this.backupService.backups.Subscribe( (newTasks) => {
                this.backup = newTasks.find( (task) => task.name === this.input.backupName );
                this.CheckForEndOfInitialization();
            });
        }
        this.externalConnectionService.connections.Subscribe( newConfigs => {
            this.externalConnections = newConfigs;
            this.CheckForEndOfInitialization();
        });
        this.moduleService.modules.Subscribe( this.CheckForEndOfInitialization.bind(this) );
    }
    
    private async OnSave()
    {
        this.waiting = true;
        if(this.maxBackupsEnabled)
            this.backup!.numberOfBackupsLimit = this.maxBackupLimit;
        else
            this.backup!.numberOfBackupsLimit = undefined;
        const result = await this.backupService.SetBackup(this.input.backupName, this.backup!);
        if(!result)
        {
            alert("TODO: ERROR");
        }
        this.router.RouteTo("/backup");
    }
}