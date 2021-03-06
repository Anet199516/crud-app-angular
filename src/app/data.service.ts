import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  public first: string = '';
  public prev: string = '';
  public next: string = '';
  public last: string = '';

  private REST_API_SERVER = 'http://localhost:3000/products';

  constructor(private httpClient: HttpClient) {
  }

  handleError(error: HttpErrorResponse): any {
    let errorMessage = 'Unknown error';
    if (error.error instanceof ErrorEvent) {
      // Client-side errors
      errorMessage = `Error: ${error.error.message}`
    } else {
      // server-side errors
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    window.alert(errorMessage);
    return throwError(errorMessage);
  }

  parseLinkHeader(header) {
    if (header.length === 0) { // header is string
      return;
    }

    let parts = header.split(','); // parts is array of string
    let links = {};
    parts.forEach(p => {
      let section = p.split(';'); // section is array
      let url = section[0].replace(/<(.*)>/, '$1').trim();
      let name = section[1].replace(/rel="(.*)"/, '$1').trim();
      links[name] = url; // Filled the object with data
    });

    this.first = links['first'];
    this.last = links['last'];
    this.prev = links['prev'];
    this.next = links['next'];
  }

  public sendGetRequest() {
    const options = {params: new HttpParams({fromString: '_page=1&_limit=20'})};  // This tells to returns the first page of 20 products.
    return this.httpClient.get<Product[]>(this.REST_API_SERVER,
      {params: new HttpParams({fromString: '_page=1&_limit=20'}),
        observe: 'response'}).pipe(retry(3), catchError(this.handleError)); // observe 'response' give us full response with header
  }

  public sendGetRequestToUrl(url: string){
    return this.httpClient.get<Product[]>(url, { observe: "response"}).pipe(retry(3), catchError(this.handleError), tap((res: HttpResponse<any>) => {
      console.log(res.headers.get('Link'));
      this.parseLinkHeader(res.headers.get('Link'));

    }));
  }
}
