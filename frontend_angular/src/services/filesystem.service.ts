import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DirectoryContents } from 'src/model/DirectoryContents';

@Injectable({
  providedIn: 'root'
})
export class FilesystemService
{
  constructor(private http: HttpClient) { }

  //Public methods
  public ListDirectoryContents(path: string): Promise<DirectoryContents>
  {
    return this.http.get<DirectoryContents>('http://localhost:8080/listDir/' + encodeURIComponent(path)).toPromise();
  }
}
