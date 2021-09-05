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
import * as fs from "fs";
import * as path from "path";

import { FileSystem, Promisify } from "acts-util-node";

import { BackupTask } from "srvmgr-api";

import { Injectable } from "acts-util-node";
import { ConfigManager } from "./ConfigManager";
import { CommandExecutor } from "./CommandExecutor";
import { ExternalConnectionManager } from "./ExternalConnectionManager";
import { TemporaryFilesService } from "./TemporaryFilesService";
import { PermissionsManager } from "./PermissionsManager";
import { POSIXAuthority } from "./POSIXAuthority";
import { TaskScheduler } from "./TaskScheduler";

interface BackupConfig
{
    backupTasks: BackupTask[];
}

const CONFIG_KEY = "backup";

@Injectable
export class BackupManager
{
    constructor(private cfgManager: ConfigManager, private commandExecutor: CommandExecutor, private externalConnectionManager: ExternalConnectionManager,
        private tempFilesService: TemporaryFilesService, private permissionsManager: PermissionsManager, private taskScheduler: TaskScheduler)
    {
        this.taskTimers = new Map;
    }

    //Properties
    public get tasks(): BackupTask[]
    {
        if(this.backupTasks === undefined)
            this.backupTasks = this.ReadConfig().backupTasks;
        return this.backupTasks;
    }

    //Public methods
    public Delete(backupName: string)
    {        
        const srcIdx = this.tasks.findIndex( task => task.name === backupName );
        this.StopAutomaticBackupTask(this.tasks[srcIdx]);
        this.tasks.Remove(srcIdx);
        
        this.WriteConfig();
        
        this.Schedule();
    }

    public async ListBackupFileNames(backupName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return (await this.ListSortedFiles(task, connection)).map(entry => {
            return {
                fileName: path.basename(entry.fileName)
            }
        });
    }

    public ReadBackupFile(backupName: string, fileName: string)
    {
        const task = this.tasks.find(t => t.name === backupName);
        if(task === undefined)
            return undefined;
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);

        return connection.ReadFile( path.join(task.path, fileName) );
    }
    
    public async RunBackup(backupName: string, session: POSIXAuthority)
    {
        const task = this.tasks.find(task => task.name === backupName)!;
        this.StopAutomaticBackupTask(task);
        await this.IssueBackupJob( task, session);
        this.Schedule();
    }

    public SetBackup(originalName: string | undefined, backup: BackupTask)
    {
        //check if target exists
        if( (originalName !== undefined) && (originalName !== backup.name) && (this.tasks.find( task => task.name === backup.name ) !== undefined) )
            return false;

        //delete old
        if(originalName !== undefined)
        {
            const srcIdx = this.tasks.findIndex( task => task.name === originalName );
            this.StopAutomaticBackupTask(this.tasks[srcIdx]);
            this.tasks.Remove(srcIdx);
        }

        //set new
        this.tasks.push(backup);
        this.WriteConfig();

        this.Schedule();

        return true;
    }

    public Schedule()
    {
        for (const task of this.tasks)
        {
            if(task.enabled && !this.taskTimers.has(task))
            {
                const timerId = this.taskScheduler.RepeatWithStartTime(task.lastBackupTime, task.interval, () => this.IssueBackupJob(task, this.permissionsManager.root), "backup job" );
                this.taskTimers.set(task, timerId);
            }
        }
    }

    //Private members
    private backupTasks?: BackupTask[];
    private taskTimers: Map<BackupTask, number>;

    //Private methods
    private async DeleteOldBackups(task: BackupTask, connection: FileSystem)
    {
        if(task.numberOfBackupsLimit === undefined)
            return;

        const bkpFiles = (await this.ListSortedFiles(task, connection)).map(entry => entry.fileName);
        for(let i = 0; i < bkpFiles.length - task.numberOfBackupsLimit; i++)
        {
            await connection.DeleteFile(path.join(task.path, bkpFiles[i]));
        }
    }

    private async IssueBackupJob(task: BackupTask, session: POSIXAuthority)
    {
        const taskCopy = task.DeepClone(); //copy so that task can be changed, deleted whatever, while being executed
        const now = new Date(Date.now());
        await this.PerformBackup(taskCopy, now, session);
        task.lastBackupTime = now;
        this.UpdateBackup(task);
    }

    private async ListSortedFiles(task: BackupTask, connection: FileSystem)
    {
        const bkpFiles = (await connection.ListDirectoryContents(task.path));
        bkpFiles.sort( (a, b) => a.fileName.localeCompare(b.fileName, "en", { sensitivity: "base" }) );

        return bkpFiles;
    }

    private async PerformBackup(task: BackupTask, backupTime: Date, session: POSIXAuthority)
    {
        const root = this.permissionsManager.Sudo(session.uid);

        //create directories
        const tmpDir = await this.tempFilesService.CreateTempDirectory();
        const bkpDir = path.join(tmpDir, "data");
        fs.mkdirSync(bkpDir);

        //do all steps in scope
        if("mysql" in task.scope)
        {
            const exitCode = await this.commandExecutor.ExecuteCommandExitCodeOnly(
                ["mysqldump", "-u", "root", "--all-databases", ">", bkpDir, "/mysql.sql"], root);
            if(exitCode != 0)
                throw new Error("mysqldump failed with exit code: " + exitCode);
        }

        //compress to zip
        const bkpFileName = "bkp" + backupTime.toISOString() + ".zip";
        await this.commandExecutor.ExecuteCommandExitCodeOnly(["zip", "-9", "-r", bkpFileName, "data", "/etc/ServerManager.json"], { workingDirectory: tmpDir, gid: root.gid, uid: root.uid });

        //ensure that path exists
        const connection = this.externalConnectionManager.OpenConnection(task.connectionName);
        if(!(await connection.Exists(task.path)))
            await connection.CreateDirectory(task.path);

        //pass zip to storage
        const pipe = fs.createReadStream(path.join(tmpDir, bkpFileName)).pipe(connection.WriteFile(path.join(task.path, bkpFileName)));
        await Promisify(pipe);

        //cleanup
        this.tempFilesService.CleanUp(tmpDir, session);

        await this.DeleteOldBackups(task, connection);
    }

    private ReadConfig(): BackupConfig
    {
        const obj = this.cfgManager.Get<any>(CONFIG_KEY);
        if(obj === undefined)
            return {
                backupTasks: []
            };
        obj.backupTasks.forEach( (task: any) => task.lastBackupTime = new Date(task.lastBackupTime));
        return obj;
    }

    private StopAutomaticBackupTask(backupTask: BackupTask)
    {
        if(this.taskTimers.has(backupTask))
        {
            this.taskScheduler.Stop(this.taskTimers.get(backupTask)!);
            this.taskTimers.delete(backupTask);
        }
    }

    private UpdateBackup(task: BackupTask)
    {
        this.SetBackup(task.name, task);
    }

    private WriteConfig()
    {
        const cfg: BackupConfig = {
            backupTasks: this.tasks
        };
        this.cfgManager.Set(CONFIG_KEY, cfg);
    }
}