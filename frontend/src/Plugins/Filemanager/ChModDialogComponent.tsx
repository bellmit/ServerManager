/**
 * ServerManager
 * Copyright (C) 2022 Amir Czwink (amir130@hotmail.de)
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

import { CheckBox, Component, DialogRef, Injectable, JSX_CreateElement, LineEdit } from "acfrontend";

class RightsComponent extends Component<{ header: string; mode: number; shiftAmount: number; onModeChanged: (newMode: number) => void }>
{
    protected Render(): RenderValue
    {
        return <table>
            <tr>
                <th>{this.input.header}</th>
            </tr>
            <tr>
                <label class=""><CheckBox value={this.IsBitSet(4)} onChanged={this.OnToggleBit.bind(this, 4)} /> read / list</label>
            </tr>
            <tr>
                <label class=""><CheckBox value={this.IsBitSet(2)} onChanged={this.OnToggleBit.bind(this, 2)} /> write / modify</label>
            </tr>
            <tr>
                <label class=""><CheckBox value={this.IsBitSet(1)} onChanged={this.OnToggleBit.bind(this, 1)} /> execute / access</label>
            </tr>
        </table>;
    }

    //Private methods
    private IsBitSet(bit: number)
    {
        return ((this.input.mode >> this.input.shiftAmount) & bit) != 0;
    }

    //Event handlers
    private OnToggleBit(bit: number)
    {
        const mask = bit << this.input.shiftAmount;
        const newMode = this.IsBitSet(bit) ? (this.input.mode & ~mask) : (this.input.mode | mask);
        this.input.onModeChanged(newMode);
    }
}

@Injectable
export class ChModDialogComponent extends Component<{ mode: number; onModeChanged: (newMode: number) => void; onRecursiveChanged: (newRecursive: boolean) => void; allowRecursive: boolean; }>
{
    constructor(private dialogRef: DialogRef)
    {
        super();

        this.mode = 0;
        this.recursive = false;
    }
    
    protected Render(): RenderValue
    {
        return <fragment>
            Mode: <LineEdit value={this.mode.toString(8)} onChanged={this.OnModeChanged.bind(this)} />
            <div class="row">
                <div class="column"><RightsComponent header={"Owner"} mode={this.mode} shiftAmount={6} onModeChanged={this.OnModeChangedViaCheckBox.bind(this)} /></div>
                <div class="column"><RightsComponent header={"Group"} mode={this.mode} shiftAmount={3} onModeChanged={this.OnModeChangedViaCheckBox.bind(this)} /></div>
                <div class="column"><RightsComponent header={"Others"} mode={this.mode} shiftAmount={0} onModeChanged={this.OnModeChangedViaCheckBox.bind(this)} /></div>
            </div>
            {this.RenderRecursive()}
        </fragment>;
    }

    //Private members
    private mode: number;
    private recursive: boolean;

    //Private methods
    private RenderRecursive()
    {
        if(!this.input.allowRecursive)
            return null;
        return <fragment>
            Recursive: <CheckBox value={this.recursive} onChanged={this.OnRecursiveChanged.bind(this)} />
        </fragment>;
    }

    //Event handlers
    public OnInitiated()
    {
        this.mode = this.input.mode;

        this.dialogRef.onAccept.Subscribe( () => this.dialogRef.Close() );
    }

    private OnModeChanged(newValue: string)
    {
        this.mode = parseInt(newValue, 8);
        this.input.onModeChanged(this.mode);
    }

    private OnModeChangedViaCheckBox(newMode: number)
    {
        this.mode = newMode;
        this.input.onModeChanged(this.mode);
    }

    private OnRecursiveChanged(newValue: boolean)
    {
        this.recursive = newValue;
        this.input.onRecursiveChanged(newValue);
    }
}