import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'enocdeURIComponent'
})
export class EnocdeURIComponentPipe implements PipeTransform {

  transform(value: string): any {
    return encodeURIComponent(value);
  }

}
