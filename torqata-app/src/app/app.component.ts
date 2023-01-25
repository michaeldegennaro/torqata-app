import { Component, AfterViewInit, ViewChild } from '@angular/core';
import { ApiService } from './api.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Chart } from 'node_modules/chart.js'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private api: ApiService){}
  
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  @ViewChild(MatSort) sort: MatSort | undefined;
  
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }
  ngOnInit(){
    this.getNet()
    this.dataSource.filterPredicate = this.createFilter();
  }

  ctx;
  config;
  chartData = [];
  chartDatalabels = ['Movies', 'TV Shows'];
  dataSource: any = new MatTableDataSource();
  displayedColumns = ['type', 'title', 'listed_in', 'release_year', 'description'];
  filterValues = {};
  filterSelectObj = [
    {
      name: 'Type',
      columnProp: 'type',
      options: ['Movie', 'TV Show'],
      modelValue: undefined
    }, {
      name: 'Title',
      columnProp: 'title',
      options: [],
      modelValue: undefined
    }, {
      name: 'Genre',
      columnProp: 'listed_in',
      options: ['Documentaries', 'Reality TV', 'Comedies', 'Action & Adventure', 'TV Dramas'],
      modelValue: undefined
    }, {
      name: 'Year',
      columnProp: 'release_year',
      options: ['Ascending', 'Descending'],
      modelValue: undefined
    }
  ]

  getFilterObject(fullObj, key) {
    const uniqChk = [];
    fullObj.filter((obj) => {
      if (!uniqChk.includes(obj[key])) {
        uniqChk.push(obj[key]);
      }
      return obj;
    });
    return uniqChk;
  }

  getNet() {
    this.api.getNet().subscribe(
      (data) => {
        console.log(data)
        this.dataSource.data = data;
        this.setPie(data)
      }
    );
  }
  
  setPie(data){
    let val = 0
    for(let i = 0; i < data.length; i++){
      data[i].type == 'Movie' ? val ++ : null
    }
    this.chartData.push(val)
    this.chartData.push(data.length - val)
    this.ctx = document.getElementById('myChart');
    this.config = {
      type : 'pie',
      options : {
      },
      data : {
        labels : this.chartDatalabels,
        datasets : [{ 
          label: 'Chart Data',
          data: this.chartData,
          borderWidth: 5,
          borderColor: 'grey',
          backgroundColor: ['pink', 'yellow','red']
      }],
      }
    }
    const myChart = new Chart(this.ctx, this.config);
  }

  filterChange(filter, event) {
    this.filterValues[filter.columnProp] = event.target.value.trim().toLowerCase()
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  createFilter() {
    let filterFunction = function (data , filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      console.log(searchTerms)
      for (const col in searchTerms) {
        if (searchTerms[col].toString() !== '') {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }

      console.log(searchTerms);

      let nameSearch = () => {
        let found = false;
        if (isFilterSet) {
          for (const col in searchTerms) {
            found = searchTerms[col].trim().toLowerCase().split(' ').every((word: String) => {
              if (data[col].toString().toLowerCase().indexOf(word) != -1 && isFilterSet) {
                return true
              } else {
                return false
              }
            });
            if(found == false){
              break
            }
          }
          return found
        } else {
          return true;
        }
      }
      return nameSearch()
    }
    return filterFunction
  }

  resetFilters() {
    this.filterValues = {}
    this.filterSelectObj.forEach((value, key) => {
      value.modelValue = undefined;
    })
    this.dataSource.filter = "";
  }
}


