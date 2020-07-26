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

import { Component, RenderNode, Injectable, JSX_CreateElement, Textarea, ProgressSpinner } from "acfrontend";
import { Commands } from "srvmgr-api";
import { TerminalService } from "./TerminalService";

@Injectable
export class TerminalComponent extends Component
{
    input!: {
        command: Commands.CommandOverviewData;
    };

    constructor(private terminalService: TerminalService)
    {
        super();

        this.stderr = "";
        this.stdin = "";
        this.stdout = "";
        this.exitCode = undefined;
        this.subscribedPid = null;
    }

    protected Render(): RenderNode
    {
        return <fragment>
            <h2>{this.input.command.commandline}</h2>
            <div class="row evenly-spaced full-width">
                <div class="column">
                    Process Id: {this.input.command.pid}
                </div>
                <div class="column">
                    {this.exitCode === undefined ? <ProgressSpinner /> : "Exit code:" + this.exitCode}
                </div>
            </div>
            <div class="evenlySpacedRow">
                <div class="column">
                    <h3>stdout</h3>
                    <textarea cols="80" readonly rows="24">{this.stdout}</textarea>
                </div>
                <div class="column">
                    <h3>stderr</h3>
                    <textarea cols="80" readonly rows="24">{this.stderr}</textarea>
                </div>
            </div>
            <h3>stdin</h3>
            <div class="row">
                <Textarea value={this.stdin} onChanged={newValue => this.stdin = newValue} columns={160} rows={5} />
                <button type="button" onclick={this.OnSendData.bind(this)}>Send</button>
            </div>
        </fragment>;
    }

    //Private members
    private stderr: string;
    private stdin: string;
    private stdout: string;
    private exitCode: number | undefined;
    private subscribedPid: number | null;

    //Event handlers
    public OnInitiated()
    {
        this.exitCode = this.input.command.exitCode;
        this.terminalService.commandData.Subscribe({ next: data => {
            this.stderr = data.stderr;
            this.stdout = data.stdout;
            this.exitCode = data.exitCode;
        }});
        this.subscribedPid = this.input.command.pid;
        this.terminalService.SubscribeCommand(this.subscribedPid);
    }

    public OnInputChanged()
    {
        if( (this.subscribedPid !== this.input.command.pid) && (this.subscribedPid !== null))
            this.terminalService.UnsubscribeCommand(this.subscribedPid);
        this.subscribedPid = this.input.command.pid;
        this.terminalService.SubscribeCommand(this.subscribedPid);
    }

    private OnSendData()
    {
    }

    public OnUnmounted()
    {
        this.terminalService.UnsubscribeCommand(this.subscribedPid!);
    }
}