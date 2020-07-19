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

import { Apache } from "srvmgr-api";
import { Dictionary } from "acts-util-core";

export class VirtualHost
{
    constructor(addresses: string, properties: Apache.VirtualHostProperties)
    {
        this._addresses = addresses;
        this._properties = properties;
    }

    //Properties
    public get addresses()
    {
        return this._addresses;
    }
    
    public get properties()
    {
        return this._properties;
    }

    //Public methods
    public ToConfigString()
    {
        let result = `<VirtualHost ${this._addresses}>
    ServerAdmin ${this._properties.serverAdmin}
    DocumentRoot ${this._properties.documentRoot}
    
    ErrorLog ${this._properties.errorLog}
    CustomLog ${this._properties.customLog}\n`;

        if(this._properties.mod_ssl !== undefined)
        {
            result += "\tSSLEngine on\n";
            result += "\tSSLCertificateFile " + this._properties.mod_ssl.certificateFile + "\n";
            result += "\tSSLCertificateKeyFile " + this._properties.mod_ssl.keyFile + "\n";
        }

        result += `
</VirtualHost>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
`;
        return result;
    }

    //Class functions
    public static Default(addresses: string, serverAdmin: string)
    {
        return new VirtualHost(addresses, {
            serverAdmin,
            documentRoot: "/usr/local/apache/htdocs",
            errorLog: "${APACHE_LOG_DIR}/error.log",
            customLog: "${APACHE_LOG_DIR}/access.log combined",
        });
    }

    public static FromConfigObject(addresses: string, properties: Dictionary<string>)
    {
        const vh = this.Default(addresses, properties.ServerAdmin!);
        const p = vh.properties;

        p.serverAdmin = properties.ServerAdmin!;
        p.documentRoot = properties.DocumentRoot!;
        p.errorLog = properties.ErrorLog!;
        p.customLog = properties.CustomLog!;

        if(properties.SSLEngine === "on")
        {
            p.mod_ssl = {
                certificateFile: properties.SSLCertificateFile!,
                keyFile: properties.SSLCertificateKeyFile!
            };
        }

        return vh;
    }

    //Private members
    private _addresses: string;
    private _properties: Apache.VirtualHostProperties;
}