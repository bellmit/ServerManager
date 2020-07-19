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

import { VirtualHost } from "./VirtualHost";
import { Dictionary } from "acts-util-core";

enum TokenType
{
    Identifier,
    Text,
    VirtualHostBegin,
    VirtualHostEnd,
}

interface Token
{
    type: TokenType;
    data: string;
}

export class ConfigParser
{
    constructor(private input: string)
    {
    }

    //Public methods
    public Parse()
    {
        return this.ParseNextTopLevelElement();
    }

    //Private methods
    private FetchNextToken(): Token
    {
        const vh = "<VirtualHost ";
        const vhEnd = "</VirtualHost>";

        this.input = this.input.trimLeft();

        if(this.input.startsWith(vh))
        {
            this.input = this.input.substring(vh.length);
            const pos = this.input.indexOf(">");
            const hostData = this.input.substring(0, pos).trim();
            this.input = this.input.substring(pos+1);

            return { type: TokenType.VirtualHostBegin, data: hostData };
        }

        if(this.input.startsWith(vhEnd))
        {
            this.input = this.input.substring(vhEnd.length);

            return { type: TokenType.VirtualHostEnd, data: "" };
        }

        const identifierMatch = this.input.match(/^[a-zA-Z]+[ \t]/);
        if(identifierMatch !== null)
        {
            this.input = this.input.substring(identifierMatch[0].length);
            return { type: TokenType.Identifier, data: identifierMatch[0].trimRight() };
        }

        const textMatch = this.input.match(/.+[ \t\n]/);
        const data = textMatch![0];
        this.input = this.input.substring(data.length);

        return { type: TokenType.Text, data: data.trimRight() };
    }

    private ParseNextTopLevelElement()
    {
        const token = this.FetchNextToken();

        switch(token.type)
        {
            case TokenType.VirtualHostBegin:
                return this.ParseVirtualHostBody(token.data);
            default:
                throw new Error("Method not implemented.");
        }
    }

    private ParseVirtualHostBody(address: string)
    {
        const data: Dictionary<string> = {};

        while(true)
        {
            const token = this.FetchNextToken();

            if(token.type === TokenType.Identifier)
            {
                const valueToken = this.FetchNextToken();
                if(valueToken.type !== TokenType.Text)
                    throw new Error("Wrong data: " + valueToken.data);

                data[token.data] = valueToken.data;
            }
            else if(token.type === TokenType.VirtualHostEnd)
                break;
            else
            {
                throw new Error("Method not implemented.");
            }
        }

        return VirtualHost.FromConfigObject(address, data);
    }
}