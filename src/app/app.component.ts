import { Component , ViewChild} from '@angular/core';
import { AngularFireDatabase, FirebaseListObservable } from 'angularfire2/database';
import { Chart } from 'chart.js';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Lab ';
  chartData = {};
  chartKeyData = []
   options: Object;
    @ViewChild('lineCanvas') lineCanvas;
    lineChart:any; 
    chartEnable:boolean = false;

 constructor(public db:AngularFireDatabase){
this.db.list('chartkey').subscribe(res=>{
      this.chartKeyData = res;
      console.log("chartKeyData---" + JSON.stringify(this.chartKeyData));
    })
 }
getChart(name){
  console.log(name + "name");
  this.db.object('chart/'+name).subscribe(res=>{
      this.chartData = res;
      var year =[];
      var score = []; 
      for (var i =0; i<res.length;i++) {
         year.push(res[i].year);
         score.push(res[i].score);
      }
      this.lineChart = this.chartDatas(year,score);
      console.log("data---" + JSON.stringify(res));
    })
}

chartDatas(year,score){
  var data= {
    labels: year,
    datasets: [
      {
        label: '# of Scores',
        data: score,
        borderWidth: 1
      }
    ]
  }
   var options= {
    scales: {
      yAxes: [{
        ticks: {
          reverse: false
        }
      }]
    }
  }
   return this.getCharts(this.lineCanvas.nativeElement, "line", data, options);
}

getCharts(context, chartType, data, options?) {
  this.chartEnable = true;
   return new Chart(context, {
     type: chartType,
     data: data,
     options: options
   });
 }

convertFile(){
    const input:any = document.getElementById('fileInput');
    const reader = new FileReader();
    reader.onload = () => {
      let text = reader.result;
      console.log('CSV: ', text);
      let data = this.csvJSON(text);
      this.db.object('chart').update(data.obj).then(res=>{
        console.log("done");
      })
        this.db.object('chartkey').update(data.chartKey).then(res=>{
        console.log("done");
     })

    };
    reader.readAsText(input.files[0]);
};


//var csv is the CSV file with headers
csvJSON(csv){
var   obj = {};
var chartKey = [];
  var lines=csv.split("\n");
  for (var i =0; i<lines.length;i++) {
        var header = lines[i].split(",");
        chartKey.push({name:header[0]})
        obj[header[0]] = [];
   
  }
  if(Object.keys(obj).length == 4){
  for (var key in obj) {
   if (obj.hasOwnProperty(key)) {
       for (var i =0; i<lines.length;i++) {
        var header = lines[i].split(",");
          for (var j =1; j<header.length;j++) {
                var data = header[j].split("|");
                if(Object.keys(obj).indexOf(key) == i){
               obj[key].push({year:data[0],score:data[1]})
             }
          }
      }
   }
 } 
}
var chart = {obj:obj,chartKey:chartKey}
return chart;
}



}
