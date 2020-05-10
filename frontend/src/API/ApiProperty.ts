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
import { PropertyObserver } from "acts-util-core";

import { ApiObservable } from "./ApiObservable";

export class ApiProperty<T>
{
    constructor(updateMessage: string)
    {
        this.waiter = new Promise<void>( resolve => {
            if(this.resolver === undefined)
                this.resolver = resolve;
            if(this.value !== undefined)
                resolve();
        });

        this.observable = new ApiObservable<T|undefined>(undefined, updateMessage);
        this.observable.Subscribe(this.OnReceiveValue.bind(this));
    }

    //Public methods
    public async Get(): Promise<T>
    {
        await this.waiter;
        return this.value!;
    }

    public Subscribe(observer: PropertyObserver<T>)
    {
        return this.observable.Subscribe( newValue => {
            if(newValue !== undefined)
                observer(newValue);
        });
    }

    public WaitingForValue()
    {
        return this.value === undefined;
    }

    //Private members
    private value: T|undefined;
    private waiter: Promise<void>;
    private resolver: Function|undefined;
    private observable: ApiObservable<T|undefined>;

    //Event handlers
    private OnReceiveValue(newValue: T|undefined)
    {
        this.value = newValue;
        if(this.value !== undefined)
            this.resolver!();
    }
}