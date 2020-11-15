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

import { Component, Injectable, JSX_CreateElement, ProgressSpinner } from "acfrontend";
import { TerminalComponent } from "./TerminalComponent";
import { TerminalService } from "./TerminalService";
import { Commands } from "srvmgr-api";
import { Subscription } from "acts-util-core";

@Injectable
export class CommandListComponent extends Component
{
    constructor(private terminalService: TerminalService)
    {
        super();

        this.commands = [];
        this.selectedCommand = null;
    }

    protected Render(): RenderValue
    {
        return <div class="row">
            <div class="column">
                Recent commands:
                <ul>
                    {...this.commands.map(this.RenderCommand.bind(this))}
                </ul>
            </div>
            <div class="column expanding">
                {this.selectedCommand === null ? "" : <TerminalComponent command={this.selectedCommand} />}
            </div>
        </div>;
    }

    //Private members
    private commands: Commands.CommandOverviewData[];
    private selectedCommand: Commands.CommandOverviewData | null;
    private subscription?: Subscription;

    //Private methods
    private RenderCommand(cmd: Commands.CommandOverviewData)
    {
        return <li>
            <a onclick={() => this.selectedCommand = cmd} style={cmd.exitCode === undefined ? "font-weight: bold" : ""}>
                {cmd.commandline} ({cmd.pid})
            </a>
        </li>;
    }

    //Event handlers
    public OnInitiated()
    {
        this.subscription = this.terminalService.commands.Subscribe(newCommands => {
            this.commands = newCommands;
            if( (this.selectedCommand === null) && (newCommands.length > 0))
                this.selectedCommand = newCommands[newCommands.length-1];
            else if(newCommands.length === 0)
                this.selectedCommand = null;
        });
    }

    public OnUnmounted()
    {
        this.subscription?.Unsubscribe();
    }
}